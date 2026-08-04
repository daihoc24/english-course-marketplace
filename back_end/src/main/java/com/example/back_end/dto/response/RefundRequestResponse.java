package com.example.back_end.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record RefundRequestResponse(Long id, Integer orderId, Integer courseId, String courseName, Long amountVnd,
                                    String requesterName, String reason, String status, String adminNote,
                                    String attachmentUrl, String attachmentPublicId,
                                    String gatewayProvider, String gatewayRefundId, String gatewayRefundStatus,
                                    String gatewayRefundMessage,
                                    LocalDateTime requestedAt, LocalDateTime reviewedAt, LocalDateTime refundProcessedAt) {
}
