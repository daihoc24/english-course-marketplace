package com.example.back_end.repositories;

import com.example.back_end.entity.WithdrawalRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, Long> {
    @Query("""
            SELECT w FROM WithdrawalRequest w
            JOIN FETCH w.seller s
            LEFT JOIN FETCH w.reviewer r
            WHERE s.id = :sellerId
            ORDER BY w.requestedAt DESC
            """)
    List<WithdrawalRequest> findAllBySellerIdOrderByRequestedAtDesc(@Param("sellerId") Integer sellerId);

    @Query("""
            SELECT w FROM WithdrawalRequest w
            JOIN FETCH w.seller s
            LEFT JOIN FETCH w.reviewer r
            ORDER BY w.requestedAt DESC
            """)
    List<WithdrawalRequest> findAllWithUsersOrderByRequestedAtDesc();

    @Query(
            value = """
                    SELECT w FROM WithdrawalRequest w
                    JOIN FETCH w.seller s
                    LEFT JOIN FETCH w.reviewer r
                    WHERE (:status IS NULL
                           OR (:status = 'PAID' AND w.status IN ('PAID', 'APPROVED'))
                           OR (:status <> 'PAID' AND w.status = :status))
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(s.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(s.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.method, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.bankName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.accountName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.accountNumber, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.note, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.adminNote, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.failureReason, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.source, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(w) FROM WithdrawalRequest w
                    JOIN w.seller s
                    WHERE (:status IS NULL
                           OR (:status = 'PAID' AND w.status IN ('PAID', 'APPROVED'))
                           OR (:status <> 'PAID' AND w.status = :status))
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(s.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(s.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.method, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.bankName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.accountName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.accountNumber, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.note, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.adminNote, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.failureReason, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.source, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """
    )
    Page<WithdrawalRequest> searchAdminWithdrawalRequests(@Param("status") String status,
                                                          @Param("keyword") String keyword,
                                                          Pageable pageable);

    @Query(
            value = """
                    SELECT w FROM WithdrawalRequest w
                    JOIN FETCH w.seller s
                    LEFT JOIN FETCH w.reviewer r
                    WHERE s.id = :sellerId
                      AND (:status IS NULL
                           OR (:status = 'PAID' AND w.status IN ('PAID', 'APPROVED'))
                           OR (:status <> 'PAID' AND w.status = :status))
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(w.method, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.bankName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.accountName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.accountNumber, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.note, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.adminNote, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.failureReason, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.source, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(w) FROM WithdrawalRequest w
                    JOIN w.seller s
                    WHERE s.id = :sellerId
                      AND (:status IS NULL
                           OR (:status = 'PAID' AND w.status IN ('PAID', 'APPROVED'))
                           OR (:status <> 'PAID' AND w.status = :status))
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(w.method, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.bankName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.accountName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.accountNumber, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.note, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.adminNote, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.failureReason, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(w.source, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """
    )
    Page<WithdrawalRequest> searchSellerWithdrawalRequests(@Param("sellerId") Integer sellerId,
                                                           @Param("status") String status,
                                                           @Param("keyword") String keyword,
                                                           Pageable pageable);

    @Query("""
            SELECT COALESCE(SUM(w.amountVnd), 0)
            FROM WithdrawalRequest w
            WHERE w.seller.id = :sellerId
              AND w.status IN :statuses
            """)
    Long sumAmountBySellerIdAndStatuses(@Param("sellerId") Integer sellerId,
                                        @Param("statuses") List<String> statuses);

    List<WithdrawalRequest> findAllBySeller_IdAndStatusIn(Integer sellerId, List<String> statuses);

    boolean existsBySeller_IdAndStatusIn(Integer sellerId, List<String> statuses);

    long countBySeller_IdAndStatus(Integer sellerId, String status);
}
