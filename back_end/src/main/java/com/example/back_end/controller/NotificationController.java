package com.example.back_end.controller;

import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.dto.response.NotificationResponse;
import com.example.back_end.dto.response.NotificationSummaryResponse;
import com.example.back_end.entity.User;
import com.example.back_end.service.NotificationService;
import com.example.back_end.service.NotificationStreamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final NotificationStreamService notificationStreamService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<NotificationSummaryResponse> mine(@RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "8") int size) {
        int safeSize = Math.max(1, Math.min(size, 100));
        Pageable pageable = PageRequest.of(Math.max(page, 0), safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponse.<NotificationSummaryResponse>builder()
                .code(200)
                .result(notificationService.mine(pageable))
                .build();
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Long> unreadCount() {
        return ApiResponse.<Long>builder().code(200).result(notificationService.unreadCount()).build();
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<NotificationResponse> markAsRead(@PathVariable Long id) {
        return ApiResponse.<NotificationResponse>builder()
                .code(200)
                .result(notificationService.markAsRead(id))
                .build();
    }

    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Integer> markAllAsRead() {
        return ApiResponse.<Integer>builder().code(200).result(notificationService.markAllAsRead()).build();
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam String token) {
        try {
            User user = notificationService.userFromStreamToken(token);
            return notificationStreamService.subscribe(user.getId());
        } catch (IllegalArgumentException error) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, error.getMessage());
        }
    }
}
