package com.example.back_end.controller;

import com.example.back_end.dto.request.LessonQuestionReplyRequest;
import com.example.back_end.dto.request.LessonQuestionRequest;
import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.dto.response.LessonQuestionResponse;
import com.example.back_end.service.LessonQuestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
public class LessonQuestionController {
    private final LessonQuestionService lessonQuestionService;

    @GetMapping("/courses/{courseId}/lessons/{lessonId}/questions")
    public ResponseEntity<ApiResponse<List<LessonQuestionResponse>>> listLessonQuestions(
            @PathVariable Integer courseId,
            @PathVariable Long lessonId) {
        try {
            return ResponseEntity.ok(ApiResponse.<List<LessonQuestionResponse>>builder()
                    .code(200)
                    .result(lessonQuestionService.listForLesson(courseId, lessonId))
                    .build());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(ApiResponse.<List<LessonQuestionResponse>>builder()
                    .code(400).message(exception.getMessage()).build());
        } catch (Exception exception) {
            log.error("Unable to list lesson questions", exception);
            return ResponseEntity.internalServerError().body(ApiResponse.<List<LessonQuestionResponse>>builder()
                    .code(500).message("Không thể tải hỏi đáp bài học").build());
        }
    }

    @PostMapping("/courses/{courseId}/lessons/{lessonId}/questions")
    public ResponseEntity<ApiResponse<LessonQuestionResponse>> createLessonQuestion(
            @PathVariable Integer courseId,
            @PathVariable Long lessonId,
            @RequestBody LessonQuestionRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.<LessonQuestionResponse>builder()
                    .code(200)
                    .message("Đã gửi câu hỏi")
                    .result(lessonQuestionService.create(courseId, lessonId, request))
                    .build());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(ApiResponse.<LessonQuestionResponse>builder()
                    .code(400).message(exception.getMessage()).build());
        } catch (Exception exception) {
            log.error("Unable to create lesson question", exception);
            return ResponseEntity.internalServerError().body(ApiResponse.<LessonQuestionResponse>builder()
                    .code(500).message("Không thể gửi câu hỏi").build());
        }
    }

    @PostMapping("/lesson-questions/{questionId}/replies")
    public ResponseEntity<ApiResponse<LessonQuestionResponse>> replyQuestion(
            @PathVariable Long questionId,
            @RequestBody LessonQuestionReplyRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.<LessonQuestionResponse>builder()
                    .code(200)
                    .message("Đã gửi phản hồi")
                    .result(lessonQuestionService.reply(questionId, request))
                    .build());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(ApiResponse.<LessonQuestionResponse>builder()
                    .code(400).message(exception.getMessage()).build());
        } catch (Exception exception) {
            log.error("Unable to reply lesson question", exception);
            return ResponseEntity.internalServerError().body(ApiResponse.<LessonQuestionResponse>builder()
                    .code(500).message("Không thể gửi phản hồi").build());
        }
    }

    @PatchMapping("/lesson-questions/{questionId}/resolved")
    public ResponseEntity<ApiResponse<LessonQuestionResponse>> resolveQuestion(@PathVariable Long questionId) {
        try {
            return ResponseEntity.ok(ApiResponse.<LessonQuestionResponse>builder()
                    .code(200)
                    .message("Đã đánh dấu câu hỏi được giải quyết")
                    .result(lessonQuestionService.resolve(questionId))
                    .build());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(ApiResponse.<LessonQuestionResponse>builder()
                    .code(400).message(exception.getMessage()).build());
        } catch (Exception exception) {
            log.error("Unable to resolve lesson question", exception);
            return ResponseEntity.internalServerError().body(ApiResponse.<LessonQuestionResponse>builder()
                    .code(500).message("Không thể cập nhật câu hỏi").build());
        }
    }

    @GetMapping("/seller/{sellerId}/lesson-questions")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ResponseEntity<ApiResponse<Page<LessonQuestionResponse>>> sellerQuestions(
            @PathVariable Integer sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer courseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        try {
            Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.by(Sort.Direction.DESC, "updatedAt"));
            return ResponseEntity.ok(ApiResponse.<Page<LessonQuestionResponse>>builder()
                    .code(200)
                    .result(lessonQuestionService.sellerQuestions(sellerId, courseId, status, keyword, pageable))
                    .build());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(ApiResponse.<Page<LessonQuestionResponse>>builder()
                    .code(400).message(exception.getMessage()).build());
        } catch (Exception exception) {
            log.error("Unable to list seller lesson questions", exception);
            return ResponseEntity.internalServerError().body(ApiResponse.<Page<LessonQuestionResponse>>builder()
                    .code(500).message("Không thể tải hỏi đáp").build());
        }
    }
}
