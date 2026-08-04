package com.example.back_end.service;

import com.example.back_end.dto.response.NotificationResponse;
import com.example.back_end.dto.response.NotificationSummaryResponse;
import com.example.back_end.entity.Notification;
import com.example.back_end.entity.User;
import com.example.back_end.repositories.NotificationRepository;
import com.example.back_end.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationStreamService notificationStreamService;
    private final AuthService authService;

    @Transactional
    public NotificationResponse notifyUser(Integer recipientId, Integer actorId, String type, String title, String message, String targetUrl) {
        if (recipientId == null) return null;

        User recipient = userRepository.findById(recipientId).orElse(null);
        if (recipient == null) return null;

        User actor = actorId == null ? null : userRepository.findById(actorId).orElse(null);
        Notification notification = notificationRepository.save(Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .title(title)
                .message(message)
                .targetUrl(targetUrl)
                .createdAt(LocalDateTime.now())
                .build());

        NotificationResponse response = toResponse(notification);
        publishAfterCommit(recipientId, response);
        return response;
    }

    @Transactional
    public void notifyUsers(Collection<User> recipients, Integer actorId, String type, String title, String message, String targetUrl) {
        if (recipients == null || recipients.isEmpty()) return;
        recipients.stream()
                .filter(Objects::nonNull)
                .map(User::getId)
                .distinct()
                .forEach(recipientId -> notifyUser(recipientId, actorId, type, title, message, targetUrl));
    }

    @Transactional(readOnly = true)
    public NotificationSummaryResponse mine(Pageable pageable) {
        User user = currentUser();
        Page<NotificationResponse> notifications = notificationRepository
                .findByRecipient_IdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::toResponse);
        return NotificationSummaryResponse.builder()
                .unreadCount(notificationRepository.countByRecipient_IdAndReadAtIsNull(user.getId()))
                .notifications(notifications)
                .build();
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        return notificationRepository.countByRecipient_IdAndReadAtIsNull(currentUser().getId());
    }

    @Transactional
    public NotificationResponse markAsRead(Long id) {
        User user = currentUser();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông báo"));
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền đọc thông báo này");
        }
        if (notification.getReadAt() == null) notification.setReadAt(LocalDateTime.now());
        return toResponse(notification);
    }

    @Transactional
    public int markAllAsRead() {
        return notificationRepository.markAllAsRead(currentUser().getId(), LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public User userFromStreamToken(String token) {
        try {
            String email = authService.verifyToken(token).getJWTClaimsSet().getSubject();
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
        } catch (Exception error) {
            throw new IllegalArgumentException("Token không hợp lệ");
        }
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
    }

    private void publishAfterCommit(Integer recipientId, NotificationResponse response) {
        if (response == null) return;
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            notificationStreamService.publish(recipientId, response);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                notificationStreamService.publish(recipientId, response);
            }
        });
    }

    private NotificationResponse toResponse(Notification notification) {
        User actor = notification.getActor();
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .targetUrl(notification.getTargetUrl())
                .read(notification.getReadAt() != null)
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .actorId(actor == null ? null : actor.getId())
                .actorName(actor == null ? null : actor.getFullname())
                .build();
    }
}
