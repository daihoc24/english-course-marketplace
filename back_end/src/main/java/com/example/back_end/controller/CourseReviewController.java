package com.example.back_end.controller;
import com.example.back_end.dto.request.CourseReviewDecisionRequest;
import com.example.back_end.dto.response.*;
import com.example.back_end.service.CourseReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequiredArgsConstructor public class CourseReviewController { private final CourseReviewService service;
 @PostMapping("/seller/{sellerId}/courses/{courseId}/submit-review") @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)") public ApiResponse<CourseReviewResponse> submit(@PathVariable Integer sellerId,@PathVariable Integer courseId){return ApiResponse.<CourseReviewResponse>builder().code(200).result(service.submit(sellerId,courseId)).build();}
 @GetMapping("/admin/course-reviews") @PreAuthorize("hasAuthority('SCOPE_ADMIN')") public ApiResponse<Page<CourseReviewResponse>> pending(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="10") int size,@RequestParam(required=false) String keyword,@RequestParam(required=false) String status){int safePage=Math.max(page,0);int safeSize=Math.min(Math.max(size,1),50);Pageable pageable=PageRequest.of(safePage,safeSize,Sort.by(Sort.Direction.DESC,"submittedAt"));return ApiResponse.<Page<CourseReviewResponse>>builder().code(200).result(service.pending(status,keyword,pageable)).build();}
 @PatchMapping("/admin/course-reviews/{id}") @PreAuthorize("hasAuthority('SCOPE_ADMIN')") public ApiResponse<CourseReviewResponse> decide(@PathVariable Long id,@Valid @RequestBody CourseReviewDecisionRequest body){return ApiResponse.<CourseReviewResponse>builder().code(200).result(service.decide(id,body)).build();}
 @ExceptionHandler(IllegalArgumentException.class) public ResponseEntity<ApiResponse<Void>> handleInvalidReviewRequest(IllegalArgumentException exception){return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<Void>builder().code(400).message(exception.getMessage()).build());}
}
