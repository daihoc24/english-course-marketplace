package com.example.back_end.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record SellerPayoutAccountResponse(Long id, Integer sellerId, String sellerName,
                                          String method, String bankName, String accountName,
                                          String accountNumber, String status, Boolean demoMode,
                                          LocalDateTime createdAt, LocalDateTime updatedAt) {
}
