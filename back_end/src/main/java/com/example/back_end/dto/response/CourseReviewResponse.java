package com.example.back_end.dto.response;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;
@Builder public record CourseReviewResponse(
        Long id, Integer courseId, String courseName, String description, Double price,
        Integer categoryId, String level, String image, Integer totalHour, Integer lessons,
        Integer sellerId, String sellerName, String status, String rejectionReason, LocalDateTime submittedAt,
        List<CourseReviewLessonResponse> lessonVideos) {}
