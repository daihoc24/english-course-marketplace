package com.example.back_end.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter @Entity @NoArgsConstructor
@Table(name = "course_review_requests")
public class CourseReviewRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "course_id") private Course course;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "seller_id") private User seller;
    @Column(nullable = false) private String status;
    @Column(name = "checklist_note", length = 1000) private String checklistNote;
    @Column(name = "rejection_reason", length = 500) private String rejectionReason;
    @Column(name = "submitted_at", nullable = false) private LocalDateTime submittedAt;
    @Column(name = "reviewed_at") private LocalDateTime reviewedAt;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "reviewer_id") private User reviewer;
}
