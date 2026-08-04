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
public class CourseCommentResponseDTO {
    private Integer id;
    private Integer courseId;
    private Integer userId;
    private String userFullname;
    private String userAvatar;
    private String content;
    private LocalDateTime createdAt;
}
