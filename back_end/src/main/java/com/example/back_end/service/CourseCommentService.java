package com.example.back_end.service;

import com.example.back_end.dto.request.CourseCommentRequest;
import com.example.back_end.dto.response.CourseCommentResponseDTO;
import com.example.back_end.entity.CourseComment;
import com.example.back_end.entity.User;
import com.example.back_end.repositories.CourseCommentRepository;
import com.example.back_end.repositories.CourseRepository;
import com.example.back_end.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseCommentService {

    private static final int CONTENT_MAX = 2000;

    private final CourseCommentRepository courseCommentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public List<CourseCommentResponseDTO> listByCourseId(Integer courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found");
        }
        List<CourseComment> rows = courseCommentRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
        return rows.stream().map(this::toDto).toList();
    }

    @Transactional
    public CourseCommentResponseDTO addComment(Integer courseId, CourseCommentRequest request) {
        String raw = request.getContent() == null ? "" : request.getContent().trim();
        if (raw.isEmpty()) {
            throw new RuntimeException("Nội dung bình luận không được để trống");
        }
        if (raw.length() > CONTENT_MAX) {
            throw new RuntimeException("Bình luận tối đa " + CONTENT_MAX + " ký tự");
        }

        courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new RuntimeException("Tài khoản chưa được kích hoạt");
        }

        CourseComment saved = courseCommentRepository.save(CourseComment.builder()
                .courseId(courseId)
                .userId(user.getId())
                .content(raw)
                .build());

        return toDto(saved, user);
    }

    private CourseCommentResponseDTO toDto(CourseComment c) {
        User u = userRepository.findById(c.getUserId()).orElse(null);
        return toDto(c, u);
    }

    private CourseCommentResponseDTO toDto(CourseComment c, User u) {
        return CourseCommentResponseDTO.builder()
                .id(c.getId())
                .courseId(c.getCourseId())
                .userId(c.getUserId())
                .userFullname(u != null ? u.getFullname() : "Người dùng")
                .userAvatar(u != null ? u.getAvatar() : null)
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
