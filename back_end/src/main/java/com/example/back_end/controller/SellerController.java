package com.example.back_end.controller;

import com.example.back_end.dto.CourseSummaryDTO;
import com.example.back_end.dto.SellerDTO;
import com.example.back_end.dto.request.CourseCreateRequest;
import com.example.back_end.dto.request.CourseUpdateRequest;
import com.example.back_end.dto.request.LessonResourceRequest;
import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.dto.response.SellerCardDTO;
import com.example.back_end.dto.response.SellerRevenueResponseDTO;
import com.example.back_end.dto.response.SellerStatsResponseDTO;
import com.example.back_end.dto.response.CourseDetailResponseDTO;
import com.example.back_end.dto.response.DirectVideoUploadSignature;
import com.example.back_end.dto.response.LessonResourceResponse;
import com.example.back_end.dto.request.LessonVideoRequest;
import com.example.back_end.entity.Course;
import com.example.back_end.entity.CourseDetail;
import com.example.back_end.entity.User;
import com.example.back_end.repositories.CourseRepository;
import com.example.back_end.repositories.CourseDetailRepository;
import com.example.back_end.repositories.LessonProgressRepository;
import com.example.back_end.repositories.OrderRepository;
import com.example.back_end.repositories.UserRepository;
import com.example.back_end.service.LessonVideoService;
import com.example.back_end.service.LessonResourceService;
import com.example.back_end.service.NotificationService;
import com.example.back_end.service.SellerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/seller")
@RequiredArgsConstructor
public class SellerController {

    private final CourseRepository courseRepository;
    private final CourseDetailRepository courseDetailRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final SellerService sellerService;
    private final LessonVideoService lessonVideoService;
    private final LessonResourceService lessonResourceService;
    private final NotificationService notificationService;

