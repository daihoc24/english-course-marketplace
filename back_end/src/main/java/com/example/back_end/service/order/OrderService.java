package com.example.back_end.service.order;

import com.example.back_end.dto.response.MyCourseResponse;
import com.example.back_end.dto.response.OrderResponse;
import com.example.back_end.entity.Course;
import com.example.back_end.entity.Order;
import com.example.back_end.entity.User;
import com.example.back_end.exception.AppException;
import com.example.back_end.exception.ErrorCode;
import com.example.back_end.mapper.OrderMapper;
import com.example.back_end.repositories.CourseDetailRepository;
import com.example.back_end.repositories.CourseRepository;
import com.example.back_end.repositories.LessonProgressRepository;
import com.example.back_end.repositories.OrderRepository;
import com.example.back_end.repositories.UserRepository;
import com.example.back_end.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderService implements IOrderService{
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final CourseDetailRepository courseDetailRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public Order grantCourseAccessAfterVerifiedPayment(Integer userId, Integer courseId) {
        if (userId == null || courseId == null) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Order existingOrder = orderRepository.findByIdUser_IdAndIdCourse_Id(user.getId(), courseId).orElse(null);
        if (existingOrder != null && "PAID".equals(existingOrder.getStatus())) return existingOrder;
        if (existingOrder != null) {
            Course course = courseRepository.findById(courseId).orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
            existingOrder.setStatus("PAID");
            existingOrder.setDateOrder(LocalDate.now());
            existingOrder.setPricePaid(course.getPrice());
            existingOrder.setRefundEligibleUntil(LocalDate.now().plusDays(7));
            notifyCoursePurchased(user, course);
            return existingOrder;
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        return createPaidOrder(user, course);
    }

    private Order createPaidOrder(User user, Course course) {
        Order order = new Order();
        order.setIdUser(user);
        order.setIdCourse(course);
        order.setDateOrder(LocalDate.now());
        order.setStatus("PAID");
        order.setPricePaid(course.getPrice());
        order.setRefundEligibleUntil(LocalDate.now().plusDays(7));
        Order saved = orderRepository.save(order);
        notifyCoursePurchased(user, course);
        return saved;
    }

    private void notifyCoursePurchased(User learner, Course course) {
        notificationService.notifyUser(
                learner.getId(),
                null,
                "COURSE_PURCHASED",
                "Mua khóa học thành công",
                "Bạn đã mua khóa \"" + course.getName() + "\". Có thể bắt đầu học ngay.",
                "/course-video/" + course.getId()
        );
        notificationService.notifyUser(
                course.getSellerId(),
                learner.getId(),
                "COURSE_SOLD",
                "Có học viên mới",
                learner.getFullname() + " vừa mua khóa \"" + course.getName() + "\".",
                "/seller/dashboard"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getStudentOrder() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return orderRepository.findAllByUserIdWithCourseAndUser(user.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MyCourseResponse> getMyCourses(String status, String keyword, Pageable pageable) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        String normalizedStatus = normalizeStatus(status);
        String normalizedKeyword = keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();

        return orderRepository.findMyCoursesPage(user.getId(), normalizedStatus, normalizedKeyword, pageable)
                .map(order -> toMyCourseResponse(order, user.getId()));
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank() || "all".equalsIgnoreCase(status)) return null;
        if ("completed".equalsIgnoreCase(status)) return "PAID";
        if ("pending".equalsIgnoreCase(status)) return "PENDING";
        if ("refunded".equalsIgnoreCase(status)) return "REFUNDED";
        return status.toUpperCase();
    }

    private MyCourseResponse toMyCourseResponse(Order order, Integer userId) {
        Course course = order.getIdCourse();
        Integer courseId = course.getId();
        int totalLessons = Math.max(0, courseDetailRepository.countByCourseId(courseId));
        int completedLessons = (int) lessonProgressRepository.countByUser_IdAndCourse_IdAndCompletedTrue(userId, courseId);
        int progressPercent = totalLessons == 0 ? 0 : (int) Math.round((completedLessons * 100.0) / totalLessons);
        String sellerName = userRepository.findById(course.getSellerId())
                .map(User::getFullname)
                .filter(name -> name != null && !name.isBlank())
                .orElse("Giảng viên");

        return MyCourseResponse.builder()
                .orderId(order.getId())
                .courseId(courseId)
                .courseName(course.getName())
                .courseImage(course.getImage())
                .description(course.getDescription())
                .sellerName(sellerName)
                .rating(course.getRating())
                .pricePaid(order.getPricePaid() != null ? order.getPricePaid() : course.getPrice())
                .status(order.getStatus())
                .dateOrder(order.getDateOrder())
                .refundEligibleUntil(order.getRefundEligibleUntil())
                .totalLessons(totalLessons)
                .completedLessons(completedLessons)
                .progressPercent(progressPercent)
                .build();
    }

    @Override
    public List<OrderResponse> getAll() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAll(String status, String keyword, Pageable pageable) {
        String normalizedStatus = normalizeStatus(status);
        String normalizedKeyword = keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();
        return orderRepository.searchAdminOrders(normalizedStatus, normalizedKeyword, pageable)
                .map(this::convertToResponse);
    }

    public OrderResponse convertToResponse(Order order) {
        if (order == null) {
            return null;
        }

        return OrderResponse.builder()
                .id(order.getId())
                .idUser(order.getIdUser().getId())
                .userName(order.getIdUser().getFullname())
                .userEmail(order.getIdUser().getEmail())
                .idCourse(order.getIdCourse())
                .courseId(order.getIdCourse().getId())
                .courseName(order.getIdCourse().getName())
                .courseImage(order.getIdCourse().getImage())
                .dateOrder(order.getDateOrder())
                .status(order.getStatus())
                .pricePaid(order.getPricePaid())
                .refundEligibleUntil(order.getRefundEligibleUntil())
                .build();
    }


}
