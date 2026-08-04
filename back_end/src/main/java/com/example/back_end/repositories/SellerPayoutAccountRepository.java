package com.example.back_end.repositories;

import com.example.back_end.entity.SellerPayoutAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerPayoutAccountRepository extends JpaRepository<SellerPayoutAccount, Long> {
    Optional<SellerPayoutAccount> findBySeller_Id(Integer sellerId);
}
