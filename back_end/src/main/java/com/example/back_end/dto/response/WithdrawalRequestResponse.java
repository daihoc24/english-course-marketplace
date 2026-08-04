package com.example.back_end.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record WithdrawalRequestResponse(Long id, Integer sellerId, String sellerName, Long amountVnd,
                                        String method, String bankName, String accountName,
                                        String accountNumber, String note, String status,
                                        String source, String failureReason, String adminNote, LocalDateTime requestedAt,
                                        LocalDateTime reviewedAt, Integer reviewerId,
                                        String reviewerName) {
}
