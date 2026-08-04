package com.example.back_end.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.back_end.dto.request.RefundDecisionRequest;
import com.example.back_end.dto.request.RefundRequestCreate;
import com.example.back_end.dto.response.RefundRequestResponse;
import com.example.back_end.entity.Order;
import com.example.back_end.entity.PaymentTransaction;
import com.example.back_end.entity.RefundRequest;
import com.example.back_end.entity.User;
import com.example.back_end.repositories.OrderRepository;
import com.example.back_end.repositories.PaymentTransactionRepository;
import com.example.back_end.repositories.RefundRequestRepository;
import com.example.back_end.repositories.SellerWalletTransactionRepository;
import com.example.back_end.repositories.UserRepository;
import com.example.back_end.repositories.WithdrawalRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RefundService {
    private static final List<String> WITHDRAWAL_RESERVED_STATUSES = List.of(
            "PENDING", "PROCESSING", "PAID", "APPROVED", "REQUIRES_ATTENTION"
    );

    private final OrderRepository orderRepository;
    private final RefundRequestRepository refundRequestRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final SellerWalletTransactionRepository sellerWalletTransactionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final LearnerWalletService learnerWalletService;
    private final Cloudinary cloudinary;

    @Transactional
    public RefundRequestResponse create(Integer orderId, RefundRequestCreate request, MultipartFile attachment) {
        User user = currentUser();
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng"));
        if (!order.getIdUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không thể yêu cầu hoàn tiền cho đơn hàng này");
        }
        if (!"PAID".equals(order.getStatus())) {
            throw new IllegalArgumentException("Đơn hàng này không đủ điều kiện hoàn tiền");
        }
        if (order.getRefundEligibleUntil() == null || LocalDate.now().isAfter(order.getRefundEligibleUntil())) {
            throw new IllegalArgumentException("Đơn hàng đã quá thời hạn hoàn tiền 7 ngày");
        }
        if (refundRequestRepository.existsByOrder_IdAndStatusIn(orderId, List.of("PENDING", "APPROVED"))) {
            throw new IllegalArgumentException("Đơn hàng này đang có yêu cầu hoàn tiền hoặc đã được hoàn tiền");
        }

        PaymentTransaction transaction = findCompletedTransaction(order);
        if (transaction == null) {
            throw new IllegalArgumentException("Không tìm thấy giao dịch thanh toán hợp lệ cho đơn hàng này");
        }

        RefundRequest refund = new RefundRequest();
        refund.setOrder(order);
        refund.setRequester(user);
        String reason = request.getReason() == null ? "" : request.getReason().trim();
        if (reason.isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập lý do hoàn tiền");
        }
        if (reason.length() > 500) {
            throw new IllegalArgumentException("Lý do hoàn tiền tối đa 500 ký tự");
        }
        refund.setReason(reason);
        refund.setStatus("PENDING");
        refund.setRequestedAt(LocalDateTime.now());
        refund.setGatewayProvider(transaction.getProvider());
        if (attachment != null && !attachment.isEmpty()) {
            validateAttachment(attachment);
            uploadAttachment(refund, attachment);
        }
        RefundRequest saved = refundRequestRepository.save(refund);

        notificationService.notifyUsers(
                userRepository.findActiveUsersByRoleName("ADMIN"),
                user.getId(),
                "REFUND_REQUESTED",
                "Yêu cầu hoàn tiền mới",
                user.getFullname() + " yêu cầu hoàn tiền khóa \"" + order.getIdCourse().getName() + "\".",
                "/admin/refunds"
        );
        notificationService.notifyUser(
                order.getIdCourse().getSellerId(),
                user.getId(),
                "REFUND_REQUESTED",
                "Học viên yêu cầu hoàn tiền",
                user.getFullname() + " đã gửi yêu cầu hoàn tiền cho khóa \"" + order.getIdCourse().getName() + "\".",
                "/seller/dashboard?tab=refund"
        );
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RefundRequestResponse> mine() {
        return refundRequestRepository.findAllByRequester_IdOrderByRequestedAtDesc(currentUser().getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<RefundRequestResponse> sellerRequests() {
        return refundRequestRepository.findAllByOrder_IdCourse_SellerIdOrderByRequestedAtDesc(currentUser().getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<RefundRequestResponse> sellerRequests(String status, String keyword, Pageable pageable) {
        return refundRequestRepository.searchSellerRefundRequests(
                        currentUser().getId(),
                        normalizeStatusFilter(status),
                        normalizeKeyword(keyword),
                        pageable
                )
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<RefundRequestResponse> all() {
        return refundRequestRepository.findAllByOrderByRequestedAtAsc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<RefundRequestResponse> all(String status, String keyword, Pageable pageable) {
        return refundRequestRepository.searchAdminRefundRequests(
                        normalizeStatusFilter(status),
                        normalizeKeyword(keyword),
                        pageable
                )
                .map(this::toResponse);
    }

    @Transactional
    public RefundRequestResponse decide(Long id, RefundDecisionRequest request) {
        RefundRequest refund = refundRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu hoàn tiền"));
        if (!List.of("PENDING", "REQUIRES_ATTENTION").contains(refund.getStatus())) {
            throw new IllegalArgumentException("Yêu cầu hoàn tiền này đã được xử lý");
        }

        refund.setReviewer(currentUser());
        refund.setReviewedAt(LocalDateTime.now());
        refund.setAdminNote(request.getAdminNote());

        boolean approved = "APPROVED".equals(request.getDecision());
        if (!approved) {
            refund.setStatus("REJECTED");
            refund.setGatewayRefundStatus("REJECTED");
            refund.setRefundProcessedAt(LocalDateTime.now());
            notifyRefundOutcome(refund, false, "Yêu cầu hoàn tiền chưa được duyệt. Vui lòng xem ghi chú từ quản trị viên.");
            return toResponse(refund);
        }

        PaymentTransaction transaction = findCompletedTransaction(refund.getOrder());
        if (transaction == null) {
            throw new IllegalArgumentException("Không tìm thấy giao dịch thanh toán đã hoàn tất");
        }

        long refundAmount = refundAmount(refund.getOrder(), transaction);
        Integer sellerId = refund.getOrder().getIdCourse().getSellerId();
        long unwithdrawnBalance = sellerUnwithdrawnBalance(sellerId);
        if (refundAmount > unwithdrawnBalance) {
            String problem = "Ví người bán hiện chưa đủ tiền để hoàn lại cho học viên. "
                    + "Admin cần kiểm tra và xử lý thủ công hoặc giữ doanh thu mới để bù.";
            refund.setStatus("REQUIRES_ATTENTION");
            refund.setGatewayRefundStatus("INSUFFICIENT_SELLER_BALANCE");
            refund.setGatewayRefundMessage(problem);
            refund.setAdminNote(request.getAdminNote() == null || request.getAdminNote().isBlank()
                    ? "Admin đang kiểm tra thêm trước khi hoàn tiền."
                    : request.getAdminNote().trim());
            notificationService.notifyUser(
                    sellerId,
                    refund.getReviewer().getId(),
                    "REFUND_REQUIRES_SELLER_BALANCE",
                    "Hoàn tiền cần admin kiểm tra",
                    "Khóa \"" + refund.getOrder().getIdCourse().getName() + "\" có yêu cầu hoàn tiền nhưng ví người bán chưa đủ tiền.",
                    "/seller/dashboard?tab=refund"
            );
            notificationService.notifyUser(
                    refund.getRequester().getId(),
                    refund.getReviewer().getId(),
                    "REFUND_REQUIRES_ATTENTION",
                    "Yêu cầu hoàn tiền đang được kiểm tra",
                    "Admin đang kiểm tra thêm yêu cầu hoàn tiền của bạn. Bạn sẽ nhận thông báo khi có kết quả mới.",
                    "/my-refunds"
            );
            return toResponse(refund);
        }

        String creditReference = "REFUND-CREDIT-" + refund.getId();
        learnerWalletService.creditRefund(
                refund.getRequester(),
                refundAmount,
                creditReference,
                "Hoàn tiền khóa \"" + refund.getOrder().getIdCourse().getName() + "\" vào tín dụng học tập"
        );
        refund.setGatewayRefundId(creditReference);
        refund.setGatewayRefundStatus("CREDITED");
        refund.setGatewayRefundMessage("Tiền hoàn đã được cộng vào tín dụng học tập. Bạn có thể dùng để mua khóa khác hoặc rút tiền demo.");

        refund.setStatus("APPROVED");
        refund.setRefundProcessedAt(LocalDateTime.now());
        refund.getOrder().setStatus("REFUNDED");
        if (transaction != null) {
            transaction.setStatus("REFUNDED");
            transaction.setRefundRef(refund.getGatewayRefundId());
            transaction.setRefundedAt(LocalDateTime.now());
        }
        notifyRefundOutcome(refund, true, "Tiền hoàn khóa \"" + refund.getOrder().getIdCourse().getName() + "\" đã được cộng vào tín dụng học tập của bạn.");
        return toResponse(refund);
    }

    private void notifyRefundOutcome(RefundRequest refund, boolean approved, String message) {
        notificationService.notifyUser(
                refund.getRequester().getId(),
                refund.getReviewer().getId(),
                approved ? "REFUND_APPROVED" : "REFUND_REJECTED",
                approved ? "Yêu cầu hoàn tiền đã được duyệt" : "Yêu cầu hoàn tiền chưa được duyệt",
                message,
                "/my-refunds"
        );
    }

    private PaymentTransaction findCompletedTransaction(Order order) {
        if (order == null) return null;
        if (order.getId() > 0) {
            return paymentTransactionRepository.findFirstByOrder_IdAndStatusOrderByCompletedAtDesc(order.getId(), "COMPLETED")
                    .orElseGet(() -> paymentTransactionRepository
                            .findAllByUser_IdAndCourse_IdAndStatusOrderByCompletedAtDesc(
                                    order.getIdUser().getId(),
                                    order.getIdCourse().getId(),
                                    "COMPLETED")
                            .stream().findFirst().orElse(null));
        }
        return paymentTransactionRepository
                .findAllByUser_IdAndCourse_IdAndStatusOrderByCompletedAtDesc(order.getIdUser().getId(), order.getIdCourse().getId(), "COMPLETED")
                .stream().findFirst().orElse(null);
    }

    private long refundAmount(Order order, PaymentTransaction transaction) {
        if (transaction != null && transaction.getAmountVnd() != null) {
            long paidByGateway = transaction.getAmountVnd() == null ? 0L : transaction.getAmountVnd();
            long paidByCredit = transaction.getCreditAppliedVnd() == null ? 0L : transaction.getCreditAppliedVnd();
            return paidByGateway + paidByCredit;
        }
        Double amount = order == null ? null : order.getPricePaid();
        if (amount == null && order != null && order.getIdCourse() != null) {
            amount = order.getIdCourse().getPrice();
        }
        return Math.round(amount == null ? 0.0 : amount);
    }

    private long sellerUnwithdrawnBalance(Integer sellerId) {
        if (sellerId == null) return 0L;
        long paidRevenue = nullableDoubleToLong(orderRepository.sumPaidRevenueBySellerId(sellerId));
        long topUps = completedTopUps(sellerId);
        long reservedWithdrawals = nullableLong(withdrawalRequestRepository.sumAmountBySellerIdAndStatuses(sellerId, WITHDRAWAL_RESERVED_STATUSES));
        return Math.max(0L, paidRevenue + topUps - reservedWithdrawals);
    }

    private long completedTopUps(Integer sellerId) {
        Long value = sellerWalletTransactionRepository.sumCompletedTopUpsBySellerId(sellerId);
        return value == null ? 0L : value;
    }

    private long nullableLong(Long value) {
        return value == null ? 0L : value;
    }

    private long nullableDoubleToLong(Double value) {
        return Math.round(value == null ? 0.0 : value);
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private String normalizeKeyword(String value) {
        if (value == null || value.trim().isBlank()) return null;
        return value.trim();
    }

    private String normalizeStatusFilter(String value) {
        if (value == null || value.trim().isBlank() || "ALL".equalsIgnoreCase(value)) return null;
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private RefundRequestResponse toResponse(RefundRequest value) {
        return RefundRequestResponse.builder()
                .id(value.getId())
                .orderId(value.getOrder().getId())
                .courseId(value.getOrder().getIdCourse().getId())
                .courseName(value.getOrder().getIdCourse().getName())
                .amountVnd(refundAmount(value.getOrder(), findCompletedTransaction(value.getOrder())))
                .requesterName(value.getRequester().getFullname())
                .reason(value.getReason())
                .status(value.getStatus())
                .adminNote(value.getAdminNote())
                .attachmentUrl(value.getAttachmentUrl())
                .attachmentPublicId(value.getAttachmentPublicId())
                .gatewayProvider(value.getGatewayProvider())
                .gatewayRefundId(value.getGatewayRefundId())
                .gatewayRefundStatus(value.getGatewayRefundStatus())
                .gatewayRefundMessage(value.getGatewayRefundMessage())
                .requestedAt(value.getRequestedAt())
                .reviewedAt(value.getReviewedAt())
                .refundProcessedAt(value.getRefundProcessedAt())
                .build();
    }

    private void validateAttachment(MultipartFile attachment) {
        String contentType = attachment.getContentType();
        boolean image = contentType != null && contentType.startsWith("image/");
        boolean video = contentType != null && contentType.startsWith("video/");
        if (!image && !video) {
            throw new IllegalArgumentException("Minh chứng phải là ảnh hoặc video");
        }
        long maximumSize = video ? 1024L * 1024 * 1024 : 5L * 1024 * 1024;
        if (attachment.getSize() > maximumSize) {
            throw new IllegalArgumentException(video
                    ? "Video minh chứng quá lớn, tối đa 1GB"
                    : "Ảnh minh chứng quá lớn, tối đa 5MB");
        }
    }

    private void uploadAttachment(RefundRequest refund, MultipartFile attachment) {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    attachment.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "refund_attachments",
                            "resource_type", "auto"
                    )
            );
            refund.setAttachmentUrl((String) uploadResult.get("secure_url"));
            refund.setAttachmentPublicId((String) uploadResult.get("public_id"));
        } catch (IOException e) {
            throw new IllegalStateException("Không thể tải minh chứng hoàn tiền lên Cloudinary", e);
        }
    }
}
