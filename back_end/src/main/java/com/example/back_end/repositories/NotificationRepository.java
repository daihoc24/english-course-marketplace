package com.example.back_end.repositories;

import com.example.back_end.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    boolean existsByRecipient_IdAndTypeAndTargetUrl(Integer recipientId, String type, String targetUrl);

    Page<Notification> findByRecipient_IdOrderByCreatedAtDesc(Integer recipientId, Pageable pageable);

    long countByRecipient_IdAndReadAtIsNull(Integer recipientId);

    @Modifying
    @Query("update Notification n set n.readAt = :readAt where n.recipient.id = :recipientId and n.readAt is null")
    int markAllAsRead(@Param("recipientId") Integer recipientId, @Param("readAt") LocalDateTime readAt);
}
