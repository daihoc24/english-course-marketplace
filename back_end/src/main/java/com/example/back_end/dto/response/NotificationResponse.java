package com.example.back_end.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record NotificationResponse(
        Long id,
        String type,
        String title,
        String message,
        String targetUrl,
        Boolean read,
        LocalDateTime readAt,
        LocalDateTime createdAt,
        Integer actorId,
        String actorName
) {}
