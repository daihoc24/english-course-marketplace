package com.example.back_end.controller;

import com.example.back_end.configuration.VnpayConfig;
import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.entity.Course;
import com.example.back_end.entity.Order;
import com.example.back_end.entity.PaymentTransaction;
import com.example.back_end.entity.User;
import com.example.back_end.repositories.CourseRepository;
import com.example.back_end.repositories.OrderRepository;
import com.example.back_end.repositories.PaymentTransactionRepository;
import com.example.back_end.repositories.UserRepository;
import com.example.back_end.service.LearnerWalletService;
import com.example.back_end.service.order.IOrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@Slf4j
public class VnPayController {
    private final CourseRepository courseRepository;
    private final IOrderService orderService;
    private final UserRepository userRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final LearnerWalletService learnerWalletService;
    private final OrderRepository orderRepository;

    @GetMapping("/vnpay")
    @PreAuthorize("@userAccessAuthorization.canAccess(#userId, authentication)")
    public ApiResponse<String> createPayment(@RequestParam int courseId,
                                             @RequestParam int userId,
                                             @RequestParam(defaultValue = "0") long creditAmount,
                                             HttpServletRequest request) {
        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found"));
            long coursePrice = Math.round(course.getPrice());
            User paymentUser = requireAuthenticatedPaymentUser(userId);
            if (orderRepository.existsByIdUser_IdAndIdCourse_IdAndStatus(paymentUser.getId(), course.getId(), "PAID")) {
                throw new IllegalArgumentException("Bạn đã sở hữu khóa học này");
            }
            long creditApplied = learnerWalletService.usableCredit(userId, creditAmount, coursePrice);
            long amount = coursePrice - creditApplied;
            if (amount <= 0) {
                throw new IllegalArgumentException("Tín dụng học tập đã đủ để mua khóa học. Vui lòng dùng thanh toán bằng tín dụng.");
            }
            if (amount < 25_000) {
                throw new IllegalArgumentException("Minimum payment amount is 25,000 VND");
            }

            String transactionRef = VnpayConfig.getRandomNumber(8);
            PaymentTransaction paymentTransaction = new PaymentTransaction();
            paymentTransaction.setProvider("VNPAY");
            paymentTransaction.setTransactionRef(transactionRef);
            paymentTransaction.setCourse(course);
            paymentTransaction.setUser(paymentUser);
            paymentTransaction.setAmountVnd(amount);
            paymentTransaction.setCreditAppliedVnd(creditApplied);
            paymentTransaction.setStatus("PENDING");
            paymentTransaction.setCreatedAt(LocalDateTime.now());
            paymentTransactionRepository.save(paymentTransaction);

            Map<String, String> parameters = new HashMap<>();
            parameters.put("vnp_Version", "2.1.0");
            parameters.put("vnp_Command", "pay");
            parameters.put("vnp_TmnCode", VnpayConfig.vnp_TmnCode);
            parameters.put("vnp_Amount", String.valueOf(amount * 100));
            parameters.put("vnp_CurrCode", "VND");
            parameters.put("vnp_TxnRef", transactionRef);
            parameters.put("vnp_OrderInfo", "courseId=" + courseId);
            parameters.put("vnp_OrderType", "250000");
            parameters.put("vnp_Locale", "vn");
            parameters.put("vnp_ReturnUrl", VnpayConfig.vnp_ReturnUrl);
            parameters.put("vnp_IpAddr", request.getRemoteAddr());

            Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String createDate = formatter.format(calendar.getTime());
            parameters.put("vnp_CreateDate", createDate);
            paymentTransaction.setGatewayTransactionDate(createDate);
            paymentTransactionRepository.save(paymentTransaction);
            calendar.add(Calendar.MINUTE, 15);
            parameters.put("vnp_ExpireDate", formatter.format(calendar.getTime()));

            String hashData = buildHashData(parameters);
            String paymentUrl = VnpayConfig.vnp_PayUrl + "?" + buildQuery(parameters)
                    + "&vnp_SecureHashType=HmacSHA512&vnp_SecureHash="
                    + VnpayConfig.hmacSHA512(VnpayConfig.vnp_HashSecret, hashData);
            return ApiResponse.<String>builder().code(200).result(paymentUrl).build();
        } catch (RuntimeException exception) {
            log.warn("Unable to create VNPay payment: {}", exception.getMessage());
            return ApiResponse.<String>builder().code(400).message(exception.getMessage()).build();
        } catch (Exception exception) {
            log.error("Unable to create VNPay payment", exception);
            return ApiResponse.<String>builder().code(500).message("Cannot create VNPay payment").build();
        }
    }

    @PostMapping("/vnpay/confirm")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ApiResponse<Void> confirmPayment(@RequestBody Map<String, String> callback) {
        String receivedHash = callback.get("vnp_SecureHash");
        Map<String, String> signedParameters = new HashMap<>();
        callback.forEach((key, value) -> {
            if (key.startsWith("vnp_") && !"vnp_SecureHash".equals(key) && !"vnp_SecureHashType".equals(key)) {
                signedParameters.put(key, value);
            }
        });
        String expectedHash = VnpayConfig.hmacSHA512(VnpayConfig.vnp_HashSecret, buildHashData(signedParameters));
        if (receivedHash == null || !MessageDigest.isEqual(
                receivedHash.getBytes(StandardCharsets.US_ASCII), expectedHash.getBytes(StandardCharsets.US_ASCII))) {
            return ApiResponse.<Void>builder().code(400).message("Invalid VNPay signature").build();
        }
        if (!"00".equals(signedParameters.get("vnp_ResponseCode"))) {
            return ApiResponse.<Void>builder().code(400).message("VNPay payment was not successful").build();
        }

        String orderInfo = signedParameters.get("vnp_OrderInfo");
        if (orderInfo == null || !orderInfo.startsWith("courseId=")) {
            return ApiResponse.<Void>builder().code(400).message("Invalid order information").build();
        }
        try {
            int courseId = Integer.parseInt(orderInfo.substring("courseId=".length()));
            PaymentTransaction paymentTransaction = paymentTransactionRepository
                    .findByProviderAndTransactionRef("VNPAY", signedParameters.get("vnp_TxnRef"))
                    .orElseThrow(() -> new IllegalArgumentException("Payment transaction not found"));
            String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            long receivedAmount = Long.parseLong(signedParameters.getOrDefault("vnp_Amount", "0")) / 100;
            boolean transactionMatches = paymentTransaction.getCourse().getId().equals(courseId)
                    && currentEmail.equals(paymentTransaction.getUser().getEmail())
                    && paymentTransaction.getAmountVnd() == receivedAmount;
            if (!transactionMatches) {
                return ApiResponse.<Void>builder().code(400).message("Payment transaction validation failed").build();
            }
            if ("COMPLETED".equals(paymentTransaction.getStatus())) {
                return ApiResponse.<Void>builder().code(200).message("VNPay payment was already recorded").build();
            }
            if (!"PENDING".equals(paymentTransaction.getStatus())) {
                return ApiResponse.<Void>builder().code(400).message("VNPay transaction is not pending").build();
            }

            long creditApplied = paymentTransaction.getCreditAppliedVnd() == null ? 0L : paymentTransaction.getCreditAppliedVnd();
            learnerWalletService.applyCreditForVnPayPurchase(
                    paymentTransaction.getUser(),
                    paymentTransaction.getCourse(),
                    creditApplied,
                    paymentTransaction.getTransactionRef()
            );
            Order order = orderService.grantCourseAccessAfterVerifiedPayment(paymentTransaction.getUser().getId(), courseId);
            paymentTransaction.setStatus("COMPLETED");
            paymentTransaction.setOrder(order);
            paymentTransaction.setGatewayTransactionId(signedParameters.get("vnp_TransactionNo"));
            paymentTransaction.setGatewayTransactionDate(signedParameters.getOrDefault("vnp_PayDate", paymentTransaction.getGatewayTransactionDate()));
            paymentTransaction.setCompletedAt(LocalDateTime.now());
            return ApiResponse.<Void>builder().code(200).message("VNPay payment confirmed").build();
        } catch (RuntimeException exception) {
            return ApiResponse.<Void>builder().code(400).message(exception.getMessage()).build();
        }
    }

    @PostMapping("/learning-credit/purchase")
    @PreAuthorize("@userAccessAuthorization.canAccess(#userId, authentication)")
    @Transactional
    public ApiResponse<Void> purchaseWithLearningCredit(@RequestParam int courseId,
                                                        @RequestParam int userId) {
        try {
            learnerWalletService.purchaseCourseWithCredit(userId, courseId);
            return ApiResponse.<Void>builder().code(200).message("Course purchased with learning credit").build();
        } catch (RuntimeException exception) {
            return ApiResponse.<Void>builder().code(400).message(exception.getMessage()).build();
        }
    }

    private static String buildHashData(Map<String, String> parameters) {
        return buildQuery(parameters);
    }

    private static String buildQuery(Map<String, String> parameters) {
        return parameters.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .reduce((left, right) -> left + "&" + right)
                .orElse("");
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.US_ASCII);
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
