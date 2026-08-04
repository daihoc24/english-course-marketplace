package com.example.back_end.repositories;

import com.example.back_end.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByProviderAndTransactionRef(String provider, String transactionRef);
    Optional<PaymentTransaction> findFirstByOrder_IdAndStatusOrderByCompletedAtDesc(Integer orderId, String status);
    List<PaymentTransaction> findAllByUser_IdAndCourse_IdAndStatusOrderByCompletedAtDesc(Integer userId, Integer courseId, String status);
}
