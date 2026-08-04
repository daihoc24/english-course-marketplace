package com.example.back_end.service;

import com.example.back_end.constant.PredefinedRole;
import com.example.back_end.dto.request.SellerPayoutAccountRequest;
import com.example.back_end.dto.request.SellerWalletTopUpRequest;
import com.example.back_end.dto.request.WithdrawalDecisionRequest;
import com.example.back_end.dto.request.WithdrawalRequestCreate;
import com.example.back_end.dto.response.AutoPayoutRunResponse;
import com.example.back_end.dto.response.SellerPayoutAccountResponse;
import com.example.back_end.dto.response.SellerWalletTransactionResponse;
import com.example.back_end.dto.response.SellerWalletSummaryResponse;
import com.example.back_end.dto.response.WithdrawalRequestResponse;
import com.example.back_end.entity.Course;
import com.example.back_end.entity.Order;
import com.example.back_end.entity.RefundRequest;
import com.example.back_end.entity.SellerPayoutAccount;
import com.example.back_end.entity.SellerWalletTransaction;
import com.example.back_end.entity.User;
import com.example.back_end.entity.WithdrawalRequest;
import com.example.back_end.repositories.OrderRepository;
import com.example.back_end.repositories.RefundRequestRepository;
import com.example.back_end.repositories.SellerPayoutAccountRepository;
import com.example.back_end.repositories.SellerWalletTransactionRepository;
import com.example.back_end.repositories.UserRepository;
import com.example.back_end.repositories.WithdrawalRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class WithdrawalService {
    private static final long MIN_PAYOUT_AMOUNT = 10_000L;
    private static final List<String> RESERVED_STATUSES = List.of(
            "PENDING", "PROCESSING", "PAID", "APPROVED", "REQUIRES_ATTENTION"
    );
    private static final List<String> OPEN_WORK_STATUSES = List.of("PENDING", "PROCESSING", "REQUIRES_ATTENTION");
    private static final List<String> OPEN_REFUND_STATUSES = List.of("PENDING", "REQUIRES_ATTENTION");

    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RefundRequestRepository refundRequestRepository;
    private final SellerPayoutAccountRepository sellerPayoutAccountRepository;
    private final SellerWalletTransactionRepository sellerWalletTransactionRepository;
    private final NotificationService notificationService;

    @Value("${app.payout.auto-enabled:false}")
    private boolean autoPayoutEnabled;

    @Transactional(readOnly = true)
    public List<WithdrawalRequestResponse> sellerRequests(Integer sellerId) {
        return withdrawalRequestRepository.findAllBySellerIdOrderByRequestedAtDesc(sellerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<WithdrawalRequestResponse> sellerRequests(Integer sellerId, String status, String keyword, Pageable pageable) {
        ensureSellerAccess(currentUser(), sellerId);
        return withdrawalRequestRepository.searchSellerWithdrawalRequests(
                        sellerId,
                        normalizeStatusFilter(status),
                        normalizeKeyword(keyword),
                        pageable
                )
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<SellerWalletTransactionResponse> walletTransactions(Integer sellerId) {
        User current = currentUser();
        ensureSellerAccess(current, sellerId);
        return sellerWalletTransactionRepository.findAllBySeller_IdOrderByCreatedAtDesc(sellerId)
                .stream()
                .map(this::toWalletTransactionResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<SellerWalletTransactionResponse> walletTransactions(
            Integer sellerId,
            String status,
            String type,
            String keyword,
            Pageable pageable
    ) {
        User current = currentUser();
        ensureSellerAccess(current, sellerId);
        return sellerWalletTransactionRepository.searchSellerTransactions(
                        sellerId,
                        normalizeStatusFilter(status),
                        normalizeStatusFilter(type),
                        normalizeKeyword(keyword),
                        pageable
                )
                .map(this::toWalletTransactionResponse);
    }

    @Transactional(readOnly = true)
    public SellerWalletSummaryResponse walletSummary(Integer sellerId) {
        User current = currentUser();
        ensureSellerAccess(current, sellerId);
        long totalRevenue = paidRevenueAmount(sellerId);
        long walletTopUpAmount = completedTopUps(sellerId);
        long grossWalletAmount = totalRevenue + walletTopUpAmount;
        long paidOutAmount = nullableLong(withdrawalRequestRepository.sumAmountBySellerIdAndStatuses(
                sellerId,
                List.of("PAID", "APPROVED")
        ));
        long inFlightAmount = nullableLong(withdrawalRequestRepository.sumAmountBySellerIdAndStatuses(
                sellerId,
                OPEN_WORK_STATUSES
        ));
        long refundHoldAmount = pendingRefundHold(sellerId);
        long walletBalance = Math.max(0L, grossWalletAmount - paidOutAmount);
        long availableBalance = Math.max(0L, walletBalance - inFlightAmount - refundHoldAmount);
        long attentionCount = withdrawalRequestRepository.countBySeller_IdAndStatus(sellerId, "REQUIRES_ATTENTION")
                + refundRequestRepository.countByOrder_IdCourse_SellerIdAndStatus(sellerId, "REQUIRES_ATTENTION");
        long openRefundCount = refundRequestRepository.countByOrder_IdCourse_SellerIdAndStatusIn(sellerId, OPEN_REFUND_STATUSES);

        return SellerWalletSummaryResponse.builder()
                .totalRevenueVnd(totalRevenue)
                .walletTopUpAmountVnd(walletTopUpAmount)
                .grossWalletAmountVnd(grossWalletAmount)
                .paidOutAmountVnd(paidOutAmount)
                .inFlightAmountVnd(inFlightAmount)
                .refundHoldAmountVnd(refundHoldAmount)
                .walletBalanceVnd(walletBalance)
                .availableBalanceVnd(availableBalance)
                .attentionCount(attentionCount)
                .openRefundCount(openRefundCount)
                .build();
    }

    @Transactional
    public SellerWalletTransactionResponse topUpWalletDemo(Integer sellerId, SellerWalletTopUpRequest request) {
        User current = currentUser();
        ensureSellerAccess(current, sellerId);
        User seller = seller(sellerId);
        long amount = request.getAmountVnd() == null ? 0L : request.getAmountVnd();
        if (amount < MIN_PAYOUT_AMOUNT) {
            throw new IllegalArgumentException("Số tiền nạp tối thiểu là 10.000 VND");
        }

        SellerWalletTransaction transaction = new SellerWalletTransaction();
        transaction.setSeller(seller);
        transaction.setType("TOP_UP");
        transaction.setAmountVnd(amount);
        transaction.setStatus("COMPLETED");
        transaction.setProvider("DEMO_BANK");
        transaction.setReference("WALLET-DEMO-" + sellerId + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT));
        transaction.setDescription(trimToNull(request.getNote()) == null
                ? "Nạp tiền demo vào ví người bán"
                : trimToNull(request.getNote()));
        transaction.setCreatedAt(LocalDateTime.now());

        SellerWalletTransaction saved = sellerWalletTransactionRepository.save(transaction);
        notificationService.notifyUser(
                seller.getId(),
                current.getId(),
                "SELLER_WALLET_TOP_UP",
                "Ví người bán vừa được nạp tiền",
                "Hệ thống đã ghi nhận nạp " + amount + " VND vào ví người bán demo của bạn.",
                "/seller/dashboard?tab=withdraw"
        );
        return toWalletTransactionResponse(saved);
    }

    @Transactional(readOnly = true)
    public SellerPayoutAccountResponse payoutAccount(Integer sellerId) {
        User current = currentUser();
        ensureSellerAccess(current, sellerId);
        return sellerPayoutAccountRepository.findBySeller_Id(sellerId)
                .map(this::toPayoutAccountResponse)
                .orElse(null);
    }

    @Transactional
    public SellerPayoutAccountResponse savePayoutAccount(Integer sellerId, SellerPayoutAccountRequest request) {
        User current = currentUser();
        ensureSellerAccess(current, sellerId);
        User seller = seller(sellerId);
        SellerPayoutAccount account = sellerPayoutAccountRepository.findBySeller_Id(sellerId)
                .orElseGet(SellerPayoutAccount::new);

        account.setSeller(seller);
        account.setMethod(normalize(request.getMethod(), "BANK"));
        account.setBankName(trimToNull(request.getBankName()));
        account.setAccountName(trimRequired(request.getAccountName(), "Vui lòng nhập tên chủ tài khoản"));
        account.setAccountNumber(trimRequired(request.getAccountNumber(), "Vui lòng nhập số tài khoản hoặc email PayPal"));
        account.setStatus("VERIFIED");
        account.setDemoMode(true);
        validatePayoutAccount(account);

        SellerPayoutAccount saved = sellerPayoutAccountRepository.save(account);
        if (!current.getId().equals(sellerId)) {
            notificationService.notifyUser(
                    sellerId,
                    current.getId(),
                    "PAYOUT_ACCOUNT_UPDATED",
                    "Tài khoản nhận tiền đã được cập nhật",
                    "Admin đã cập nhật tài khoản nhận tiền demo của bạn.",
                    "/seller/dashboard?tab=withdraw"
            );
        }
        return toPayoutAccountResponse(saved);
    }

    @Transactional
    public SellerPayoutAccountResponse createDemoPayoutAccount(Integer sellerId) {
        User current = currentUser();
        ensureSellerAccess(current, sellerId);
        User seller = seller(sellerId);
        SellerPayoutAccount account = sellerPayoutAccountRepository.findBySeller_Id(sellerId)
                .orElseGet(SellerPayoutAccount::new);
        account.setSeller(seller);
        account.setMethod("BANK");
        account.setBankName("MB Bank Demo");
        account.setAccountName(seller.getFullname().toUpperCase(Locale.ROOT));
        account.setAccountNumber("9704" + String.format("%08d", sellerId));
        account.setStatus("VERIFIED");
        account.setDemoMode(true);
        return toPayoutAccountResponse(sellerPayoutAccountRepository.save(account));
    }

    @Transactional
    public WithdrawalRequestResponse create(Integer sellerId, WithdrawalRequestCreate request) {
        User current = currentUser();
        ensureSellerAccess(current, sellerId);

        User seller = seller(sellerId);
        if (!Boolean.TRUE.equals(seller.getActive())) {
            throw new IllegalArgumentException("Tài khoản người bán đang bị khóa, chưa thể tạo yêu cầu rút tiền");
        }
        long amount = request.getAmountVnd() == null ? 0L : request.getAmountVnd();
        if (amount < MIN_PAYOUT_AMOUNT) {
            throw new IllegalArgumentException("So tien rut toi thieu la 10.000 VND");
        }
        long available = availableBalance(sellerId);
        if (amount > available) {
            throw new IllegalArgumentException("Số dư khả dụng không đủ để tạo yêu cầu rút tiền");
        }

        WithdrawalRequest withdrawal = new WithdrawalRequest();
        withdrawal.setSeller(seller);
        withdrawal.setAmountVnd(amount);
        String method = normalize(request.getMethod(), "BANK");
        if ("BANK".equals(method) && trimToNull(request.getBankName()) == null) {
            throw new IllegalArgumentException("Vui lòng nhập ngân hàng nhận tiền");
        }
        withdrawal.setMethod(method);
        withdrawal.setBankName(trimToNull(request.getBankName()));
        withdrawal.setAccountName(trimRequired(request.getAccountName(), "Vui lòng nhập tên chủ tài khoản"));
        withdrawal.setAccountNumber(trimRequired(request.getAccountNumber(), "Vui lòng nhập số tài khoản"));
        withdrawal.setNote(trimToNull(request.getNote()));
        withdrawal.setStatus("PENDING");
        withdrawal.setSource("MANUAL");
        withdrawal.setRequestedAt(LocalDateTime.now());

        WithdrawalRequest saved = withdrawalRequestRepository.save(withdrawal);
        notificationService.notifyUsers(
                userRepository.findActiveUsersByRoleName(PredefinedRole.ADMIN_ROLE),
                seller.getId(),
                "WITHDRAWAL_REQUESTED",
                "Yêu cầu rút tiền mới",
                seller.getFullname() + " đã gửi yêu cầu rút " + amount + " VND.",
                "/admin/withdrawals"
        );
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<WithdrawalRequestResponse> all() {
        return withdrawalRequestRepository.findAllWithUsersOrderByRequestedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<WithdrawalRequestResponse> all(String status, String keyword, Pageable pageable) {
        return withdrawalRequestRepository.searchAdminWithdrawalRequests(
                        normalizeStatusFilter(status),
                        normalizeKeyword(keyword),
                        pageable
                )
                .map(this::toResponse);
    }

    @Transactional
    public WithdrawalRequestResponse decide(Long id, WithdrawalDecisionRequest request) {
        WithdrawalRequest withdrawal = withdrawalRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu rút tiền"));
        if (!List.of("PENDING", "PROCESSING", "REQUIRES_ATTENTION").contains(withdrawal.getStatus())) {
            throw new IllegalArgumentException("Yêu cầu rút tiền này đã được xử lý");
        }

        User admin = currentUser();
        String decision = normalize(request.getDecision(), "REJECTED");
        boolean paid = "PAID".equals(decision) || "APPROVED".equals(decision);
        boolean failed = "FAILED".equals(decision);

        if (paid) {
            hydrateDestinationFromSellerAccount(withdrawal);
            validateWithdrawalDestination(withdrawal);
        }

        boolean reservesBalance = RESERVED_STATUSES.contains(withdrawal.getStatus());
        long availableForThisRequest = availableBalance(withdrawal.getSeller().getId())
                + (reservesBalance ? withdrawal.getAmountVnd() : 0L);
        if (paid && withdrawal.getAmountVnd() > availableForThisRequest) {
            throw new IllegalArgumentException("Số dư khả dụng của người bán không còn đủ để chi trả yêu cầu này");
        }

        String adminNote = trimToNull(request.getAdminNote());
        withdrawal.setStatus(paid ? "PAID" : failed ? "FAILED" : "REJECTED");
        withdrawal.setFailureReason(paid ? null : adminNote);
        withdrawal.setAdminNote(paid ? virtualTransferNote(withdrawal, adminNote) : adminNote);
        withdrawal.setReviewedAt(LocalDateTime.now());
        withdrawal.setReviewer(admin);

        notifySellerPayoutDecision(withdrawal, admin, paid, failed);
        return toResponse(withdrawal);
    }

    @Transactional
    public AutoPayoutRunResponse runAutoPayout() {
        return runAutoPayout(currentUser());
    }

    @Scheduled(cron = "${app.payout.auto-cron:0 0 2 * * *}", zone = "${app.payout.auto-zone:Asia/Ho_Chi_Minh}")
    @Transactional
    public void scheduledAutoPayout() {
        if (!autoPayoutEnabled) {
            return;
        }
        runAutoPayout(null);
    }

    private AutoPayoutRunResponse runAutoPayout(User actor) {
        List<Integer> sellerIds = orderRepository.findDistinctSellerIdsWithPaidOrders();
        List<WithdrawalRequestResponse> paidPayouts = new ArrayList<>();
        List<WithdrawalRequestResponse> exceptions = new ArrayList<>();
        int skipped = 0;
        long totalPaid = 0L;

        for (Integer sellerId : sellerIds) {
            User seller = userRepository.findById(sellerId).orElse(null);
            if (seller == null) {
                skipped++;
                continue;
            }

            long available = availableBalance(sellerId);
            if (available < MIN_PAYOUT_AMOUNT) {
                skipped++;
                continue;
            }

            if (withdrawalRequestRepository.existsBySeller_IdAndStatusIn(sellerId, OPEN_WORK_STATUSES)) {
                skipped++;
                continue;
            }

            SellerPayoutAccount account = sellerPayoutAccountRepository.findBySeller_Id(sellerId).orElse(null);
            String problem = autoPayoutProblem(seller, account);
            WithdrawalRequestResponse response = problem == null
                    ? createPaidAutoPayout(seller, account, available, actor)
                    : createPayoutException(seller, account, available, problem, actor);

            if (problem == null) {
                paidPayouts.add(response);
                totalPaid += available;
            } else {
                exceptions.add(response);
            }
        }

        return new AutoPayoutRunResponse(
                sellerIds.size(),
                paidPayouts.size(),
                exceptions.size(),
                skipped,
                totalPaid,
                paidPayouts,
                exceptions
        );
    }

    private WithdrawalRequestResponse createPaidAutoPayout(User seller, SellerPayoutAccount account, long amount, User actor) {
        WithdrawalRequest withdrawal = baseAutoWithdrawal(seller, account, amount);
        withdrawal.setStatus("PAID");
        withdrawal.setReviewedAt(LocalDateTime.now());
        withdrawal.setReviewer(actor);
        WithdrawalRequest saved = withdrawalRequestRepository.save(withdrawal);
        saved.setAdminNote(virtualTransferNote(saved, "Chi trả tự động demo - đã đạt điều kiện"));

        notificationService.notifyUser(
                seller.getId(),
                actor == null ? null : actor.getId(),
                "AUTO_PAYOUT_PAID",
                "Chi trả tự động đã hoàn tất",
                "Hệ thống đã ghi nhận chi trả tự động " + amount + " VND vào tài khoản nhận tiền demo của bạn.",
                "/seller/dashboard?tab=withdraw"
        );
        return toResponse(saved);
    }

    private WithdrawalRequestResponse createPayoutException(User seller, SellerPayoutAccount account, long amount, String problem, User actor) {
        WithdrawalRequest withdrawal = baseAutoWithdrawal(seller, account, amount);
        withdrawal.setStatus("REQUIRES_ATTENTION");
        withdrawal.setFailureReason(problem);
        withdrawal.setAdminNote(problem);
        WithdrawalRequest saved = withdrawalRequestRepository.save(withdrawal);

        notificationService.notifyUsers(
                userRepository.findActiveUsersByRoleName(PredefinedRole.ADMIN_ROLE),
                actor == null ? null : actor.getId(),
                "AUTO_PAYOUT_EXCEPTION",
                "Chi trả tự động cần xử lý",
                seller.getFullname() + " có khoản chi trả " + amount + " VND cần admin kiểm tra: " + problem,
                "/admin/withdrawals?status=REQUIRES_ATTENTION"
        );
        notificationService.notifyUser(
                seller.getId(),
                actor == null ? null : actor.getId(),
                "AUTO_PAYOUT_REQUIRES_ATTENTION",
                "Chi trả tự động cần bổ sung thông tin",
                "Khoản chi trả của bạn chưa thể xử lý tự động: " + problem,
                "/seller/dashboard?tab=withdraw"
        );
        return toResponse(saved);
    }

    private WithdrawalRequest baseAutoWithdrawal(User seller, SellerPayoutAccount account, long amount) {
        WithdrawalRequest withdrawal = new WithdrawalRequest();
        withdrawal.setSeller(seller);
        withdrawal.setAmountVnd(amount);
        withdrawal.setMethod(account == null ? "BANK" : account.getMethod());
        withdrawal.setBankName(account == null ? null : account.getBankName());
        withdrawal.setAccountName(account == null ? null : account.getAccountName());
        withdrawal.setAccountNumber(account == null ? null : account.getAccountNumber());
        withdrawal.setNote("Chi trả tự động demo");
        withdrawal.setSource("AUTO");
        withdrawal.setRequestedAt(LocalDateTime.now());
        return withdrawal;
    }

    private String autoPayoutProblem(User seller, SellerPayoutAccount account) {
        List<String> problems = new ArrayList<>();
        if (!Boolean.TRUE.equals(seller.getActive())) {
            problems.add("Tài khoản người bán đang bị khóa");
        }
        if (account == null) {
            problems.add("Người bán chưa cấu hình tài khoản nhận tiền demo");
        } else {
            if (!"VERIFIED".equals(account.getStatus())) {
                problems.add("Tài khoản nhận tiền chưa được xác minh");
            }
            try {
                validatePayoutAccount(account);
            } catch (IllegalArgumentException exception) {
                problems.add("Thông tin nhận tiền chưa hợp lệ: " + exception.getMessage());
            }
        }
        if (refundRequestRepository.existsByOrder_IdCourse_SellerIdAndStatusIn(seller.getId(), OPEN_REFUND_STATUSES)) {
            problems.add("Người bán đang có yêu cầu hoàn tiền hoặc khiếu nại đang mở");
        }
        return problems.isEmpty() ? null : String.join("; ", problems);
    }

    private void notifySellerPayoutDecision(WithdrawalRequest withdrawal, User admin, boolean paid, boolean failed) {
        String notificationType = paid ? "WITHDRAWAL_PAID"
                : failed ? "WITHDRAWAL_FAILED" : "WITHDRAWAL_REJECTED";
        String notificationTitle = paid ? "Khoản chi trả đã hoàn tất"
                : failed ? "Khoản chi trả thất bại" : "Yêu cầu rút tiền chưa được xử lý";
        String notificationMessage = paid
                ? "Bộ phận thanh toán đã ghi nhận chi trả cho bạn."
                : failed
                ? "Khoản chi trả chưa hoàn tất. Vui lòng xem ghi chú xử lý và cập nhật thông tin nhận tiền nếu cần."
                : "Bộ phận thanh toán đã từ chối yêu cầu rút tiền. Vui lòng xem ghi chú xử lý.";

        notificationService.notifyUser(
                withdrawal.getSeller().getId(),
                admin.getId(),
                notificationType,
                notificationTitle,
                notificationMessage,
                "/seller/dashboard?tab=withdraw"
        );
    }

    private void hydrateDestinationFromSellerAccount(WithdrawalRequest withdrawal) {
        if (trimToNull(withdrawal.getAccountName()) != null && trimToNull(withdrawal.getAccountNumber()) != null) {
            return;
        }
        sellerPayoutAccountRepository.findBySeller_Id(withdrawal.getSeller().getId())
                .filter(account -> "VERIFIED".equals(account.getStatus()))
                .ifPresent(account -> {
                    withdrawal.setMethod(account.getMethod());
                    withdrawal.setBankName(account.getBankName());
                    withdrawal.setAccountName(account.getAccountName());
                    withdrawal.setAccountNumber(account.getAccountNumber());
                });
    }

    private void validateWithdrawalDestination(WithdrawalRequest withdrawal) {
        String method = normalize(withdrawal.getMethod(), "BANK");
        if ("BANK".equals(method) && trimToNull(withdrawal.getBankName()) == null) {
            throw new IllegalArgumentException("Người bán chưa có ngân hàng nhận tiền hợp lệ");
        }
        if (trimToNull(withdrawal.getAccountName()) == null || trimToNull(withdrawal.getAccountNumber()) == null) {
            throw new IllegalArgumentException("Người bán chưa có tài khoản nhận tiền hợp lệ");
        }
    }

    private void validatePayoutAccount(SellerPayoutAccount account) {
        String method = normalize(account.getMethod(), "BANK");
        if (!List.of("BANK", "PAYPAL").contains(method)) {
            throw new IllegalArgumentException("Phương thức nhận tiền không hợp lệ");
        }
        if ("BANK".equals(method) && trimToNull(account.getBankName()) == null) {
            throw new IllegalArgumentException("Vui lòng nhập ngân hàng nhận tiền");
        }
        if (trimToNull(account.getAccountName()) == null) {
            throw new IllegalArgumentException("Vui lòng nhập tên chủ tài khoản");
        }
        String accountNumber = trimToNull(account.getAccountNumber());
        if (accountNumber == null) {
            throw new IllegalArgumentException("Vui lòng nhập số tài khoản hoặc email PayPal");
        }
        if ("PAYPAL".equals(method) && !accountNumber.contains("@")) {
            throw new IllegalArgumentException("Email PayPal demo chưa hợp lệ");
        }
    }

    private long availableBalance(Integer sellerId) {
        long revenue = paidRevenueAmount(sellerId);
        long topUps = completedTopUps(sellerId);
        long reserved = nullableLong(withdrawalRequestRepository.sumAmountBySellerIdAndStatuses(sellerId, RESERVED_STATUSES));
        long refundHold = pendingRefundHold(sellerId);
        return Math.max(0L, revenue + topUps - reserved - refundHold);
    }

    private long paidRevenueAmount(Integer sellerId) {
        Double value = orderRepository.sumPaidRevenueBySellerId(sellerId);
        return Math.round(value == null ? 0.0 : value);
    }

    private long completedTopUps(Integer sellerId) {
        Long value = sellerWalletTransactionRepository.sumCompletedTopUpsBySellerId(sellerId);
        return value == null ? 0L : value;
    }

    private long pendingRefundHold(Integer sellerId) {
        Double value = refundRequestRepository.sumOrderAmountBySellerIdAndStatuses(sellerId, OPEN_REFUND_STATUSES);
        return Math.round(value == null ? 0.0 : value);
    }

    private long nullableLong(Long value) {
        return value == null ? 0L : value;
    }

    private long orderAmount(Order order) {
        Double amount = order.getPricePaid();
        if (amount == null) {
            Course course = order.getIdCourse();
            amount = course == null ? 0.0 : course.getPrice();
        }
        return Math.round(amount == null ? 0.0 : amount);
    }

    private String virtualTransferNote(WithdrawalRequest withdrawal, String adminNote) {
        String method = normalize(withdrawal.getMethod(), "BANK");
        String prefix = "PAYPAL".equals(method) ? "PAYPAL-DEMO" : "BANK-DEMO";
        String reference = prefix + "-" + withdrawal.getId() + "-"
                + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String destination = Stream.of(withdrawal.getBankName(), withdrawal.getAccountNumber())
                .filter(value -> value != null && !value.isBlank())
                .reduce((left, right) -> left + " / " + right)
                .orElse("tài khoản nhận tiền demo");
        String transferSummary = "Đã ghi nhận chuyển khoản ảo " + withdrawal.getAmountVnd()
                + " VND đến " + destination + ". Mã giao dịch: " + reference;
        if (adminNote == null) {
            return transferSummary.length() <= 500 ? transferSummary : transferSummary.substring(0, 500);
        }
        int maxAdminNoteLength = Math.max(0, 499 - transferSummary.length());
        String safeAdminNote = adminNote.length() <= maxAdminNoteLength
                ? adminNote
                : adminNote.substring(0, maxAdminNoteLength);
        return safeAdminNote + "\n" + transferSummary;
    }

    private String trimRequired(String value, String message) {
        String trimmed = trimToNull(value);
        if (trimmed == null) {
            throw new IllegalArgumentException(message);
        }
        return trimmed;
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    private String normalize(String value, String fallback) {
        String trimmed = trimToNull(value);
        return trimmed == null ? fallback : trimmed.toUpperCase(Locale.ROOT);
    }

    private String normalizeKeyword(String value) {
        return trimToNull(value);
    }

    private String normalizeStatusFilter(String value) {
        String trimmed = trimToNull(value);
        if (trimmed == null || "ALL".equalsIgnoreCase(trimmed)) return null;
        return trimmed.toUpperCase(Locale.ROOT);
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
    }

    private User seller(Integer sellerId) {
        return userRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người bán"));
    }

    private void ensureSellerAccess(User current, Integer sellerId) {
        if (!isAdmin(current) && !current.getId().equals(sellerId)) {
            throw new IllegalArgumentException("Bạn không có quyền thao tác với tài khoản người bán này");
        }
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(role -> PredefinedRole.ADMIN_ROLE.equals(role.getName()));
    }

    private SellerPayoutAccountResponse toPayoutAccountResponse(SellerPayoutAccount account) {
        User seller = account.getSeller();
        return SellerPayoutAccountResponse.builder()
                .id(account.getId())
                .sellerId(seller == null ? null : seller.getId())
                .sellerName(seller == null ? null : seller.getFullname())
                .method(account.getMethod())
                .bankName(account.getBankName())
                .accountName(account.getAccountName())
                .accountNumber(account.getAccountNumber())
                .status(account.getStatus())
                .demoMode(account.getDemoMode())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }

    private WithdrawalRequestResponse toResponse(WithdrawalRequest withdrawal) {
        User seller = withdrawal.getSeller();
        User reviewer = withdrawal.getReviewer();
        return WithdrawalRequestResponse.builder()
                .id(withdrawal.getId())
                .sellerId(seller == null ? null : seller.getId())
                .sellerName(seller == null ? null : seller.getFullname())
                .amountVnd(withdrawal.getAmountVnd())
                .method(withdrawal.getMethod())
                .bankName(withdrawal.getBankName())
                .accountName(withdrawal.getAccountName())
                .accountNumber(withdrawal.getAccountNumber())
                .note(withdrawal.getNote())
                .status(withdrawal.getStatus())
                .source(withdrawal.getSource())
                .failureReason(withdrawal.getFailureReason())
                .adminNote(withdrawal.getAdminNote())
                .requestedAt(withdrawal.getRequestedAt())
                .reviewedAt(withdrawal.getReviewedAt())
                .reviewerId(reviewer == null ? null : reviewer.getId())
                .reviewerName(reviewer == null ? null : reviewer.getFullname())
                .build();
    }

    private SellerWalletTransactionResponse toWalletTransactionResponse(SellerWalletTransaction transaction) {
        User seller = transaction.getSeller();
        return SellerWalletTransactionResponse.builder()
                .id(transaction.getId())
                .sellerId(seller == null ? null : seller.getId())
                .sellerName(seller == null ? null : seller.getFullname())
                .type(transaction.getType())
                .amountVnd(transaction.getAmountVnd())
                .status(transaction.getStatus())
                .provider(transaction.getProvider())
                .reference(transaction.getReference())
                .description(transaction.getDescription())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
