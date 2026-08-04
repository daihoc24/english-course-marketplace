package com.example.back_end.repositories;

import com.example.back_end.entity.LearnerWalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LearnerWalletTransactionRepository extends JpaRepository<LearnerWalletTransaction, Long> {
    @Query("""
            SELECT COALESCE(SUM(
                CASE
                    WHEN t.status = 'COMPLETED' AND t.type = 'REFUND_CREDIT' THEN t.amountVnd
                    WHEN t.status = 'COMPLETED' AND t.type IN ('PURCHASE_APPLIED', 'WITHDRAWAL') THEN -t.amountVnd
                    ELSE 0
                END
            ), 0)
            FROM LearnerWalletTransaction t
            WHERE t.user.id = :userId
            """)
    Long balanceByUserId(@Param("userId") Integer userId);

    List<LearnerWalletTransaction> findAllByUser_IdOrderByCreatedAtDesc(Integer userId);

    Optional<LearnerWalletTransaction> findByReference(String reference);
}
