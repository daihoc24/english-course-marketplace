package com.example.back_end.service.order;

import com.example.back_end.entity.Course;
import com.example.back_end.entity.Order;
import com.example.back_end.entity.User;
import com.example.back_end.mapper.OrderMapper;
import com.example.back_end.repositories.CourseDetailRepository;
import com.example.back_end.repositories.CourseRepository;
import com.example.back_end.repositories.LessonProgressRepository;
import com.example.back_end.repositories.OrderRepository;
import com.example.back_end.repositories.UserRepository;
import com.example.back_end.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderMapper orderMapper;
    @Mock
    private CourseDetailRepository courseDetailRepository;
    @Mock
    private LessonProgressRepository lessonProgressRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OrderService orderService;

    @Test
    void grantsPaidAccessForVerifiedPaymentTransaction() {
        User learner = learner();
        Course course = course();
        when(userRepository.findById(12)).thenReturn(Optional.of(learner));
        when(orderRepository.findByIdUser_IdAndIdCourse_Id(12, 7)).thenReturn(Optional.empty());
        when(courseRepository.findById(Integer.valueOf(7))).thenReturn(Optional.of(course));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order order = orderService.grantCourseAccessAfterVerifiedPayment(12, 7);

        assertSame(learner, order.getIdUser());
        assertSame(course, order.getIdCourse());
        assertEquals("PAID", order.getStatus());
        assertEquals(99_000D, order.getPricePaid());
        assertNotNull(order.getRefundEligibleUntil());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void returnsExistingPaidOrderWithoutCreatingDuplicate() {
        User learner = learner();
        Order existing = new Order();
        existing.setIdUser(learner);
        existing.setIdCourse(course());
        existing.setStatus("PAID");
        existing.setDateOrder(LocalDate.now().minusDays(1));
        when(userRepository.findById(12)).thenReturn(Optional.of(learner));
        when(orderRepository.findByIdUser_IdAndIdCourse_Id(12, 7)).thenReturn(Optional.of(existing));

        Order order = orderService.grantCourseAccessAfterVerifiedPayment(12, 7);

        assertSame(existing, order);
        verify(courseRepository, never()).findById(Integer.valueOf(7));
        verify(orderRepository, never()).save(any(Order.class));
    }

    private User learner() {
        return User.builder()
                .id(12)
                .fullname("Demo Learner")
                .email("demo.learner@example.test")
                .build();
    }

    private Course course() {
        return Course.builder()
                .id(7)
                .name("Portfolio Spring Boot")
                .price(99_000D)
                .sellerId(5)
                .build();
    }
}
