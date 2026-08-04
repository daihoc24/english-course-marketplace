package com.example.back_end.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseSummaryDTO {
    private Integer id;
    private String name;
    private String description;
    private Double price;
    private Double rating;
    private Integer episodeCount;
    private Integer duration;
    private Integer categoryId;
    private String level;
    private String image;
    private Integer totalHour;
    private Integer lessons;
    private String age;
    private Boolean status;
    private Long studentCount;
    private String reviewStatus;
    private String rejectionReason;
}
