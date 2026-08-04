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
public class CourseDetailResponseDTO {
    private Long id;
    private String name;
    private Integer episodeNumber;
    private String link;
    private Integer duration;
    private Boolean isPreview;
    private Boolean completed;
    private List<LessonResourceResponse> resources;
} 
