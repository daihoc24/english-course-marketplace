package com.example.back_end.repositories;

import com.example.back_end.entity.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    boolean existsByUser_IdAndCourse_IdAndSubject(Integer userId, Integer courseId, String subject);
    List<Report> findByUser_IdOrderByDateDesc(Integer userId);
    List<Report> findByUser_IdAndCourse_IdOrderByDateDesc(Integer userId, Integer courseId);
    List<Report> findByCourse_SellerIdOrderByDateDesc(Integer sellerId);

    @Query(
            value = """
                    SELECT r FROM Report r
                    LEFT JOIN FETCH r.user u
                    LEFT JOIN FETCH r.course c
                    LEFT JOIN FETCH r.resolvedBy resolvedBy
                    LEFT JOIN FETCH r.sellerActionRequestedBy sellerActionRequestedBy
                    WHERE (:status IS NULL OR UPPER(r.status) = :status)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(u.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.subject, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.detail, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.category, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.priority, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(r) FROM Report r
                    LEFT JOIN r.user u
                    LEFT JOIN r.course c
                    WHERE (:status IS NULL OR UPPER(r.status) = :status)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(u.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.subject, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.detail, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.category, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.priority, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """
    )
    Page<Report> searchAdminReports(@Param("status") String status,
                                    @Param("keyword") String keyword,
                                    Pageable pageable);

    @Query(
            value = """
                    SELECT r FROM Report r
                    LEFT JOIN FETCH r.user u
                    LEFT JOIN FETCH r.course c
                    LEFT JOIN FETCH r.resolvedBy resolvedBy
                    LEFT JOIN FETCH r.sellerActionRequestedBy sellerActionRequestedBy
                    WHERE c.sellerId = :sellerId
                      AND (:status IS NULL OR UPPER(r.status) = :status)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(u.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.subject, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.detail, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.category, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.priority, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(r) FROM Report r
                    LEFT JOIN r.user u
                    LEFT JOIN r.course c
                    WHERE c.sellerId = :sellerId
                      AND (:status IS NULL OR UPPER(r.status) = :status)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(u.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.subject, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.detail, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.category, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.priority, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """
    )
    Page<Report> searchSellerReports(@Param("sellerId") Integer sellerId,
                                     @Param("status") String status,
                                     @Param("keyword") String keyword,
                                     Pageable pageable);
}
