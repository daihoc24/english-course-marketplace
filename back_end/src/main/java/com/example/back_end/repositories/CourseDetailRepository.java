package com.example.back_end.repositories;

import com.example.back_end.entity.CourseDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseDetailRepository extends JpaRepository<CourseDetail, Long> {
    List<CourseDetail> findByCourse_Id(Integer courseId);

    boolean existsByCourse_Id(Integer courseId);

    boolean existsByCourse_IdAndIsPreviewTrue(Integer courseId);

    boolean existsByCourseIdAndEpisodeNumber(Integer courseId, Integer episodeNumber);

    Optional<CourseDetail> findByCourse_IdAndEpisodeNumber(Integer courseId, Integer episodeNumber);

    @Query("SELECT COUNT(cd) FROM CourseDetail cd WHERE cd.courseId = :courseId")
    Integer countByCourseId(@Param("courseId") Integer courseId);

    @Query("SELECT COALESCE(SUM(cd.duration), 0) FROM CourseDetail cd WHERE cd.courseId = :courseId")
    Integer sumDurationByCourseId(@Param("courseId") Integer courseId);
}
