package com.example.back_end.dto.response;

import java.util.List;

public record CourseReviewLessonResponse(
        Long id,
        String name,
        Integer episodeNumber,
        Integer duration,
        Boolean isPreview,
        String videoUrl,
        List<LessonResourceResponse> resources) {
}
