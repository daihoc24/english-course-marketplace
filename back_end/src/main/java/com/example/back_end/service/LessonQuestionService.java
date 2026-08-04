package com.example.back_end.service;

import com.example.back_end.dto.request.LessonQuestionReplyRequest;
import com.example.back_end.dto.request.LessonQuestionRequest;
import com.example.back_end.dto.response.LessonQuestionReplyResponse;
import com.example.back_end.dto.response.LessonQuestionResponse;
import com.example.back_end.entity.Course;
import com.example.back_end.entity.CourseDetail;
import com.example.back_end.entity.LessonQuestion;
import com.example.back_end.entity.LessonQuestionReply;
import com.example.back_end.entity.Role;
import com.example.back_end.entity.User;
import com.example.back_end.repositories.CourseDetailRepository;
import com.example.back_end.repositories.CourseRepository;
import com.example.back_end.repositories.LessonQuestionReplyRepository;
import com.example.back_end.repositories.LessonQuestionRepository;
import com.example.back_end.repositories.OrderRepository;
import com.example.back_end.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class LessonQuestionService {
    private final CourseRepository courseRepository;
    private final CourseDetailRepository courseDetailRepository;
    private final LessonQuestionRepository lessonQuestionRepository;
    private final LessonQuestionReplyRepository lessonQuestionReplyRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<LessonQuestionResponse> listForLesson(Integer courseId, Long lessonId) {
        User user = currentUser();
        CourseDetail lesson = findLesson(courseId, lessonId);
        ensureCourseAccess(user, lesson.getCourse());
        return lessonQuestionRepository.findByLesson_IdOrderByUpdatedAtDescIdDesc(lessonId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public LessonQuestionResponse create(Integer courseId, Long lessonId, LessonQuestionRequest request) {
        User user = currentUser();
        CourseDetail lesson = findLesson(courseId, lessonId);
        ensureCourseAccess(user, lesson.getCourse());
        String title = requireText(request == null ? null : request.getTitle(), "Tiêu đề câu hỏi");
        String content = requireText(request == null ? null : request.getContent(), "Nội dung câu hỏi");

        LessonQuestion question = lessonQuestionRepository.save(LessonQuestion.builder()
                .course(lesson.getCourse())
                .lesson(lesson)
                .user(user)
                .title(limit(title, 255))
                .content(content)
                .status("OPEN")
                .build());

        Integer sellerId = lesson.getCourse().getSellerId();
        if (sellerId != null && !sellerId.equals(user.getId())) {
            notificationService.notifyUser(
                    sellerId,
                    user.getId(),
                    "LESSON_QUESTION_CREATED",
                    "Có câu hỏi mới trong khóa học",
                    userDisplayName(user) + " hỏi về bài " + lesson.getEpisodeNumber() + " của khóa \"" + lesson.getCourse().getName() + "\".",
                    "/seller/dashboard?tab=qna"
            );
        }

        return toResponse(question);
    }

    @Transactional
    public LessonQuestionResponse reply(Long questionId, LessonQuestionReplyRequest request) {
        User user = currentUser();
        LessonQuestion question = lessonQuestionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy câu hỏi"));
        ensureCourseAccess(user, question.getCourse());
        String content = requireText(request == null ? null : request.getContent(), "Nội dung phản hồi");
        boolean instructorReply = isInstructorOrAdmin(user, question.getCourse());

        lessonQuestionReplyRepository.save(LessonQuestionReply.builder()
                .question(question)
                .user(user)
                .content(content)
                .build());
        if (!"RESOLVED".equals(question.getStatus())) {
            if (instructorReply) {
                question.setStatus("ANSWERED");
            } else if (question.getUser().getId().equals(user.getId()) && "ANSWERED".equals(question.getStatus())) {
                question.setStatus("OPEN");
            }
        }
        question.setUpdatedAt(LocalDateTime.now());

        if (instructorReply && !question.getUser().getId().equals(user.getId())) {
            notificationService.notifyUser(
                    question.getUser().getId(),
                    user.getId(),
                    "LESSON_QUESTION_ANSWERED",
                    "Giảng viên đã trả lời câu hỏi",
                    "Câu hỏi \"" + question.getTitle() + "\" đã có phản hồi mới.",
                    "/course-video/" + question.getCourse().getId() + "?episode=" + question.getLesson().getEpisodeNumber() + "&questionId=" + question.getId()
            );
        }

        return toResponse(question);
    }

    @Transactional
    public LessonQuestionResponse resolve(Long questionId) {
        User user = currentUser();
        LessonQuestion question = lessonQuestionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy câu hỏi"));
        if (!question.getUser().getId().equals(user.getId()) && !isInstructorOrAdmin(user, question.getCourse())) {
            throw new IllegalArgumentException("Bạn không có quyền đánh dấu câu hỏi này");
        }
        question.setStatus("RESOLVED");
        question.setResolvedAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());
        return toResponse(question);
    }

    @Transactional(readOnly = true)
    public Page<LessonQuestionResponse> sellerQuestions(Integer sellerId, Integer courseId, String status, String keyword, Pageable pageable) {
        User user = currentUser();
        if (!sellerId.equals(user.getId()) && !isAdmin(user)) {
            throw new IllegalArgumentException("Bạn không có quyền xem câu hỏi của người bán này");
        }
        String normalizedStatus = normalizeStatusFilter(status);
        String normalizedKeyword = keyword == null || keyword.trim().isBlank() ? null : keyword.trim();
        return lessonQuestionRepository.searchSellerQuestions(sellerId, courseId, normalizedStatus, normalizedKeyword, pageable)
                .map(this::toResponse);
    }

    private CourseDetail findLesson(Integer courseId, Long lessonId) {
        CourseDetail lesson = courseDetailRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài học"));
        if (!courseId.equals(lesson.getCourseId())) {
            throw new IllegalArgumentException("Bài học không thuộc khóa học này");
        }
        Course course = lesson.getCourse();
        if (course == null) {
            course = courseRepository.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học"));
            lesson.setCourse(course);
        }
        return lesson;
    }

    private void ensureCourseAccess(User user, Course course) {
        if (course == null) throw new IllegalArgumentException("Không tìm thấy khóa học");
        if (isAdmin(user) || user.getId().equals(course.getSellerId())) return;
        if (orderRepository.existsByIdUser_IdAndIdCourse_IdAndStatus(user.getId(), course.getId(), "PAID")) return;
        throw new IllegalArgumentException("Bạn cần mua khóa học để dùng hỏi đáp bài học");
    }

    private LessonQuestionResponse toResponse(LessonQuestion question) {
        List<LessonQuestionReplyResponse> replies = lessonQuestionReplyRepository.findByQuestion_IdOrderByCreatedAtAscIdAsc(question.getId()).stream()
                .map(reply -> toReplyResponse(reply, question.getCourse()))
                .toList();
        LocalDateTime lastReplyAt = replies.stream()
                .map(LessonQuestionReplyResponse::getCreatedAt)
                .max(Comparator.naturalOrder())
                .orElse(null);
        return LessonQuestionResponse.builder()
                .id(question.getId())
                .courseId(question.getCourse().getId())
                .courseName(question.getCourse().getName())
                .lessonId(question.getLesson().getId())
                .lessonName(question.getLesson().getName())
                .episodeNumber(question.getLesson().getEpisodeNumber())
                .userId(question.getUser().getId())
                .userName(userDisplayName(question.getUser()))
                .title(question.getTitle())
                .content(question.getContent())
                .status(question.getStatus())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .resolvedAt(question.getResolvedAt())
                .replyCount(replies.size())
                .lastReplyAt(lastReplyAt)
                .replies(replies)
                .build();
    }

    private LessonQuestionReplyResponse toReplyResponse(LessonQuestionReply reply, Course course) {
        boolean instructor = isInstructorOrAdmin(reply.getUser(), course);
        return LessonQuestionReplyResponse.builder()
                .id(reply.getId())
                .questionId(reply.getQuestion().getId())
                .userId(reply.getUser().getId())
                .userName(userDisplayName(reply.getUser()))
                .userRole(instructor ? "INSTRUCTOR" : "LEARNER")
                .instructorReply(instructor)
                .content(reply.getContent())
                .createdAt(reply.getCreatedAt())
                .build();
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
    }

    private boolean isInstructorOrAdmin(User user, Course course) {
        return isAdmin(user) || (course != null && user.getId().equals(course.getSellerId()));
    }

    private boolean isAdmin(User user) {
        Set<Role> roles = user.getRoles();
        return roles != null && roles.stream().anyMatch(role -> "ADMIN".equalsIgnoreCase(role.getName()));
    }

    private String normalizeStatusFilter(String value) {
        if (value == null || value.trim().isBlank() || "ALL".equalsIgnoreCase(value)) return null;
        String status = value.trim().toUpperCase(Locale.ROOT);
        if ("UNANSWERED".equals(status)) return "OPEN";
        if (!List.of("OPEN", "ANSWERED", "RESOLVED").contains(status)) return null;
        return status;
    }

    private String requireText(String value, String label) {
        if (value == null || value.trim().isBlank()) {
            throw new IllegalArgumentException(label + " không được để trống");
        }
        return value.trim();
    }

    private String limit(String value, int maxLength) {
        return value == null || value.length() <= maxLength ? value : value.substring(0, maxLength);
    }

    private String userDisplayName(User user) {
        if (user == null) return "Người dùng";
        if (user.getFullname() != null && !user.getFullname().isBlank()) return user.getFullname();
        if (user.getUsername() != null && !user.getUsername().isBlank()) return user.getUsername();
        return user.getEmail();
    }
}
