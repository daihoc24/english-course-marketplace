package com.example.back_end.service;

import com.example.back_end.dto.request.ReportDecisionRequest;
import com.example.back_end.dto.response.ReportResponseDTO;
import com.example.back_end.entity.Course;
import com.example.back_end.entity.Report;
import com.example.back_end.entity.User;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.back_end.repositories.CourseRepository;
import com.example.back_end.repositories.ReportRepository;
import com.example.back_end.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_SELLER_ACTION_REQUIRED = "SELLER_ACTION_REQUIRED";
    private static final String STATUS_SELLER_FIXED = "SELLER_FIXED";
    private static final String STATUS_RESOLVED = "RESOLVED";
    private static final String STATUS_REFUND_RECOMMENDED = "REFUND_RECOMMENDED";

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final NotificationService notificationService;
    private final Cloudinary cloudinary;

    @Transactional
    public ReportResponseDTO createReport(
            Long courseId,
            String subject,
            String detail,
            String category,
            String priority,
            MultipartFile attachment
    ) {
        User learner = currentUser();
        if (courseId == null) {
            throw new IllegalArgumentException("Thiếu thông tin khóa học cần khiếu nại");
        }
        if (subject == null || subject.trim().isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập chủ đề khiếu nại");
        }
        if (detail == null || detail.trim().isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập nội dung khiếu nại");
        }

        Course course = courseRepository.findById(courseId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học"));

        Report report = new Report();
        report.setUser(learner);
        report.setCourse(course);
        report.setSubject(subject.trim());
        report.setDetail(detail.trim());
        report.setCategory(normalize(category, "OTHER"));
        report.setPriority(normalize(priority, "NORMAL"));
        report.setStatus(STATUS_PENDING);
        report.setDate(LocalDateTime.now());

        if (attachment != null && !attachment.isEmpty()) {
            validateAttachment(attachment);
            uploadAttachment(report, attachment);
        }

        reportRepository.save(report);

        notificationService.notifyUsers(
                userRepository.findActiveUsersByRoleName("ADMIN"),
                learner.getId(),
                "REPORT_SUBMITTED",
                "Có khiếu nại mới",
                learner.getFullname() + " đã gửi khiếu nại về khóa \"" + course.getName() + "\".",
                "/admin/ComplaintManagement?reportId=" + report.getId()
        );

        if (course.getSellerId() != null) {
            notificationService.notifyUser(
                    course.getSellerId(),
                    learner.getId(),
                    "REPORT_SUBMITTED",
                    "Khóa học có khiếu nại mới",
                    "Học viên đã gửi khiếu nại về khóa \"" + course.getName() + "\". Vui lòng theo dõi yêu cầu từ admin.",
                    "/seller/reports?reportId=" + report.getId()
            );
        }

        return toResponse(report);
    }

    @Transactional(readOnly = true)
    public List<ReportResponseDTO> getAllReports() {
        return reportRepository.findAll().stream()
                .sorted((left, right) -> safeDate(right).compareTo(safeDate(left)))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ReportResponseDTO> getAllReports(String status, String keyword, Pageable pageable) {
        return reportRepository.searchAdminReports(
                        normalizeStatusFilter(status),
                        normalizeKeyword(keyword),
                        pageable
                )
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ReportResponseDTO> getMyReports(Integer courseId) {
        User user = currentUser();
        List<Report> reports = courseId == null
                ? reportRepository.findByUser_IdOrderByDateDesc(user.getId())
                : reportRepository.findByUser_IdAndCourse_IdOrderByDateDesc(user.getId(), courseId);
        return reports.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ReportResponseDTO> getSellerReports() {
        User seller = currentUser();
        return reportRepository.findByCourse_SellerIdOrderByDateDesc(seller.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ReportResponseDTO> getSellerReports(String status, String keyword, Pageable pageable) {
        User seller = currentUser();
        return reportRepository.searchSellerReports(
                        seller.getId(),
                        normalizeStatusFilter(status),
                        normalizeKeyword(keyword),
                        pageable
                )
                .map(this::toResponse);
    }

    @Transactional
    public ReportResponseDTO requestSellerAction(Long reportId, ReportDecisionRequest request) {
        User admin = currentUser();
        Report report = findReport(reportId);
        Course course = requireCourse(report);
        if (course.getSellerId() == null) {
            throw new IllegalArgumentException("Khiếu nại này không gắn với người bán");
        }
        String content = requireText(request, "Vui lòng nhập yêu cầu cần người bán khắc phục");

        report.setStatus(STATUS_SELLER_ACTION_REQUIRED);
        report.setSellerActionRequest(content);
        report.setSellerActionRequestedAt(LocalDateTime.now());
        report.setSellerActionRequestedBy(admin);

        notificationService.notifyUser(
                course.getSellerId(),
                admin.getId(),
                "REPORT_SELLER_ACTION_REQUIRED",
                "Admin yêu cầu khắc phục khiếu nại",
                "Khóa \"" + course.getName() + "\" cần được kiểm tra và phản hồi khiếu nại.",
                "/seller/reports?reportId=" + report.getId()
        );
        notificationService.notifyUser(
                report.getUser().getId(),
                admin.getId(),
                "REPORT_IN_PROGRESS",
                "Khiếu nại đang được xử lý",
                "Admin đã yêu cầu người bán kiểm tra khóa \"" + course.getName() + "\".",
                "/my-reports?reportId=" + report.getId() + "&courseId=" + course.getId()
        );

        return toResponse(report);
    }

    @Transactional
    public ReportResponseDTO sellerRespond(Long reportId, ReportDecisionRequest request) {
        User seller = currentUser();
        Report report = findReport(reportId);
        Course course = requireCourse(report);
        if (!seller.getId().equals(course.getSellerId())) {
            throw new IllegalArgumentException("Bạn không có quyền phản hồi khiếu nại này");
        }
        if (!STATUS_SELLER_ACTION_REQUIRED.equalsIgnoreCase(report.getStatus())) {
            throw new IllegalArgumentException("Người bán chỉ được phản hồi sau khi admin yêu cầu khắc phục");
        }
        String content = requireText(request, "Vui lòng nhập nội dung phản hồi");

        report.setStatus(STATUS_SELLER_FIXED);
        report.setSellerResponse(content);
        report.setSellerRespondedAt(LocalDateTime.now());
        report.setSellerFixedAt(LocalDateTime.now());

        notificationService.notifyUsers(
                userRepository.findActiveUsersByRoleName("ADMIN"),
                seller.getId(),
                "REPORT_SELLER_FIXED",
                "Người bán đã phản hồi khiếu nại",
                seller.getFullname() + " đã phản hồi về khóa \"" + course.getName() + "\".",
                "/admin/ComplaintManagement?reportId=" + report.getId()
        );
        return toResponse(report);
    }

    @Transactional
    public ReportResponseDTO recommendRefund(Long reportId, ReportDecisionRequest request) {
        User admin = currentUser();
        Report report = findReport(reportId);
        Course course = requireCourse(report);
        String content = requireText(request, "Vui lòng nhập lý do đề xuất hoàn tiền");

        report.setStatus(STATUS_REFUND_RECOMMENDED);
        report.setRefundRecommendedAt(LocalDateTime.now());
        report.setRefundRecommendationReason(content);
        report.setAdminResponse(content);
        report.setResolvedBy(admin);

        notificationService.notifyUser(
                report.getUser().getId(),
                admin.getId(),
                "REPORT_REFUND_RECOMMENDED",
                "Admin đề xuất hoàn tiền",
                "Khiếu nại về khóa \"" + course.getName() + "\" đã được đề xuất chuyển sang hoàn tiền.",
                "/my-reports?reportId=" + report.getId() + "&courseId=" + course.getId()
        );
        if (course.getSellerId() != null) {
            notificationService.notifyUser(
                    course.getSellerId(),
                    admin.getId(),
                    "REPORT_REFUND_RECOMMENDED",
                    "Khóa học có khiếu nại được đề xuất hoàn tiền",
                    "Admin đã đề xuất hoàn tiền cho khiếu nại về khóa \"" + course.getName() + "\".",
                    "/seller/reports?reportId=" + report.getId()
            );
        }

        return toResponse(report);
    }

    @Transactional
    public ReportResponseDTO resolveReport(Long reportId, ReportDecisionRequest request) {
        User admin = currentUser();
        Report report = findReport(reportId);
        if (STATUS_RESOLVED.equalsIgnoreCase(report.getStatus())) {
            throw new IllegalArgumentException("Khiếu nại này đã được phản hồi");
        }
        String content = requireText(request, "Vui lòng nhập phản hồi xử lý");

        report.setStatus(STATUS_RESOLVED);
        report.setAdminResponse(content);
        report.setResolvedAt(LocalDateTime.now());
        report.setResolvedBy(admin);

        Course course = report.getCourse();
        notificationService.notifyUser(
                report.getUser().getId(),
                admin.getId(),
                "REPORT_RESOLVED",
                "Khiếu nại của bạn đã được phản hồi",
                "Admin đã phản hồi khiếu nại về khóa \"" + (course == null ? "khóa học" : course.getName()) + "\".",
                course == null ? "/my-reports" : "/my-reports?reportId=" + report.getId() + "&courseId=" + course.getId()
        );

        return toResponse(report);
    }

    private Report findReport(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khiếu nại"));
    }

    private Course requireCourse(Report report) {
        Course course = report.getCourse();
        if (course == null) {
            throw new IllegalArgumentException("Khiếu nại này không gắn với khóa học");
        }
        return course;
    }

    private String requireText(ReportDecisionRequest request, String message) {
        if (request == null || request.getResponseText() == null || request.getResponseText().trim().isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return request.getResponseText().trim();
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.trim().isBlank()) return fallback;
        return value.trim();
    }

    private String normalizeKeyword(String value) {
        if (value == null || value.trim().isBlank()) return null;
        return value.trim();
    }

    private String normalizeStatusFilter(String value) {
        if (value == null || value.trim().isBlank() || "ALL".equalsIgnoreCase(value)) return null;
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private void validateAttachment(MultipartFile attachment) {
        String contentType = attachment.getContentType();
        boolean image = contentType != null && contentType.startsWith("image/");
        boolean video = contentType != null && contentType.startsWith("video/");
        if (!image && !video) {
            throw new IllegalArgumentException("Tệp đính kèm phải là ảnh hoặc video");
        }
        long maximumSize = video ? 1024L * 1024 * 1024 : 5L * 1024 * 1024;
        if (attachment.getSize() > maximumSize) {
            throw new IllegalArgumentException(video
                    ? "Video đính kèm quá lớn (tối đa 1GB)"
                    : "Ảnh đính kèm quá lớn (tối đa 5MB)");
        }
    }

    private void uploadAttachment(Report report, MultipartFile attachment) {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    attachment.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "report_attachments",
                            "resource_type", "auto"
                    )
            );
            report.setAttachmentUrl((String) uploadResult.get("secure_url"));
            report.setAttachmentPublicId((String) uploadResult.get("public_id"));
        } catch (IOException e) {
            throw new IllegalStateException("Không thể tải tệp đính kèm lên Cloudinary", e);
        }
    }

    private LocalDateTime safeDate(Report report) {
        return report.getDate() == null ? LocalDateTime.MIN : report.getDate();
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
    }

    private ReportResponseDTO toResponse(Report report) {
        User user = report.getUser();
        Course course = report.getCourse();
        User resolvedBy = report.getResolvedBy();
        User sellerActionRequestedBy = report.getSellerActionRequestedBy();
        User seller = course == null || course.getSellerId() == null
                ? null
                : userRepository.findById(course.getSellerId()).orElse(null);

        return ReportResponseDTO.builder()
                .id(report.getId())
                .subject(report.getSubject())
                .detail(report.getDetail())
                .category(report.getCategory())
                .priority(report.getPriority())
                .status(report.getStatus())
                .date(report.getDate())
                .adminResponse(report.getAdminResponse())
                .attachmentUrl(report.getAttachmentUrl())
                .attachmentPublicId(report.getAttachmentPublicId())
                .resolvedAt(report.getResolvedAt())
                .resolvedByName(resolvedBy == null ? null : resolvedBy.getFullname())
                .sellerActionRequest(report.getSellerActionRequest())
                .sellerActionRequestedAt(report.getSellerActionRequestedAt())
                .sellerActionRequestedByName(sellerActionRequestedBy == null ? null : sellerActionRequestedBy.getFullname())
                .sellerResponse(report.getSellerResponse())
                .sellerRespondedAt(report.getSellerRespondedAt())
                .sellerFixedAt(report.getSellerFixedAt())
                .refundRecommendedAt(report.getRefundRecommendedAt())
                .refundRecommendationReason(report.getRefundRecommendationReason())
                .sellerName(seller == null ? null : seller.getFullname())
                .sellerEmail(seller == null ? null : seller.getEmail())
                .userFullName(user == null ? null : user.getFullname())
                .userEmail(user == null ? null : user.getEmail())
                .courseId(course == null ? null : course.getId())
                .courseName(course == null ? null : course.getName())
                .build();
    }
}
