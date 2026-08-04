package com.example.back_end.service;

import com.example.back_end.dto.CourseSummaryDTO;
import com.example.back_end.dto.request.CourseCreateRequest;
import com.example.back_end.dto.request.CourseUpdateRequest;
import com.example.back_end.constant.PredefinedRole;
import com.example.back_end.dto.response.SellerCardDTO;
import com.example.back_end.dto.response.SellerRevenueResponseDTO;
import com.example.back_end.dto.response.SellerStatsResponseDTO;
import com.example.back_end.entity.Course;
import com.example.back_end.entity.CourseReviewRequest;
import com.example.back_end.entity.Order;
import com.example.back_end.entity.User;
import com.example.back_end.repositories.CourseRepository;
import com.example.back_end.repositories.CourseReviewRequestRepository;
import com.example.back_end.repositories.OrderRepository;
import com.example.back_end.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SellerService {

    private static final int INTRO_MAX_LEN = 160;

    private final CourseRepository courseRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CourseReviewRequestRepository courseReviewRequestRepository;

    public Course createCourse(Integer sellerId, CourseCreateRequest request) {
        // Log request for debugging
        System.out.println("🔍 Creating course for seller: " + sellerId);
        System.out.println("🔍 Request data: " + request);
        
        Course course = Course.builder()
                .name(request.getName())
                .price(request.getPrice() != null ? request.getPrice() : 0.0)
                .sellerId(sellerId)
                .categoryId(request.getCategoryId() != null ? request.getCategoryId() : 1)
                .description(request.getDescription() != null ? request.getDescription() : "")
                .rating(0.0)
                .status(false) // Pending approval
                .level(request.getLevel())
                .image(request.getImage())
                .totalHour(request.getTotalHour())
                .lessons(request.getLessons())
                .age(request.getAge())
                .build();
        
        try {
            Course savedCourse = courseRepository.save(course);
            System.out.println("✅ Course created successfully with ID: " + savedCourse.getId());
            return savedCourse;
        } catch (Exception e) {
            System.err.println("❌ Error saving course: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create course: " + e.getMessage());
        }
    }

    public Course updateCourse(Integer sellerId, Integer courseId, CourseUpdateRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        if (!course.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized: You can only update your own courses");
        }

        boolean wasPublished = Boolean.TRUE.equals(course.getStatus());

        course.setName(request.getName());
        course.setPrice(request.getPrice());
        course.setCategoryId(request.getCategoryId());
        course.setDescription(request.getDescription());
        course.setLevel(request.getLevel());
        course.setImage(request.getImage());
        course.setTotalHour(request.getTotalHour());
        course.setLessons(request.getLessons());
        course.setAge(request.getAge());
        // Chỉ admin được công khai khóa học qua quyết định xét duyệt.
        // Một khóa học đã public khi bị sửa phải quay về bản nháp để kiểm tra lại.
        if (wasPublished) {
            course.setStatus(false);
        }
        
        return courseRepository.save(course);
    }

    public void deleteCourse(Integer sellerId, Integer courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        if (!course.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own courses");
        }
        if (Boolean.TRUE.equals(course.getStatus())) {
            throw new RuntimeException("Khóa học đã được phê duyệt nên không thể xóa trực tiếp. Hãy dùng chức năng ngừng bán/ẩn khóa học.");
        }
        CourseReviewRequest latestReview = courseReviewRequestRepository.findTopByCourse_IdOrderBySubmittedAtDesc(course.getId()).orElse(null);
        if (latestReview != null && "PENDING".equals(latestReview.getStatus())) {
            throw new RuntimeException("Khóa học đang chờ xét duyệt nên chưa thể xóa.");
        }
        
        courseRepository.delete(course);
    }

    public List<CourseSummaryDTO> getSellerCourses(Integer sellerId) {
        List<Course> courses = courseRepository.findBySellerId(sellerId);
        
        return courses.stream().map(course -> {
            return toCourseSummary(course);
        }).collect(Collectors.toList());
    }

    public Page<CourseSummaryDTO> getSellerCourses(Integer sellerId, String keyword, String level, String status, Pageable pageable) {
        return courseRepository.searchSellerManagedCourses(
                        sellerId,
                        normalizeKeyword(keyword),
                        normalizeText(level),
                        normalizeStatus(status),
                        pageable
                )
                .map(this::toCourseSummary);
    }

    public SellerStatsResponseDTO getSellerStats(Integer sellerId) {
        List<Course> courses = courseRepository.findBySellerId(sellerId);
        List<Order> orders = orderRepository.findBySellerIdThroughCourses(sellerId);
        
        int totalCourses = courses.size();
        int activeCourses = (int) courses.stream().filter(Course::getStatus).count();
        int pendingCourses = totalCourses - activeCourses;
        
        List<Order> paidOrders = orders.stream()
                .filter(this::isPaidOrder)
                .toList();

        // Calculate total students (unique users who paid and still have access)
        int totalStudents = (int) paidOrders.stream()
                .map(order -> order.getIdUser().getId())
                .distinct()
                .count();
        
        // Calculate total revenue
        double totalRevenue = paidOrders.stream()
                .mapToDouble(this::orderAmount)
                .sum();
        
        // Calculate average rating
        double averageRating = courses.stream()
                .filter(course -> course.getRating() != null && course.getRating() > 0)
                .mapToDouble(Course::getRating)
                .average()
                .orElse(0.0);
        
        return SellerStatsResponseDTO.builder()
                .totalCourses(totalCourses)
                .activeCourses(activeCourses)
                .pendingCourses(pendingCourses)
                .totalStudents(totalStudents)
                .totalRevenue(totalRevenue)
                .averageRating(averageRating)
                .totalOrders(paidOrders.size())
                .build();
    }

    public List<SellerCardDTO> listPublicSellerCards() {
        List<User> sellers = userRepository.findActiveUsersByRoleName(PredefinedRole.SELLER_ROLE);
        return sellers.stream().map(this::toSellerCard).toList();
    }

    private SellerCardDTO toSellerCard(User u) {
        SellerStatsResponseDTO stats = getSellerStats(u.getId());
        double roundedRating = Math.round(stats.getAverageRating() * 10.0) / 10.0;
        return SellerCardDTO.builder()
                .id(u.getId())
                .fullname(u.getFullname() != null ? u.getFullname() : u.getUsername())
                .avatar(u.getAvatar())
                .introduce(truncateIntro(u.getIntroduce()))
                .certificate(u.getCertificate())
                .averageRating(roundedRating)
                .totalStudents(stats.getTotalStudents())
                .totalCourses(stats.getTotalCourses())
                .activeCourses(stats.getActiveCourses())
                .build();
    }

    private static String truncateIntro(String introduce) {
        if (introduce == null || introduce.isBlank()) {
            return null;
        }
        String t = introduce.trim();
        if (t.length() <= INTRO_MAX_LEN) {
            return t;
        }
        return t.substring(0, INTRO_MAX_LEN).trim() + "…";
    }

    public SellerRevenueResponseDTO getSellerRevenue(Integer sellerId) {
        List<Order> orders = orderRepository.findBySellerIdThroughCourses(sellerId);
        List<Order> paidOrders = orders.stream()
                .filter(this::isPaidOrder)
                .toList();
        
        // Calculate total revenue
        double totalRevenue = paidOrders.stream()
                .mapToDouble(this::orderAmount)
                .sum();
        
        // Calculate current month revenue
        LocalDate now = LocalDate.now();
        double monthlyRevenue = paidOrders.stream()
                .filter(order -> {
                    if (order.getDateOrder() == null) return false;
                    LocalDate orderDate = order.getDateOrder();
                    return orderDate.getYear() == now.getYear() && 
                           orderDate.getMonth() == now.getMonth();
                })
                .mapToDouble(this::orderAmount)
                .sum();
        
        Map<YearMonth, List<Order>> ordersByMonth = paidOrders.stream()
                .filter(order -> order.getDateOrder() != null)
                .collect(Collectors.groupingBy(order -> 
                    YearMonth.from(order.getDateOrder())));
        
        List<SellerRevenueResponseDTO.MonthlyRevenueData> monthlyData = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();
        for (int index = 5; index >= 0; index--) {
            YearMonth month = currentMonth.minusMonths(index);
            List<Order> monthOrders = ordersByMonth.getOrDefault(month, List.of());
            double monthRevenue = monthOrders.stream().mapToDouble(this::orderAmount).sum();
            monthlyData.add(SellerRevenueResponseDTO.MonthlyRevenueData.builder()
                    .month(month.format(DateTimeFormatter.ofPattern("yyyy-MM")))
                    .revenue(monthRevenue)
                    .orders(monthOrders.size())
                    .build());
        }

        return SellerRevenueResponseDTO.builder()
                .totalRevenue(totalRevenue)
                .monthlyRevenue(monthlyRevenue)
                .monthlyData(monthlyData)
                .transactions(List.of())
                .build();
    }

    public Page<SellerRevenueResponseDTO.TransactionData> getSellerRevenueTransactions(
            Integer sellerId,
            String status,
            String keyword,
            Pageable pageable
    ) {
        String safeStatus = normalizeStatus(status);
        return orderRepository.searchSellerOrders(
                        sellerId,
                        safeStatus == null ? "PAID" : safeStatus,
                        normalizeKeyword(keyword),
                        pageable
                )
                .map(this::toTransactionData);
    }

    private CourseSummaryDTO toCourseSummary(Course course) {
        CourseReviewRequest latestReview = courseReviewRequestRepository.findTopByCourse_IdOrderBySubmittedAtDesc(course.getId()).orElse(null);
        int totalEpisodes = course.getCourseDetails() != null ? course.getCourseDetails().size() : 0;
        int totalDuration = course.getCourseDetails() != null
                ? course.getCourseDetails().stream().mapToInt(detail -> detail.getDuration() != null ? detail.getDuration() : 0).sum()
                : 0;

        return CourseSummaryDTO.builder()
                .id(course.getId())
                .name(course.getName())
                .description(course.getDescription())
                .price(course.getPrice())
                .rating(course.getRating())
                .episodeCount(totalEpisodes)
                .duration(totalDuration)
                .categoryId(course.getCategoryId())
                .level(course.getLevel())
                .image(course.getImage())
                .totalHour((int) Math.ceil(totalDuration / 60.0))
                .lessons(totalEpisodes)
                .age(course.getAge())
                .status(course.getStatus())
                .studentCount(orderRepository.countByIdCourse_IdAndStatus(course.getId(), "PAID"))
                .reviewStatus(latestReview == null ? null : latestReview.getStatus())
                .rejectionReason(latestReview == null ? null : latestReview.getRejectionReason())
                .build();
    }

    private SellerRevenueResponseDTO.TransactionData toTransactionData(Order order) {
        Course course = order.getIdCourse();
        User learner = order.getIdUser();
        return SellerRevenueResponseDTO.TransactionData.builder()
                .orderId(order.getId())
                .courseId(course == null ? null : course.getId())
                .courseName(course == null ? "Khóa học không xác định" : course.getName())
                .learnerName(learner == null ? "Học viên" : learner.getFullname())
                .dateOrder(order.getDateOrder())
                .amount(orderAmount(order))
                .status(order.getStatus())
                .build();
    }

    private boolean isPaidOrder(Order order) {
        return order != null && "PAID".equalsIgnoreCase(order.getStatus());
    }

    private double orderAmount(Order order) {
        if (order == null) {
            return 0.0;
        }
        if (order.getPricePaid() != null) {
            return order.getPricePaid();
        }
        Course course = order.getIdCourse();
        return course == null || course.getPrice() == null ? 0.0 : course.getPrice();
    }

    private String normalizeKeyword(String value) {
        return normalizeText(value);
    }

    private String normalizeStatus(String value) {
        String normalized = normalizeText(value);
        if (normalized == null || "ALL".equalsIgnoreCase(normalized)) {
            return null;
        }
        return normalized.toUpperCase(Locale.ROOT);
    }

    private String normalizeText(String value) {
        if (value == null || value.trim().isBlank()) {
            return null;
        }
        return value.trim();
    }
} 
