package com.example.back_end.repositories;

import com.example.back_end.entity.RefundRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RefundRequestRepository extends JpaRepository<RefundRequest, Long> {
    boolean existsByOrder_Id(Integer orderId);
    boolean existsByOrder_IdAndStatusIn(Integer orderId, List<String> statuses);
    boolean existsByOrder_IdCourse_SellerIdAndStatusIn(Integer sellerId, List<String> statuses);
    long countByOrder_IdCourse_SellerIdAndStatus(Integer sellerId, String status);
    long countByOrder_IdCourse_SellerIdAndStatusIn(Integer sellerId, List<String> statuses);
    List<RefundRequest> findAllByRequester_IdOrderByRequestedAtDesc(Integer requesterId);
    List<RefundRequest> findAllByOrder_IdCourse_SellerIdOrderByRequestedAtDesc(Integer sellerId);
    List<RefundRequest> findAllByOrderByRequestedAtAsc();

    @Query(
            value = """
                    SELECT r FROM RefundRequest r
                    JOIN FETCH r.order o
                    JOIN FETCH o.idCourse c
                    JOIN FETCH o.idUser buyer
                    JOIN FETCH r.requester requester
                    LEFT JOIN FETCH r.reviewer reviewer
                    WHERE (:status IS NULL OR r.status = :status)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(requester.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(requester.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.reason, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.adminNote, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.gatewayProvider, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.gatewayRefundMessage, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(r) FROM RefundRequest r
                    JOIN r.order o
                    JOIN o.idCourse c
                    JOIN r.requester requester
                    WHERE (:status IS NULL OR r.status = :status)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(requester.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(requester.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.reason, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.adminNote, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.gatewayProvider, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.gatewayRefundMessage, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """
    )
    Page<RefundRequest> searchAdminRefundRequests(@Param("status") String status,
                                                  @Param("keyword") String keyword,
                                                  Pageable pageable);

    @Query(
            value = """
                    SELECT r FROM RefundRequest r
                    JOIN FETCH r.order o
                    JOIN FETCH o.idCourse c
                    JOIN FETCH o.idUser buyer
                    JOIN FETCH r.requester requester
                    LEFT JOIN FETCH r.reviewer reviewer
                    WHERE c.sellerId = :sellerId
                      AND (:status IS NULL OR r.status = :status)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(requester.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(requester.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.reason, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.adminNote, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.gatewayProvider, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.gatewayRefundMessage, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(r) FROM RefundRequest r
                    JOIN r.order o
                    JOIN o.idCourse c
                    JOIN r.requester requester
                    WHERE c.sellerId = :sellerId
                      AND (:status IS NULL OR r.status = :status)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(requester.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(requester.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.reason, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.adminNote, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.gatewayProvider, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(r.gatewayRefundMessage, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """
    )
    Page<RefundRequest> searchSellerRefundRequests(@Param("sellerId") Integer sellerId,
                                                   @Param("status") String status,
                                                   @Param("keyword") String keyword,
                                                   Pageable pageable);

    @Query("""
            SELECT COALESCE(SUM(COALESCE(o.pricePaid, c.price, 0.0)), 0.0)
            FROM RefundRequest r
            JOIN r.order o
            JOIN o.idCourse c
            WHERE c.sellerId = :sellerId
              AND r.status IN :statuses
            """)
    Double sumOrderAmountBySellerIdAndStatuses(@Param("sellerId") Integer sellerId,
                                               @Param("statuses") List<String> statuses);
}
