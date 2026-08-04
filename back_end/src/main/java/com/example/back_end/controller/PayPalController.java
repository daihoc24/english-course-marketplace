package com.example.back_end.controller;

import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.entity.Course;
import com.example.back_end.entity.Order;
import com.example.back_end.entity.PaymentTransaction;
import com.example.back_end.entity.User;
import com.example.back_end.repositories.CourseRepository;
import com.example.back_end.repositories.PaymentTransactionRepository;
import com.example.back_end.repositories.UserRepository;
import com.example.back_end.service.PayPalService;
import com.example.back_end.service.order.IOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/payment/paypal")
@RequiredArgsConstructor
@Slf4j
public class PayPalController {

    private final PayPalService payPalService;
    private final IOrderService orderService;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

    @PostMapping("/create")
    @PreAuthorize("@userAccessAuthorization.canAccess(#userId, authentication)")
    public ApiResponse<String> createPayment(@RequestParam int courseId,
                                             @RequestParam int userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        long amount = Math.round(course.getPrice());
        if (amount < 25_000) {
            return ApiResponse.<String>builder()
                    .code(400)
                    .message("Minimum payment amount is 25,000 VND")
                    .build();
        }

        User paymentUser;
        try {
            paymentUser = requireAuthenticatedPaymentUser(userId);
        } catch (IllegalArgumentException exception) {
            return ApiResponse.<String>builder()
                    .code(400)
                    .message(exception.getMessage())
                    .build();
        }

        try {
            PayPalService.CreatedOrder paypalOrder = payPalService.createOrder(amount, courseId, userId);
            PaymentTransaction paymentTransaction = new PaymentTransaction();
            paymentTransaction.setProvider("PAYPAL");
            paymentTransaction.setTransactionRef(paypalOrder.orderId());
            paymentTransaction.setCourse(course);
            paymentTransaction.setUser(paymentUser);
            paymentTransaction.setAmountVnd(amount);
            paymentTransaction.setStatus("PENDING");
            paymentTransaction.setCreatedAt(LocalDateTime.now());
            paymentTransactionRepository.save(paymentTransaction);
            return ApiResponse.<String>builder()
                    .code(0)
                    .result(paypalOrder.approvalUrl())
                    .build();
        } catch (RuntimeException exception) {
            log.error("Unable to create PayPal payment: {}", exception.getMessage());
            return ApiResponse.<String>builder()
                    .code(500)
                    .message("Cannot connect to PayPal sandbox")
                    .build();
        }
    }

    @PostMapping("/capture")
    @PreAuthorize("@userAccessAuthorization.canAccess(#userId, authentication)")
    @Transactional
    public ApiResponse<Void> capturePayment(@RequestParam String token,
                                            @RequestParam int courseId,
                                            @RequestParam int userId) {
        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found"));
            PaymentTransaction paymentTransaction = paymentTransactionRepository
                    .findByProviderAndTransactionRef("PAYPAL", token)
                    .orElseThrow(() -> new IllegalArgumentException("Payment transaction not found"));
            String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            if (!paymentTransaction.getCourse().getId().equals(courseId)
                    || !paymentTransaction.getUser().getId().equals(userId)
                    || !currentEmail.equals(paymentTransaction.getUser().getEmail())
                    || paymentTransaction.getAmountVnd() != Math.round(course.getPrice())) {
                return ApiResponse.<Void>builder().code(400).message("Payment transaction validation failed").build();
            }
            if ("COMPLETED".equals(paymentTransaction.getStatus())) {
                return ApiResponse.<Void>builder()
                        .code(200)
                        .message("PayPal payment was already recorded")
                        .build();
            }
            if (!"PENDING".equals(paymentTransaction.getStatus())) {
                return ApiResponse.<Void>builder().code(400).message("PayPal transaction is not pending").build();
            }

            PayPalService.CaptureResult captured = payPalService.captureOrder(token, Math.round(course.getPrice()), courseId);
            if (!captured.success()) {
                return ApiResponse.<Void>builder()
                        .code(400)
                        .message("PayPal capture failed")
                        .build();
            }

            Order order = orderService.grantCourseAccessAfterVerifiedPayment(paymentTransaction.getUser().getId(), courseId);
            paymentTransaction.setStatus("COMPLETED");
            paymentTransaction.setOrder(order);
            paymentTransaction.setGatewayTransactionId(captured.captureId());
            paymentTransaction.setCompletedAt(LocalDateTime.now());
            return ApiResponse.<Void>builder()
                    .code(200)
                    .message("PayPal payment completed and course access granted")
                    .build();
        } catch (RuntimeException exception) {
            log.error("Unable to capture PayPal payment: {}", exception.getMessage());
            return ApiResponse.<Void>builder()
                    .code(400)
                    .message("Payment token is invalid or expired")
                    .build();
        }
    }

    private User requireAuthenticatedPaymentUser(int requestedUserId) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!currentUser.getId().equals(requestedUserId)) {
            throw new IllegalArgumentException("Payment user does not match authenticated user");
        }
        return currentUser;
    }
}
