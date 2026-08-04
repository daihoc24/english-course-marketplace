package com.example.back_end.dto;

import com.example.back_end.entity.Course;
import lombok.Data;

@Data
public class CourseDetailDto {
    private Long id;
    private Course course;
    private Integer episodeNumber;
    private String link;
    private Integer duration;
    private Boolean isPreview;
}
