package com.example.back_end.repositories;

import com.example.back_end.entity.CourseComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseCommentRepository extends JpaRepository<CourseComment, Integer> {

    List<CourseComment> findByCourseIdOrderByCreatedAtDesc(Integer courseId);
}
