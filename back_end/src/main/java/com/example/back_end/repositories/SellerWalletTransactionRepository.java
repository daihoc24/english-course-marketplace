package com.example.back_end.repositories;

import com.example.back_end.entity.SellerWalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SellerWalletTransactionRepository extends JpaRepository<SellerWalletTransaction, Long> {
    @Query("""
            SELECT COALESCE(SUM(t.amountVnd), 0)
            FROM SellerWalletTransaction t
            WHERE t.seller.id = :sellerId
              AND t.status = 'COMPLETED'
              AND t.type = 'TOP_UP'
            """)
    Long sumCompletedTopUpsBySellerId(@Param("sellerId") Integer sellerId);

    List<SellerWalletTransaction> findAllBySeller_IdOrderByCreatedAtDesc(Integer sellerId);

    @Query(
            value = """
                    SELECT t FROM SellerWalletTransaction t
                    JOIN FETCH t.seller s
                    WHERE s.id = :sellerId
                      AND (:status IS NULL OR t.status = :status)
                      AND (:type IS NULL OR t.type = :type)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(t.provider, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(t.reference, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(t.description, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(t) FROM SellerWalletTransaction t
                    JOIN t.seller s
                    WHERE s.id = :sellerId
                      AND (:status IS NULL OR t.status = :status)
                      AND (:type IS NULL OR t.type = :type)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(t.provider, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(t.reference, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(t.description, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """
    )
    Page<SellerWalletTransaction> searchSellerTransactions(@Param("sellerId") Integer sellerId,
                                                           @Param("status") String status,
                                                           @Param("type") String type,
                                                           @Param("keyword") String keyword,
                                                           Pageable pageable);
}
