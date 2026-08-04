package com.example.back_end.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "course_ratings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseRating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "course_id")
    private Integer courseId;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "rating")
    private Integer rating; // 1-5

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Unique constraint: one rating per user per course
    @Table(uniqueConstraints = @UniqueConstraint(columnNames = {"course_id", "user_id"}))
    public static class CourseRatingTable {}
}
