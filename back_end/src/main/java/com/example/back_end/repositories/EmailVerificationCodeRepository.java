package com.example.back_end.repositories;

import com.example.back_end.entity.EmailVerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationCodeRepository extends JpaRepository<EmailVerificationCode, Long> {
    Optional<EmailVerificationCode> findTopByEmailAndCodeAndConsumedAtIsNullOrderByCreatedAtDesc(String email, String code);
    Optional<EmailVerificationCode> findTopByEmailAndConsumedAtIsNotNullOrderByConsumedAtDesc(String email);
}
