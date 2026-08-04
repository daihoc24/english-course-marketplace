package com.example.back_end.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseRatingRequest {
    private Integer courseId;
    private Integer userId;
    private Integer rating; // 1-5
}
