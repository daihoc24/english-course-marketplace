package com.example.back_end.dto.response;

import lombok.Builder;
import org.springframework.data.domain.Page;

@Builder
public record NotificationSummaryResponse(
        long unreadCount,
        Page<NotificationResponse> notifications
) {}
