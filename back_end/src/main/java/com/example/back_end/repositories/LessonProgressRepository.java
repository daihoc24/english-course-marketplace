package com.example.back_end.repositories;

import com.example.back_end.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    Optional<LessonProgress> findByUser_IdAndLesson_Id(Integer userId, Long lessonId);

    @Query("SELECT lp.lesson.id FROM LessonProgress lp WHERE lp.user.id = :userId AND lp.course.id = :courseId AND lp.completed = true")
    List<Long> findCompletedLessonIds(@Param("userId") Integer userId, @Param("courseId") Integer courseId);

    long countByUser_IdAndCourse_IdAndCompletedTrue(Integer userId, Integer courseId);

    @Modifying
    @Transactional
    long deleteByLesson_Id(Long lessonId);
}
