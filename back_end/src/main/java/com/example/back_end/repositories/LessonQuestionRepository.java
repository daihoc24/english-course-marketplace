package com.example.back_end.repositories;

import com.example.back_end.entity.LessonQuestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonQuestionRepository extends JpaRepository<LessonQuestion, Long> {
    List<LessonQuestion> findByLesson_IdOrderByUpdatedAtDescIdDesc(Long lessonId);

    @Query(
            value = """
                    SELECT q FROM LessonQuestion q
                    JOIN q.course c
                    JOIN q.lesson l
                    JOIN q.user u
                    WHERE c.sellerId = :sellerId
                      AND (:courseId IS NULL OR c.id = :courseId)
                      AND (:status IS NULL OR q.status = :status)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(q.title, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(q.content, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(l.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(q) FROM LessonQuestion q
                    JOIN q.course c
                    JOIN q.lesson l
                    JOIN q.user u
                    WHERE c.sellerId = :sellerId
                      AND (:courseId IS NULL OR c.id = :courseId)
                      AND (:status IS NULL OR q.status = :status)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(q.title, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(q.content, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(l.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """
    )
    Page<LessonQuestion> searchSellerQuestions(@Param("sellerId") Integer sellerId,
                                               @Param("courseId") Integer courseId,
                                               @Param("status") String status,
                                               @Param("keyword") String keyword,
                                               Pageable pageable);
}
