package com.example.back_end.dto.response;

import lombok.Builder;

@Builder
public record SellerWalletSummaryResponse(
        Long totalRevenueVnd,
        Long walletTopUpAmountVnd,
        Long grossWalletAmountVnd,
        Long paidOutAmountVnd,
        Long inFlightAmountVnd,
        Long refundHoldAmountVnd,
        Long walletBalanceVnd,
        Long availableBalanceVnd,
        Long attentionCount,
        Long openRefundCount
) {
}
