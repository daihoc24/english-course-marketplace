package com.example.back_end.repositories;

import com.example.back_end.entity.CourseRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CourseRatingRepository extends JpaRepository<CourseRating, Integer> {
    Optional<CourseRating> findByCourseIdAndUserId(Integer courseId, Integer userId);

    @Query("SELECT AVG(cr.rating) FROM CourseRating cr WHERE cr.courseId = :courseId")
    Double getAverageRating(@Param("courseId") Integer courseId);
}
