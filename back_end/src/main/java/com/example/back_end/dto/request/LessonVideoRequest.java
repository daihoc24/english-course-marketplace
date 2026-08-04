package com.example.back_end.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class LessonVideoRequest {
    private String publicId;
    private String secureUrl;
    private Integer durationSeconds;
    private Integer episodeNumber;
    private Boolean isPreview;
    private String title;
    private List<LessonResourceRequest> resources;
}
