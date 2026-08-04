package com.example.back_end.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record LearnerWalletSummaryResponse(
        Long balanceVnd,
        List<LearnerWalletTransactionResponse> transactions
) {
}
