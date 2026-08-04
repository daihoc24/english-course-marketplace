package com.example.back_end.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReportResponseDTO {
    private Long id;
    private String subject;
    private String detail;
    private String category;
    private String priority;
    private String status;
    private LocalDateTime date;
    private String adminResponse;
    private String attachmentUrl;
    private String attachmentPublicId;
    private LocalDateTime resolvedAt;
    private String resolvedByName;
    private String sellerActionRequest;
    private LocalDateTime sellerActionRequestedAt;
    private String sellerActionRequestedByName;
    private String sellerResponse;
    private LocalDateTime sellerRespondedAt;
    private LocalDateTime sellerFixedAt;
    private LocalDateTime refundRecommendedAt;
    private String refundRecommendationReason;
    private String sellerName;
    private String sellerEmail;

    private String userFullName;
    private String userEmail;

    private Integer courseId;
    private String courseName;
}