    /** Danh sách giảng viên (user role SELLER, active) + thống kê từ khóa học / đơn hàng */
    @GetMapping("/teachers/catalog")
    public ResponseEntity<ApiResponse<List<SellerCardDTO>>> listTeacherCatalog() {
        try {
            List<SellerCardDTO> cards = sellerService.listPublicSellerCards();
            return ResponseEntity.ok(ApiResponse.<List<SellerCardDTO>>builder()
                    .code(200)
                    .message("Success")
                    .result(cards)
                    .build());
        } catch (Exception e) {
            log.error("Error listing teacher catalog: ", e);
            return ResponseEntity.internalServerError().body(ApiResponse.<List<SellerCardDTO>>builder()
                    .code(500)
                    .message("Error: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<?> getSellerByCourseId(@PathVariable Integer courseId) {
        try {
            log.info("🔍 Getting seller info for courseId: {}", courseId);
            
            Optional<Course> courseOpt = courseRepository.findById(courseId);
            if (courseOpt.isEmpty()) {
                log.warn("❌ Course not found with ID: {}", courseId);
                return ResponseEntity.badRequest().body(
                    ApiResponse.builder()
                        .code(404)
                        .message("Course not found with ID: " + courseId)
                        .build()
                );
            }

            Course course = courseOpt.get();
            Integer sellerId = course.getSellerId();
            
            if (sellerId == null) {
                log.warn("❌ Course {} has no sellerId", courseId);
                return ResponseEntity.badRequest().body(
                    ApiResponse.builder()
                        .code(400)
                        .message("Course has no associated seller")
                        .build()
                );
            }

            log.info("🔍 Looking for seller with ID: {}", sellerId);
            Optional<User> userOpt = userRepository.findById(sellerId);
            if (userOpt.isEmpty()) {
                log.warn("❌ Seller not found with ID: {}", sellerId);
                return ResponseEntity.badRequest().body(
                    ApiResponse.builder()
                        .code(404)
                        .message("Seller not found with ID: " + sellerId)
                        .build()
                );
            }

            User seller = userOpt.get();
            
            if (!seller.getActive()) {
                log.warn("❌ Seller {} is inactive", sellerId);
                return ResponseEntity.badRequest().body(
                    ApiResponse.builder()
                        .code(400)
                        .message("Seller account is inactive")
                        .build()
                );
            }

            SellerDTO sellerDTO = SellerDTO.builder()
                    .id(seller.getId())
                    .fullname(seller.getFullname() != null ? seller.getFullname() : "Unknown")
                    .email(seller.getEmail())
                    .phone(seller.getPhone())
                    .avatar(seller.getAvatar())
                    .introduce(seller.getIntroduce())
                    .certificate(seller.getCertificate())
                    .gender(seller.getGender())
                    .build();

            log.info("✅ Successfully found seller: {}", seller.getFullname());
            return ResponseEntity.ok(ApiResponse.builder()
                    .code(200)
                    .message("Success")
                    .result(sellerDTO)
                    .build());
            
        } catch (Exception e) {
            log.error("❌ Error getting seller for courseId {}: {}", courseId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(
                ApiResponse.builder()
                    .code(500)
                    .message("Internal server error: " + e.getMessage())
                    .build()
            );
        }
    }
    @GetMapping("/{sellerId}/courses")
    public ResponseEntity<?> getCoursesBySeller(@PathVariable Integer sellerId) {
        List<Course> courses = courseRepository.findBySellerIdOrderByIdDesc(sellerId);

        List<CourseSummaryDTO> courseSummaries = courses.stream()
                .filter(course -> Boolean.TRUE.equals(course.getStatus()))
                .map(course -> {
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
                    .image(course.getImage())
                    .categoryId(course.getCategoryId())
                    .level(course.getLevel())
                    .totalHour(course.getTotalHour())
                    .lessons(course.getLessons())
                    .age(course.getAge())
                    .status(course.getStatus())
                    .build();
        }).toList();

        return ResponseEntity.ok().body(
                new ApiResponse(200, "Success", courseSummaries)
        );
    }

    // ===== SELLER COURSE MANAGEMENT APIs =====

    @PostMapping("/{sellerId}/courses")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ResponseEntity<ApiResponse<Course>> createCourse(
            @PathVariable Integer sellerId,
            @RequestBody CourseCreateRequest request) {
        try {
            Course course = sellerService.createCourse(sellerId, request);
            return ResponseEntity.ok(ApiResponse.<Course>builder()
                    .code(200)
                    .message("Course created successfully")
                    .result(course)
                    .build());
        } catch (Exception e) {
            log.error("Error creating course: ", e);
            return ResponseEntity.badRequest().body(ApiResponse.<Course>builder()
                    .code(400)
                    .message("Error creating course: " + e.getMessage())
                    .build());
        }
    }

    @PostMapping("/{sellerId}/courses/{courseId}/lessons/upload-signature")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ResponseEntity<ApiResponse<DirectVideoUploadSignature>> createLessonUploadSignature(
            @PathVariable Integer sellerId,
            @PathVariable Integer courseId) {
        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học"));
            if (!sellerId.equals(course.getSellerId())) {
                throw new IllegalArgumentException("Bạn không sở hữu khóa học này");
            }
            return ResponseEntity.ok(ApiResponse.<DirectVideoUploadSignature>builder().code(200)
                    .result(lessonVideoService.createDirectUploadSignature(sellerId)).build());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(ApiResponse.<DirectVideoUploadSignature>builder().code(400)
                    .message(exception.getMessage()).build());
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(503).body(ApiResponse.<DirectVideoUploadSignature>builder().code(503)
                    .message(exception.getMessage()).build());
        }
    }

    @PostMapping("/{sellerId}/courses/image-upload-signature")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ResponseEntity<ApiResponse<DirectVideoUploadSignature>> createCourseImageUploadSignature(@PathVariable Integer sellerId) {
        try {
            return ResponseEntity.ok(ApiResponse.<DirectVideoUploadSignature>builder().code(200)
                    .result(lessonVideoService.createCourseImageUploadSignature(sellerId)).build());
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(503).body(ApiResponse.<DirectVideoUploadSignature>builder().code(503)
                    .message(exception.getMessage()).build());
        }
    }

    @PostMapping("/{sellerId}/courses/{courseId}/lessons/resources/upload-signature")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ResponseEntity<ApiResponse<DirectVideoUploadSignature>> createLessonResourceUploadSignature(
            @PathVariable Integer sellerId,
            @PathVariable Integer courseId) {
        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("Khong tim thay khoa hoc"));
            if (!sellerId.equals(course.getSellerId())) {
                throw new IllegalArgumentException("Ban khong so huu khoa hoc nay");
            }
            return ResponseEntity.ok(ApiResponse.<DirectVideoUploadSignature>builder().code(200)
                    .result(lessonVideoService.createRawUploadSignature(sellerId, "lesson-resources")).build());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(ApiResponse.<DirectVideoUploadSignature>builder().code(400)
                    .message(exception.getMessage()).build());
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(503).body(ApiResponse.<DirectVideoUploadSignature>builder().code(503)
                    .message(exception.getMessage()).build());
        }
    }

    @PostMapping("/{sellerId}/courses/{courseId}/lessons")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ResponseEntity<ApiResponse<CourseDetailResponseDTO>> saveLessonVideo(
            @PathVariable Integer sellerId, @PathVariable Integer courseId, @RequestBody LessonVideoRequest request) {
        try {
            Course course = courseRepository.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học"));
            if (!sellerId.equals(course.getSellerId())) throw new IllegalArgumentException("Bạn không sở hữu khóa học này");
            if (request.getEpisodeNumber() == null || request.getEpisodeNumber() < 1) {
                throw new IllegalArgumentException("Số thứ tự bài học phải lớn hơn 0");
            }
            if (courseDetailRepository.existsByCourseIdAndEpisodeNumber(courseId, request.getEpisodeNumber())) {
                throw new IllegalArgumentException("Số thứ tự bài học đã tồn tại");
            }
            String prefix = "course-marketplace/lessons/" + sellerId + "/";
            if (request.getPublicId() == null || !request.getPublicId().startsWith(prefix) || request.getSecureUrl() == null) {
                throw new IllegalArgumentException("Thông tin video upload không hợp lệ");
            }
            CourseDetail detail = courseDetailRepository.save(CourseDetail.builder()
                    .course(course)
                    .courseId(courseId)
                    .name(request.getTitle() == null || request.getTitle().isBlank() ? "Bài " + request.getEpisodeNumber() : request.getTitle().trim())
                    .episodeNumber(request.getEpisodeNumber()).link(request.getSecureUrl())
                    .videoPublicId(request.getPublicId())
                    .duration(Math.max(1, (int) Math.ceil((request.getDurationSeconds() == null ? 0 : request.getDurationSeconds()) / 60.0)))
                    .isPreview(Boolean.TRUE.equals(request.getIsPreview()))
                    .build());
            List<LessonResourceResponse> resources = lessonResourceService.replaceResources(detail, request.getResources());
            if (Boolean.TRUE.equals(course.getStatus())) {
                notificationService.notifyUsers(
                        orderRepository.findPaidLearnersByCourseId(courseId),
                        sellerId,
                        "LESSON_ADDED",
                        "Khóa học có bài giảng mới",
                        "Khóa \"" + course.getName() + "\" vừa có bài mới: " + detail.getName() + ".",
                        "/course-video/" + courseId
                );
            }

            return ResponseEntity.ok(ApiResponse.<CourseDetailResponseDTO>builder().code(200)
                    .message("Đã upload bài giảng")
                    .result(CourseDetailResponseDTO.builder().id(detail.getId()).name(detail.getName()).episodeNumber(detail.getEpisodeNumber())
                            .link(detail.getLink()).duration(detail.getDuration()).isPreview(detail.getIsPreview()).resources(resources).build())
                    .build());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(ApiResponse.<CourseDetailResponseDTO>builder()
                    .code(400).message(exception.getMessage()).build());
        } catch (Exception exception) {
            log.error("Unable to upload lesson video", exception);
            return ResponseEntity.internalServerError().body(ApiResponse.<CourseDetailResponseDTO>builder()
                    .code(500).message("Không thể upload video bài giảng").build());
        }
    }

    @GetMapping("/{sellerId}/courses/{courseId}/lessons")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ResponseEntity<ApiResponse<List<CourseDetailResponseDTO>>> getLessonVideos(@PathVariable Integer sellerId, @PathVariable Integer courseId) {
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null || !sellerId.equals(course.getSellerId())) {
            return ResponseEntity.status(403).body(ApiResponse.<List<CourseDetailResponseDTO>>builder().code(403).message("Không có quyền truy cập khóa học này").build());
        }
        List<CourseDetailResponseDTO> lessons = courseDetailRepository.findByCourse_Id(courseId).stream()
                .map(detail -> CourseDetailResponseDTO.builder().id(detail.getId()).name(detail.getName()).episodeNumber(detail.getEpisodeNumber())
                        .duration(detail.getDuration()).isPreview(detail.getIsPreview()).link(detail.getLink())
                        .resources(lessonResourceService.getResponses(detail.getId())).build()).toList();
        return ResponseEntity.ok(ApiResponse.<List<CourseDetailResponseDTO>>builder().code(200).result(lessons).build());
    }

