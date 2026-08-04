package com.example.back_end.service;

import com.example.back_end.dto.request.LearnerCreditWithdrawRequest;
import com.example.back_end.dto.response.LearnerWalletSummaryResponse;
import com.example.back_end.dto.response.LearnerWalletTransactionResponse;
import com.example.back_end.entity.Course;
import com.example.back_end.entity.LearnerWalletTransaction;
import com.example.back_end.entity.Order;
import com.example.back_end.entity.PaymentTransaction;
import com.example.back_end.entity.User;
import com.example.back_end.repositories.CourseRepository;
import com.example.back_end.repositories.LearnerWalletTransactionRepository;
import com.example.back_end.repositories.OrderRepository;
import com.example.back_end.repositories.PaymentTransactionRepository;
import com.example.back_end.repositories.UserRepository;
import com.example.back_end.service.order.IOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LearnerWalletService {
    private static final long MIN_WITHDRAW_AMOUNT = 10_000L;

    private final LearnerWalletTransactionRepository learnerWalletTransactionRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final OrderRepository orderRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final IOrderService orderService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public LearnerWalletSummaryResponse summary() {
        User user = currentUser();
        return LearnerWalletSummaryResponse.builder()
                .balanceVnd(balance(user.getId()))
                .transactions(learnerWalletTransactionRepository.findAllByUser_IdOrderByCreatedAtDesc(user.getId())
                        .stream()
                        .map(this::toResponse)
                        .toList())
                .build();
    }

    @Transactional
    public LearnerWalletTransactionResponse withdrawDemo(LearnerCreditWithdrawRequest request) {
        User user = currentUser();
        long amount = request.getAmountVnd() == null ? 0L : request.getAmountVnd();
        if (amount < MIN_WITHDRAW_AMOUNT) {
            throw new IllegalArgumentException("Số tiền rút tối thiểu là 10.000 VND");
        }
        if (amount > balance(user.getId())) {
            throw new IllegalArgumentException("Số dư tín dụng không đủ để rút tiền");
        }

        String destination = "MB Bank Demo - 9704" + String.format("%08d", user.getId());
        LearnerWalletTransaction transaction = createTransaction(
                user,
                "WITHDRAWAL",
                amount,
                "COMPLETED",
                "DEMO_BANK",
                "LEARNER-WD-" + user.getId() + "-" + shortId(),
                "Rút tiền demo về " + destination
        );
        notificationService.notifyUser(
                user.getId(),
                user.getId(),
                "LEARNER_CREDIT_WITHDRAWN",
                "Rút tiền demo thành công",
                "Hệ thống đã ghi nhận rút " + amount + " VND từ tín dụng học tập của bạn.",
                "/my-refunds"
        );
        return toResponse(transaction);
    }

    @Transactional
    public LearnerWalletTransaction creditRefund(User learner, long amount, String reference, String description) {
        if (learner == null || learner.getId() == null) {
            throw new IllegalArgumentException("Không tìm thấy học viên nhận hoàn tiền");
        }
        if (amount <= 0) {
            throw new IllegalArgumentException("Số tiền hoàn không hợp lệ");
        }
        return learnerWalletTransactionRepository.findByReference(reference)
                .orElseGet(() -> createTransaction(
                        learner,
                        "REFUND_CREDIT",
                        amount,
                        "COMPLETED",
                        "LEARNING_CREDIT",
                        reference,
                        description
                ));
    }

    @Transactional
    public void applyCreditForVnPayPurchase(User learner, Course course, long amount, String paymentReference) {
        if (amount <= 0) return;
        if (learner == null || course == null) {
            throw new IllegalArgumentException("Không thể áp dụng tín dụng học tập");
        }
        String reference = "CREDIT-USED-VNPAY-" + paymentReference;
        if (learnerWalletTransactionRepository.findByReference(reference).isPresent()) {
            return;
        }
        if (amount > balance(learner.getId())) {
            throw new IllegalArgumentException("Số dư tín dụng không đủ để hoàn tất thanh toán");
        }
        createTransaction(
                learner,
                "PURCHASE_APPLIED",
                amount,
                "COMPLETED",
                "LEARNING_CREDIT",
                reference,
                "Dùng tín dụng học tập để mua khóa \"" + course.getName() + "\""
        );
    }

    @Transactional
    public void purchaseCourseWithCredit(Integer userId, Integer courseId) {
        User user = requireCurrentUser(userId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học"));
        if (orderRepository.existsByIdUser_IdAndIdCourse_IdAndStatus(user.getId(), course.getId(), "PAID")) {
            throw new IllegalArgumentException("Bạn đã sở hữu khóa học này");
        }

        long price = Math.round(course.getPrice() == null ? 0.0 : course.getPrice());
        if (price <= 0) {
            throw new IllegalArgumentException("Giá khóa học không hợp lệ");
        }
        if (price > balance(user.getId())) {
            throw new IllegalArgumentException("Số dư tín dụng không đủ để mua khóa học");
        }

        String reference = "CREDIT-PAY-" + user.getId() + "-" + shortId();
        createTransaction(
                user,
                "PURCHASE_APPLIED",
                price,
                "COMPLETED",
                "LEARNING_CREDIT",
                "CREDIT-USED-" + reference,
                "Dùng tín dụng học tập để mua khóa \"" + course.getName() + "\""
        );
        Order order = orderService.grantCourseAccessAfterVerifiedPayment(user.getId(), course.getId());

        PaymentTransaction paymentTransaction = new PaymentTransaction();
        paymentTransaction.setProvider("LEARNING_CREDIT");
        paymentTransaction.setTransactionRef(reference);
        paymentTransaction.setCourse(course);
        paymentTransaction.setUser(user);
        paymentTransaction.setOrder(order);
        paymentTransaction.setAmountVnd(0L);
        paymentTransaction.setCreditAppliedVnd(price);
        paymentTransaction.setStatus("COMPLETED");
        paymentTransaction.setGatewayTransactionId(reference);
        paymentTransaction.setCreatedAt(LocalDateTime.now());
        paymentTransaction.setCompletedAt(LocalDateTime.now());
        paymentTransactionRepository.save(paymentTransaction);
    }

    @Transactional(readOnly = true)
    public long usableCredit(Integer userId, long requestedAmount, long orderAmount) {
        if (requestedAmount <= 0 || orderAmount <= 0) return 0L;
        long balance = balance(userId);
        return Math.min(Math.min(requestedAmount, balance), orderAmount);
    }

    @Transactional(readOnly = true)
    public long balance(Integer userId) {
        Long value = learnerWalletTransactionRepository.balanceByUserId(userId);
        return value == null ? 0L : Math.max(0L, value);
    }

    private LearnerWalletTransaction createTransaction(
            User user,
            String type,
            long amount,
            String status,
            String provider,
            String reference,
            String description
    ) {
        LearnerWalletTransaction transaction = new LearnerWalletTransaction();
        transaction.setUser(user);
        transaction.setType(type);
        transaction.setAmountVnd(amount);
        transaction.setStatus(status);
        transaction.setProvider(provider);
        transaction.setReference(reference);
        transaction.setDescription(description);
        transaction.setCreatedAt(LocalDateTime.now());
        return learnerWalletTransactionRepository.save(transaction);
    }

    private LearnerWalletTransactionResponse toResponse(LearnerWalletTransaction transaction) {
        User user = transaction.getUser();
        return LearnerWalletTransactionResponse.builder()
                .id(transaction.getId())
                .userId(user == null ? null : user.getId())
                .userName(user == null ? null : user.getFullname())
                .type(transaction.getType())
                .amountVnd(transaction.getAmountVnd())
                .status(transaction.getStatus())
                .provider(transaction.getProvider())
                .reference(transaction.getReference())
                .description(transaction.getDescription())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
    }

    private User requireCurrentUser(Integer requestedUserId) {
        User current = currentUser();
        if (!current.getId().equals(requestedUserId)) {
            throw new IllegalArgumentException("Tài khoản thanh toán không khớp với người đang đăng nhập");
        }
        return current;
    }

    private String shortId() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }
}
