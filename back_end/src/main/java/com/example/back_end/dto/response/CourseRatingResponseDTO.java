package com.example.back_end.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseRatingResponseDTO {
    private Integer id;
    private Integer courseId;
    private Integer userId;
    private Integer rating;
    private String createdAt;
}
