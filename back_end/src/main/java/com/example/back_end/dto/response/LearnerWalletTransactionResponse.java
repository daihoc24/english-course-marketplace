package com.example.back_end.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record LearnerWalletTransactionResponse(
        Long id,
        Integer userId,
        String userName,
        String type,
        Long amountVnd,
        String status,
        String provider,
        String reference,
        String description,
        LocalDateTime createdAt
) {
}
