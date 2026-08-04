package com.example.back_end.mapper;

import com.example.back_end.dto.CourseDetailDto;
import com.example.back_end.dto.CourseDto;
import com.example.back_end.entity.Course;
import com.example.back_end.entity.CourseDetail;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseMapper {
    CourseDto toDto (Course course);
    CourseDetailDto toDto(CourseDetail courseDetail);
}
