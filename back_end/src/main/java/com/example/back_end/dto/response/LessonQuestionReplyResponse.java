package com.example.back_end.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonQuestionReplyResponse {
    private Long id;
    private Long questionId;
    private Integer userId;
    private String userName;
    private String userRole;
    private Boolean instructorReply;
    private String content;
    private LocalDateTime createdAt;
}
