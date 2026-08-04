package com.example.back_end.repositories;

import com.example.back_end.entity.LessonResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonResourceRepository extends JpaRepository<LessonResource, Long> {
    List<LessonResource> findByLesson_IdOrderBySortOrderAscIdAsc(Long lessonId);

    void deleteByLesson_Id(Long lessonId);
}
