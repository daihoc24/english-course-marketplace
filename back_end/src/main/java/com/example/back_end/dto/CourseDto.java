package com.example.back_end.dto;

import com.example.back_end.entity.Course;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseDto {
    private Integer id;
    private String name;
    private Double price;
    private Integer sellerId;
    private Integer categoryId;
    private String description;
    private Double rating;
    private Boolean status;
    private List<CourseDetailDto> courseDetails;


}
