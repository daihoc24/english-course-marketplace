package com.example.back_end.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "report")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Liên kết đến người dùng tạo báo cáo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // 👉 KHÔNG nên trùng với @Id
    private User user;

    // Liên kết đến khóa học (có thể null nếu báo cáo không liên quan khóa học)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id") // tên cột foreign key trong bảng report
    private Course course;

    private String subject;
    @Column(columnDefinition = "TEXT")
    private String detail;
    private String category;
    private String priority;
    private String status;

    private LocalDateTime date;
    @Column(name = "admin_response", length = 700)
    private String adminResponse;

    @Column(name = "attachment_url", columnDefinition = "TEXT")
    private String attachmentUrl;

    @Column(name = "attachment_public_id")
    private String attachmentPublicId;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    @Column(name = "seller_action_request", columnDefinition = "TEXT")
    private String sellerActionRequest;

    @Column(name = "seller_action_requested_at")
    private LocalDateTime sellerActionRequestedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_action_requested_by")
    private User sellerActionRequestedBy;

    @Column(name = "seller_response", columnDefinition = "TEXT")
    private String sellerResponse;

    @Column(name = "seller_responded_at")
    private LocalDateTime sellerRespondedAt;

    @Column(name = "seller_fixed_at")
    private LocalDateTime sellerFixedAt;

    @Column(name = "refund_recommended_at")
    private LocalDateTime refundRecommendedAt;

    @Column(name = "refund_recommendation_reason", columnDefinition = "TEXT")
    private String refundRecommendationReason;

    public Report(Long id, User user, Course course, String subject, String detail, String category, String priority, String status, LocalDateTime date) {

        this.id = id;
        this.user = user;
        this.course = course;
        this.subject = subject;
        this.detail = detail;
        this.category = category;
        this.priority = priority;
        this.status = status;
        this.date = date;
    }

    public Report() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}
