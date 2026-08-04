package com.example.back_end.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonQuestionResponse {
    private Long id;
    private Integer courseId;
    private String courseName;
    private Long lessonId;
    private String lessonName;
    private Integer episodeNumber;
    private Integer userId;
    private String userName;
    private String title;
    private String content;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private Integer replyCount;
    private LocalDateTime lastReplyAt;
    private List<LessonQuestionReplyResponse> replies;
}
