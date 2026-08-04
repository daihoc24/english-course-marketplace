package com.example.back_end.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseCreateRequest {
    private String name;
    private Double price;
    private Integer categoryId;
    private String description;
    private String level;
    private String image;
    private Integer totalHour;
    private Integer lessons;
    private String age;
} 