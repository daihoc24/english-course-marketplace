package com.example.back_end.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record SellerWalletTransactionResponse(
        Long id,
        Integer sellerId,
        String sellerName,
        String type,
        Long amountVnd,
        String status,
        String provider,
        String reference,
        String description,
        LocalDateTime createdAt
) {
}
