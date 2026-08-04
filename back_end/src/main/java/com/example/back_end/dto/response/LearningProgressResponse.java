package com.example.back_end.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningProgressResponse {
    private Integer courseId;
    private Integer totalLessons;
    private Integer completedLessons;
    private Integer progressPercent;
    private List<Long> completedLessonIds;
}
