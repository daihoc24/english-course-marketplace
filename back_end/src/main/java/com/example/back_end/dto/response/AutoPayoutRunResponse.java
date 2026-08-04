package com.example.back_end.dto.response;

import java.util.List;

public record AutoPayoutRunResponse(int scannedSellers, int paidCount, int exceptionCount,
                                    int skippedCount, Long totalPaidVnd,
                                    List<WithdrawalRequestResponse> paidPayouts,
                                    List<WithdrawalRequestResponse> exceptions) {
}
