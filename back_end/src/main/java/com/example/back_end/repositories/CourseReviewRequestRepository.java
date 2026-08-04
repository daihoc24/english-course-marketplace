package com.example.back_end.repositories;
import com.example.back_end.entity.CourseReviewRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
public interface CourseReviewRequestRepository extends JpaRepository<CourseReviewRequest, Long> {
    List<CourseReviewRequest> findAllByStatusOrderBySubmittedAtAsc(String status);
    List<CourseReviewRequest> findAllByOrderBySubmittedAtDesc();
    boolean existsByCourse_IdAndStatus(Integer courseId, String status);
    Optional<CourseReviewRequest> findTopByCourse_IdOrderBySubmittedAtDesc(Integer courseId);

    @Query(
            value = """
                    SELECT r FROM CourseReviewRequest r
                    JOIN FETCH r.course c
                    JOIN FETCH r.seller s
                    LEFT JOIN FETCH r.reviewer reviewer
                    WHERE (:status IS NULL OR r.status = :status)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(c.description, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(s.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(s.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(CONCAT('REV-', STR(r.id))) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR STR(r.id) LIKE CONCAT('%', :keyword, '%'))
                    """,
            countQuery = """
                    SELECT COUNT(r) FROM CourseReviewRequest r
                    JOIN r.course c
                    JOIN r.seller s
                    WHERE (:status IS NULL OR r.status = :status)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(c.description, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(s.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(s.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(CONCAT('REV-', STR(r.id))) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR STR(r.id) LIKE CONCAT('%', :keyword, '%'))
                    """
    )
    Page<CourseReviewRequest> searchAdminReviews(@Param("status") String status,
                                                 @Param("keyword") String keyword,
                                                 Pageable pageable);
}
