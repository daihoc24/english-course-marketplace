package com.example.back_end.controller;

import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.entity.Course;
import com.example.back_end.entity.PaymentTransaction;
import com.example.back_end.entity.User;
import com.example.back_end.repositories.CourseRepository;
import com.example.back_end.repositories.OrderRepository;
import com.example.back_end.repositories.PaymentTransactionRepository;
import com.example.back_end.repositories.UserRepository;
import com.example.back_end.service.LearnerWalletService;
import com.example.back_end.service.PayPalService;
import com.example.back_end.service.order.IOrderService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentControllerSecurityTest {
    @Mock
    private PayPalService payPalService;
    @Mock
    private IOrderService orderService;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;
    @Mock
    private LearnerWalletService learnerWalletService;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private HttpServletRequest httpServletRequest;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void paypalCreateRejectsPaymentForDifferentUserId() {
        when(courseRepository.findById(7)).thenReturn(Optional.of(course()));
        when(userRepository.findByEmail("learner@example.test")).thenReturn(Optional.of(learner()));
        authenticate("learner@example.test");

        PayPalController controller = new PayPalController(
                payPalService,
                orderService,
                courseRepository,
                userRepository,
                paymentTransactionRepository
        );

        ApiResponse<String> response = controller.createPayment(7, 99);

        assertEquals(400, response.getCode());
        assertEquals("Payment user does not match authenticated user", response.getMessage());
        verify(payPalService, never()).createOrder(anyLong(), anyInt(), anyInt());
        verify(paymentTransactionRepository, never()).save(any(PaymentTransaction.class));
    }

    @Test
    void vnpayCreateRejectsPaymentForDifferentUserId() {
        when(courseRepository.findById(7)).thenReturn(Optional.of(course()));
        when(userRepository.findByEmail("learner@example.test")).thenReturn(Optional.of(learner()));
        authenticate("learner@example.test");

        VnPayController controller = new VnPayController(
                courseRepository,
                orderService,
                userRepository,
                paymentTransactionRepository,
                learnerWalletService,
                orderRepository
        );

        ApiResponse<String> response = controller.createPayment(7, 99, 0L, httpServletRequest);

        assertEquals(400, response.getCode());
        assertEquals("Payment user does not match authenticated user", response.getMessage());
        verify(paymentTransactionRepository, never()).save(any(PaymentTransaction.class));
    }

    private void authenticate(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, "ignored")
        );
    }

    private User learner() {
        return User.builder()
                .id(12)
                .email("learner@example.test")
                .fullname("Demo Learner")
                .build();
    }

    private Course course() {
        return Course.builder()
                .id(7)
                .name("Secure Payment Course")
                .price(99_000D)
                .build();
    }
}