    @PutMapping("/{sellerId}/courses/{courseId}/lessons/{lessonId}/resources")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ResponseEntity<ApiResponse<List<LessonResourceResponse>>> replaceLessonResources(
            @PathVariable Integer sellerId,
            @PathVariable Integer courseId,
            @PathVariable Long lessonId,
            @RequestBody(required = false) List<LessonResourceRequest> resources) {
        try {
            Course course = courseRepository.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học"));
            CourseDetail lesson = courseDetailRepository.findById(lessonId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài giảng"));
            if (!sellerId.equals(course.getSellerId()) || !courseId.equals(lesson.getCourseId())) {
                throw new IllegalArgumentException("Bạn không sở hữu bài giảng này");
            }
            List<LessonResourceResponse> updated = lessonResourceService.replaceResources(lesson, resources);
            return ResponseEntity.ok(ApiResponse.<List<LessonResourceResponse>>builder()
                    .code(200)
                    .message("Đã cập nhật tài liệu bài học")
                    .result(updated)
                    .build());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(ApiResponse.<List<LessonResourceResponse>>builder()
                    .code(400).message(exception.getMessage()).build());
        } catch (Exception exception) {
            log.error("Unable to update lesson resources", exception);
            return ResponseEntity.internalServerError().body(ApiResponse.<List<LessonResourceResponse>>builder()
                    .code(500).message("Không thể cập nhật tài liệu bài học").build());
        }
    }

    @DeleteMapping("/{sellerId}/courses/{courseId}/lessons/{lessonId}")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ResponseEntity<ApiResponse<Void>> deleteLessonVideo(@PathVariable Integer sellerId, @PathVariable Integer courseId, @PathVariable Long lessonId) {
        try {
            Course course = courseRepository.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học"));
            CourseDetail lesson = courseDetailRepository.findById(lessonId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài giảng"));
            if (!sellerId.equals(course.getSellerId()) || !courseId.equals(lesson.getCourseId())) throw new IllegalArgumentException("Bạn không sở hữu bài giảng này");
            lessonProgressRepository.deleteByLesson_Id(lessonId);
            courseDetailRepository.delete(lesson);
            try {
                lessonVideoService.delete(lesson.getVideoPublicId());
            } catch (Exception cleanupException) {
                log.warn("Lesson {} was deleted from database, but Cloudinary cleanup failed", lessonId, cleanupException);
            }
            return ResponseEntity.ok(ApiResponse.<Void>builder().code(200).message("Đã xóa bài giảng").build());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder().code(400).message(exception.getMessage()).build());
        } catch (Exception exception) {
            log.error("Unable to delete lesson video", exception);
            return ResponseEntity.internalServerError().body(ApiResponse.<Void>builder().code(500).message("Không thể xóa bài giảng").build());
        }
    }

    @PutMapping("/{sellerId}/courses/{courseId}")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ResponseEntity<ApiResponse<Course>> updateCourse(
            @PathVariable Integer sellerId,
            @PathVariable Integer courseId,
            @RequestBody CourseUpdateRequest request) {
        try {
            Course course = sellerService.updateCourse(sellerId, courseId, request);
            return ResponseEntity.ok(ApiResponse.<Course>builder()
                    .code(200)
                    .message("Course updated successfully")
                    .result(course)
                    .build());
        } catch (Exception e) {
            log.error("Error updating course: ", e);
            return ResponseEntity.badRequest().body(ApiResponse.<Course>builder()
                    .code(400)
                    .message("Error updating course: " + e.getMessage())
                    .build());
        }
    }

    @DeleteMapping("/{sellerId}/courses/{courseId}")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(
            @PathVariable Integer sellerId,
            @PathVariable Integer courseId) {
        try {
            sellerService.deleteCourse(sellerId, courseId);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .code(200)
                    .message("Course deleted successfully")
                    .build());
        } catch (Exception e) {
            log.error("Error deleting course: ", e);
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .code(400)
                    .message("Error deleting course: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping("/{sellerId}/courses/managed")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ResponseEntity<ApiResponse<Page<CourseSummaryDTO>>> getSellerCoursesManaged(
            @PathVariable Integer sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String level) {
        try {
            Pageable pageable = PageRequest.of(
                    Math.max(page, 0),
                    Math.min(Math.max(size, 1), 50),
                    Sort.by(Sort.Direction.DESC, "id")
            );
            Page<CourseSummaryDTO> courses = sellerService.getSellerCourses(sellerId, keyword, level, status, pageable);
            return ResponseEntity.ok(ApiResponse.<Page<CourseSummaryDTO>>builder()
                    .code(200)
                    .message("Success")
                    .result(courses)
                    .build());
        } catch (Exception e) {
            log.error("Error fetching seller courses: ", e);
            return ResponseEntity.badRequest().body(ApiResponse.<Page<CourseSummaryDTO>>builder()
                    .code(400)
                    .message("Error fetching courses: " + e.getMessage())
                    .build());
        }
    }

    // ===== SELLER STATISTICS APIs =====

    @GetMapping("/{sellerId}/stats")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ResponseEntity<ApiResponse<SellerStatsResponseDTO>> getSellerStats(
            @PathVariable Integer sellerId) {
        try {
            SellerStatsResponseDTO stats = sellerService.getSellerStats(sellerId);
            return ResponseEntity.ok(ApiResponse.<SellerStatsResponseDTO>builder()
                    .code(200)
                    .message("Success")
                    .result(stats)
                    .build());
        } catch (Exception e) {
            log.error("Error fetching seller stats: ", e);
            return ResponseEntity.badRequest().body(ApiResponse.<SellerStatsResponseDTO>builder()
                    .code(400)
                    .message("Error fetching stats: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping("/{sellerId}/revenue")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ResponseEntity<ApiResponse<SellerRevenueResponseDTO>> getSellerRevenue(
            @PathVariable Integer sellerId) {
        try {
            SellerRevenueResponseDTO revenue = sellerService.getSellerRevenue(sellerId);
            return ResponseEntity.ok(ApiResponse.<SellerRevenueResponseDTO>builder()
                    .code(200)
                    .message("Success")
                    .result(revenue)
                    .build());
        } catch (Exception e) {
            log.error("Error fetching seller revenue: ", e);
            return ResponseEntity.badRequest().body(ApiResponse.<SellerRevenueResponseDTO>builder()
                    .code(400)
                    .message("Error fetching revenue: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping("/{sellerId}/revenue/transactions")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ResponseEntity<ApiResponse<Page<SellerRevenueResponseDTO.TransactionData>>> getSellerRevenueTransactions(
            @PathVariable Integer sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {
        try {
            Pageable pageable = PageRequest.of(
                    Math.max(page, 0),
                    Math.min(Math.max(size, 1), 50),
                    Sort.by(Sort.Direction.DESC, "dateOrder").and(Sort.by(Sort.Direction.DESC, "id"))
            );
            Page<SellerRevenueResponseDTO.TransactionData> transactions = sellerService.getSellerRevenueTransactions(
                    sellerId,
                    status,
                    keyword,
                    pageable
            );
            return ResponseEntity.ok(ApiResponse.<Page<SellerRevenueResponseDTO.TransactionData>>builder()
                    .code(200)
                    .message("Success")
                    .result(transactions)
                    .build());
        } catch (Exception e) {
            log.error("Error fetching seller revenue transactions: ", e);
            return ResponseEntity.badRequest().body(ApiResponse.<Page<SellerRevenueResponseDTO.TransactionData>>builder()
                    .code(400)
                    .message("Error fetching revenue transactions: " + e.getMessage())
                    .build());
        }
    }

    // Debug endpoint to check JWT authorities.
    @GetMapping("/debug/auth")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<?> debugAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok().body(Map.of(
            "principal", auth.getPrincipal(),
            "authorities", auth.getAuthorities(),
            "name", auth.getName(),
            "authenticated", auth.isAuthenticated()
        ));
    }

}
