package com.example.back_end.controller;

import com.example.back_end.dto.request.CourseCommentRequest;
import com.example.back_end.dto.request.CourseRatingRequest;
import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.dto.response.CourseCommentResponseDTO;
import com.example.back_end.dto.response.CourseDetailResponseDTO;
import com.example.back_end.dto.response.CourseListResponseDTO;
import com.example.back_end.dto.response.CourseRatingResponseDTO;
import com.example.back_end.dto.response.LearningProgressResponse;
import com.example.back_end.entity.Category;
import com.example.back_end.entity.CourseDetail;
import com.example.back_end.entity.LessonProgress;
import com.example.back_end.repositories.CategoryRepository;
import com.example.back_end.repositories.CourseDetailRepository;
import com.example.back_end.repositories.LessonProgressRepository;
import com.example.back_end.repositories.OrderRepository;
import com.example.back_end.repositories.UserRepository;
import com.example.back_end.repositories.CourseRepository;
import com.example.back_end.entity.User;
import com.example.back_end.entity.Course;
import com.example.back_end.service.CourseCommentService;
import com.example.back_end.service.CourseServiceImpl;
import com.example.back_end.service.order.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@RestController
@RequestMapping("/courses")
public class CourseController {

    @Autowired
    private CourseServiceImpl courseService;
    @Autowired
    private CourseCommentService courseCommentService;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private CourseDetailRepository courseDetailRepository;
    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    @GetMapping
    public ApiResponse<List<CourseListResponseDTO>> getAllCourses() {
        try {
            List<CourseListResponseDTO> courses = courseService.getAllCourses();
            return ApiResponse.<List<CourseListResponseDTO>>builder()
                    .code(200)
                    .message("Fetched all courses successfully.")
                    .result(courses)
                    .build();
        } catch (Exception e) {
            log.error("Error fetching courses: ", e);
            return ApiResponse.<List<CourseListResponseDTO>>builder()
                    .code(500)
                    .message("Error fetching courses: " + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/categories")
    public ApiResponse<List<Category>> getCategories() {
        return ApiResponse.<List<Category>>builder()
                .code(200)
                .message("Fetched categories successfully.")
                .result(categoryRepository.findAll())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<CourseListResponseDTO> getCourseById(@PathVariable Integer id) {
        try {
            CourseListResponseDTO course = courseService.getCourseById(id);
            if (course == null) {
                return ApiResponse.<CourseListResponseDTO>builder()
                        .code(404)
                        .message("Course not found")
                        .build();
            }
            if (!Boolean.TRUE.equals(course.getStatus())) {
                return ApiResponse.<CourseListResponseDTO>builder()
                        .code(404)
                        .message("Course is not available")
                        .build();
            }

            // Kiểm tra xem người dùng đã mua chưa và lấy ngày mua
            boolean isPurchased = false;
            java.time.LocalDate purchaseDate = null;
            
            User currentUser = getAuthenticatedUserOrNull();
            if (currentUser != null) {
                // Sử dụng method mới để lấy ngày mua
                purchaseDate = courseService.getCoursePurchaseDate(currentUser.getId(), id);
                isPurchased = (purchaseDate != null);
            }
            
            course.setPurchased(isPurchased);
            course.setPurchaseDate(purchaseDate);

            return ApiResponse.<CourseListResponseDTO>builder()
                    .code(200)
                    .message("Course found")
                    .result(course)
                    .build();
        } catch (Exception e) {
            log.error("Error fetching course: ", e);
            return ApiResponse.<CourseListResponseDTO>builder()
                    .code(500)
                    .message("Error fetching course: " + e.getMessage())
                    .build();
        }
    }



    @GetMapping("/user/{userId}/purchased-course-ids")
    @PreAuthorize("@userAccessAuthorization.canAccess(#userId, authentication)")
    public ApiResponse<List<Integer>> getPurchasedCourseIds(@PathVariable Integer userId) {
        try {
            List<Integer> courseIds = orderRepository.findCourseIdsByUserId(userId);
            return ApiResponse.<List<Integer>>builder()
                    .code(200)
                    .message("Fetched purchased course IDs successfully")
                    .result(courseIds)
                    .build();
        } catch (Exception e) {
            log.error("Error fetching purchased course IDs: ", e);
            return ApiResponse.<List<Integer>>builder()
                    .code(500)
                    .message("Error fetching purchased course IDs: " + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/details/{id}")
    public ApiResponse<List<CourseDetailResponseDTO>> getCourseDetailsByCourseId(@PathVariable Integer id) {
        Course course = courseRepository.findById(id).orElse(null);
        if (course == null || !Boolean.TRUE.equals(course.getStatus())) {
            return ApiResponse.<List<CourseDetailResponseDTO>>builder()
                    .code(404)
                    .message("Course is not available")
                    .build();
        }
        List<CourseDetailResponseDTO> details = courseService.getCourseDetailsByCourseId(id);
        if (details == null) {
            return ApiResponse.<List<CourseDetailResponseDTO>>builder()
                    .code(404)
                    .message("Course not found")
                    .build();
        }

        return ApiResponse.<List<CourseDetailResponseDTO>>builder()
                .code(200)
                .message("Fetched course details successfully.")
                .result(details.stream().map(detail -> CourseDetailResponseDTO.builder()
                        .id(detail.getId()).name(detail.getName()).episodeNumber(detail.getEpisodeNumber()).duration(detail.getDuration())
                        .isPreview(detail.getIsPreview()).link(Boolean.TRUE.equals(detail.getIsPreview()) ? detail.getLink() : null)
                        .resources(Boolean.TRUE.equals(detail.getIsPreview()) ? detail.getResources() : List.of())
                        .build()).toList())
                .build();
    }

    @GetMapping("/{id}/learning-content")
    public ApiResponse<List<CourseDetailResponseDTO>> getLearningContent(@PathVariable Integer id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Khong tim thay khoa hoc"));
        if (!Boolean.TRUE.equals(course.getStatus())) {
            return ApiResponse.<List<CourseDetailResponseDTO>>builder()
                    .code(404)
                    .message("Course is not available")
                    .build();
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isRealUser = authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getName());
        boolean hasFullAccess = false;
        Set<Long> completedLessonIds = Set.of();
        if (isRealUser) {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("Khong tim thay nguoi dung"));
            hasFullAccess = orderRepository.existsByIdUser_IdAndIdCourse_IdAndStatus(user.getId(), id, "PAID")
                    || user.getId().equals(course.getSellerId());
            completedLessonIds = new HashSet<>(lessonProgressRepository.findCompletedLessonIds(user.getId(), id));
        }
        final boolean canSeeFullContent = hasFullAccess;
        final Set<Long> completedIds = completedLessonIds;
        List<CourseDetailResponseDTO> details = courseService.getCourseDetailsByCourseId(id).stream()
                .map(detail -> {
                    boolean canAccessLesson = canSeeFullContent || Boolean.TRUE.equals(detail.getIsPreview());
                    return CourseDetailResponseDTO.builder().id(detail.getId()).name(detail.getName()).episodeNumber(detail.getEpisodeNumber())
                        .duration(detail.getDuration()).isPreview(detail.getIsPreview())
                        .completed(completedIds.contains(detail.getId()))
                        .link(canAccessLesson ? detail.getLink() : null)
                        .resources(canAccessLesson ? detail.getResources() : List.of())
                        .build();
                })
                .toList();
        return ApiResponse.<List<CourseDetailResponseDTO>>builder().code(200).result(details).build();
    }

    @GetMapping("/{courseId}/progress")
    public ApiResponse<LearningProgressResponse> getLearningProgress(@PathVariable Integer courseId) {
        User user = getAuthenticatedUser();
        ensurePurchased(courseId, user);
        return ApiResponse.<LearningProgressResponse>builder()
                .code(200)
                .message("Fetched learning progress")
                .result(buildProgress(courseId, user.getId()))
                .build();
    }

    @PostMapping("/{courseId}/progress/{lessonId}")
    public ApiResponse<LearningProgressResponse> markLessonCompleted(@PathVariable Integer courseId,
                                                                     @PathVariable Long lessonId) {
        User user = getAuthenticatedUser();
        ensurePurchased(courseId, user);
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Khong tim thay khoa hoc"));
        CourseDetail lesson = courseDetailRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay bai hoc"));
        if (!courseId.equals(lesson.getCourseId())) {
            throw new IllegalArgumentException("Bai hoc khong thuoc khoa hoc nay");
        }

        LessonProgress progress = lessonProgressRepository
                .findByUser_IdAndLesson_Id(user.getId(), lessonId)
                .orElseGet(LessonProgress::new);
        progress.setUser(user);
        progress.setCourse(course);
        progress.setLesson(lesson);
        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        lessonProgressRepository.save(progress);

        return ApiResponse.<LearningProgressResponse>builder()
                .code(200)
                .message("Da danh dau bai hoc da hoc")
                .result(buildProgress(courseId, user.getId()))
                .build();
    }

    @DeleteMapping("/{courseId}/progress/{lessonId}")
    public ApiResponse<LearningProgressResponse> unmarkLessonCompleted(@PathVariable Integer courseId,
                                                                       @PathVariable Long lessonId) {
        User user = getAuthenticatedUser();
        ensurePurchased(courseId, user);
        CourseDetail lesson = courseDetailRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay bai hoc"));
        if (!courseId.equals(lesson.getCourseId())) {
            throw new IllegalArgumentException("Bai hoc khong thuoc khoa hoc nay");
        }

        lessonProgressRepository.findByUser_IdAndLesson_Id(user.getId(), lessonId).ifPresent(progress -> {
            progress.setCompleted(false);
            lessonProgressRepository.save(progress);
        });

        return ApiResponse.<LearningProgressResponse>builder()
                .code(200)
                .message("Da bo danh dau bai hoc")
                .result(buildProgress(courseId, user.getId()))
                .build();
    }

    @GetMapping("/{courseId}/comments")
    public ApiResponse<List<CourseCommentResponseDTO>> getCourseComments(@PathVariable Integer courseId) {
        try {
            List<CourseCommentResponseDTO> list = courseCommentService.listByCourseId(courseId);
            return ApiResponse.<List<CourseCommentResponseDTO>>builder()
                    .code(200)
                    .message("Success")
                    .result(list)
                    .build();
        } catch (RuntimeException e) {
            log.error("Error listing comments: ", e);
            return ApiResponse.<List<CourseCommentResponseDTO>>builder()
                    .code(404)
                    .message(e.getMessage())
                    .build();
        }
    }

    @PostMapping("/{courseId}/comments")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<CourseCommentResponseDTO> addCourseComment(
            @PathVariable Integer courseId,
            @RequestBody CourseCommentRequest request) {
        try {
            CourseCommentResponseDTO created = courseCommentService.addComment(courseId, request);
            return ApiResponse.<CourseCommentResponseDTO>builder()
                    .code(200)
                    .message("Đã đăng bình luận")
                    .result(created)
                    .build();
        } catch (RuntimeException e) {
            log.error("Error adding comment: ", e);
            return ApiResponse.<CourseCommentResponseDTO>builder()
                    .code(400)
                    .message(e.getMessage())
                    .build();
        }
    }

    @PostMapping("/{id}/rate")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<String> rateCourse(@PathVariable Integer id, @RequestBody CourseRatingRequest request) {
        try {
            User user = getAuthenticatedUser();
            courseService.submitRating(id, user.getId(), request.getRating());
            return ApiResponse.<String>builder()
                    .code(200)
                    .message("Rating submitted successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error rating course: ", e);
            return ApiResponse.<String>builder()
                    .code(400)
                    .message(e.getMessage())
                    .build();
        }
    }

    @GetMapping("/{courseId}/user-rating/{userId}")
    @PreAuthorize("@userAccessAuthorization.canAccess(#userId, authentication)")
    public ApiResponse<CourseRatingResponseDTO> getUserRating(@PathVariable Integer courseId, @PathVariable Integer userId) {
        try {
            CourseRatingResponseDTO rating = courseService.getUserRating(courseId, userId);
            return ApiResponse.<CourseRatingResponseDTO>builder()
                    .code(200)
                    .message("Success")
                    .result(rating)
                    .build();
        } catch (Exception e) {
            return ApiResponse.<CourseRatingResponseDTO>builder()
                    .code(500)
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }
    
    // Tìm kiếm khóa học theo từ khóa
    @GetMapping("/search")
    public ApiResponse<List<CourseListResponseDTO>> searchCourses(@RequestParam(required = false) String keyword) {
        try {
            List<CourseListResponseDTO> courses;
            if (keyword == null || keyword.trim().isEmpty()) {
                courses = courseService.getAllCourses();
            } else {
                courses = courseService.searchCourses(keyword.trim());
            }
            return ApiResponse.<List<CourseListResponseDTO>>builder()
                    .code(200)
                    .message("Search completed successfully")
                    .result(courses)
                    .build();
        } catch (Exception e) {
            log.error("Error searching courses: ", e);
            return ApiResponse.<List<CourseListResponseDTO>>builder()
                    .code(500)
                    .message("Error searching courses: " + e.getMessage())
                    .build();
        }
    }
    
    // Tìm kiếm khóa học theo category
    @GetMapping("/search/category/{categoryId}")
    public ApiResponse<List<CourseListResponseDTO>> searchCoursesByCategory(@PathVariable Integer categoryId) {
        try {
            List<CourseListResponseDTO> courses = courseService.getCoursesByCategory(categoryId);
            return ApiResponse.<List<CourseListResponseDTO>>builder()
                    .code(200)
                    .message("Search by category completed successfully")
                    .result(courses)
                    .build();
        } catch (Exception e) {
            log.error("Error searching courses by category: ", e);
            return ApiResponse.<List<CourseListResponseDTO>>builder()
                    .code(500)
                    .message("Error searching courses by category: " + e.getMessage())
                    .build();
        }
    }
    
    // Tìm kiếm khóa học theo khoảng giá
    @GetMapping("/search/price")
    public ApiResponse<List<CourseListResponseDTO>> searchCoursesByPriceRange(
            @RequestParam Double minPrice, 
            @RequestParam Double maxPrice) {
        try {
            List<CourseListResponseDTO> courses = courseService.getCoursesByPriceRange(minPrice, maxPrice);
            return ApiResponse.<List<CourseListResponseDTO>>builder()
                    .code(200)
                    .message("Search by price range completed successfully")
                    .result(courses)
                    .build();
        } catch (Exception e) {
            log.error("Error searching courses by price range: ", e);
            return ApiResponse.<List<CourseListResponseDTO>>builder()
                    .code(500)
                    .message("Error searching courses by price range: " + e.getMessage())
                    .build();
        }
    }
    

    
    private static final Set<String> VALID_SORT_FIELDS = Set.of("createdDate", "price", "averageRating");
    private static final Set<String> VALID_SORT_DIRECTIONS = Set.of("asc", "desc");

    // Tìm kiếm nâng cao với nhiều tiêu chí, phân trang và sắp xếp
    @GetMapping("/search/advanced")
    public ApiResponse<Page<CourseListResponseDTO>> searchCoursesAdvanced(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Boolean status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        try {
            // Clamp size to [1, 100]
            size = Math.max(1, Math.min(size, 100));

            // Ensure page is non-negative
            page = Math.max(0, page);

            // Validate sortBy - fall back to "createdDate" if invalid
            if (!VALID_SORT_FIELDS.contains(sortBy)) {
                sortBy = "createdDate";
                sortDirection = "desc";
            }

            // Validate sortDirection - fall back to "desc" if invalid
            if (!VALID_SORT_DIRECTIONS.contains(sortDirection)) {
                sortDirection = "desc";
            }

            Page<CourseListResponseDTO> courses = courseService.searchCoursesAdvancedPaginated(
                keyword, categoryId, minPrice, maxPrice, minRating, status,
                page, size, sortBy, sortDirection);
            return ApiResponse.<Page<CourseListResponseDTO>>builder()
                    .code(200)
                    .message("Advanced search completed successfully")
                    .result(courses)
                    .build();
        } catch (Exception e) {
            log.error("Error in advanced search: ", e);
            return ApiResponse.<Page<CourseListResponseDTO>>builder()
                    .code(500)
                    .message("Error in advanced search: " + e.getMessage())
                    .build();
        }
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new RuntimeException("Unauthenticated");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Khong tim thay nguoi dung"));
    }

    private User getAuthenticatedUserOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return null;
        }
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    private void ensurePurchased(Integer courseId, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay khoa hoc"));
        boolean hasAccess = orderRepository.existsByIdUser_IdAndIdCourse_IdAndStatus(user.getId(), courseId, "PAID")
                || user.getId().equals(course.getSellerId());
        if (!hasAccess) {
            throw new RuntimeException("Ban chua mua khoa hoc nay");
        }
    }

    private LearningProgressResponse buildProgress(Integer courseId, Integer userId) {
        int totalLessons = Math.max(0, courseDetailRepository.countByCourseId(courseId));
        List<Long> completedLessonIds = lessonProgressRepository.findCompletedLessonIds(userId, courseId);
        int completedLessons = completedLessonIds.size();
        int progressPercent = totalLessons == 0 ? 0 : (int) Math.round((completedLessons * 100.0) / totalLessons);
        return LearningProgressResponse.builder()
                .courseId(courseId)
                .totalLessons(totalLessons)
                .completedLessons(completedLessons)
                .progressPercent(progressPercent)
                .completedLessonIds(completedLessonIds)
                .build();
    }
}
