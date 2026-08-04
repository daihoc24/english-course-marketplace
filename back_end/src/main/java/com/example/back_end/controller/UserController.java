package com.example.back_end.controller;

import com.example.back_end.dto.UserDto;
import com.example.back_end.dto.request.UserCreationRequest;
import com.example.back_end.dto.request.UserProfileUpdateRequest;
import com.example.back_end.dto.request.UserUpdateStatusRequest;
import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.dto.response.DirectVideoUploadSignature;
import com.example.back_end.dto.response.UserResponse;
import com.example.back_end.entity.User;
import com.example.back_end.repositories.UserRepository;
import com.example.back_end.service.LessonVideoService;
import com.example.back_end.service.UserService;
import com.nimbusds.jose.proc.SecurityContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.util.List;
@Slf4j

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final LessonVideoService lessonVideoService;

    @PostMapping("/createUser")
    ApiResponse<User> createUser(@RequestBody @Valid UserCreationRequest request){
        ApiResponse<User> response = new ApiResponse<>();
        response.setResult(userService.createRequest(request));
        return response;
    }
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    ApiResponse<Page<UserResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status
    ) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("Username: {}",authentication.getName());
        authentication.getAuthorities().forEach(grantedAuthority -> log.info(grantedAuthority.getAuthority()));
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "id"));
        return ApiResponse.<Page<UserResponse>>builder()
                .code(200)
                .message("Success")
                .result(userService.getUsers(keyword, role, status, pageable))
                .build();
    }
    @GetMapping("/id/{userId}")
    ApiResponse<UserDto>getUserById(@PathVariable int userId){
        UserDto userDto = modelMapper.map( userService.getUserById(userId),UserDto.class);
        return ApiResponse.<UserDto>builder().result(userDto).build();
    }
    @PostMapping("/existUser")
    ApiResponse<Boolean> existUser(@RequestParam ("email") String email) {
        boolean rs = true;
        if (userRepository.findByEmail(email).isEmpty()) {
            rs = false;
        }
        return ApiResponse.<Boolean>builder().result(rs).build();
    }
    @PutMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponse>> updateAvatar(
            @RequestParam("file") MultipartFile file) {
        try {
            // Kiểm tra định dạng file
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.<UserResponse>builder()
                                .code(1)
                                .message("File không phải là hình ảnh")
                                .build());
            }

            // Kiểm tra kích thước file (tối đa 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.<UserResponse>builder()
                                .code(1)
                                .message("Kích thước file quá lớn (tối đa 5MB)")
                                .build());
            }

            UserResponse currentUser = userService.getCurrentUser();
            System.out.println("use"+currentUser.getId());

            UserResponse updatedUser = userService.updateAvatar(currentUser.getId(), file);
            return ResponseEntity.ok(
                    ApiResponse.<UserResponse>builder()
                            .code(0)
                            .message("Cập nhật ảnh đại diện thành công")
                            .result(updatedUser)
                            .build()
            );
        } catch (Exception e) {
            log.error("Failed to update avatar", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<UserResponse>builder()
                            .code(1)
                            .message("Không thể cập nhật ảnh đại diện: " + e.getMessage())
                            .build());
        }
    }
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@RequestBody UserProfileUpdateRequest request) {
        try {
            UserResponse updatedUser = userService.updateCurrentUserProfile(request);
            return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                    .code(200)
                    .message("Cập nhật hồ sơ thành công")
                    .result(updatedUser)
                    .build());
        } catch (Exception e) {
            log.error("Failed to update profile", e);
            return ResponseEntity.badRequest().body(ApiResponse.<UserResponse>builder()
                    .code(400)
                    .message(e.getMessage() != null ? e.getMessage() : "Không thể cập nhật hồ sơ")
                    .build());
        }
    }

    @PostMapping("/me/certificates/upload-signature")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DirectVideoUploadSignature>> createCertificateUploadSignature() {
        try {
            UserResponse currentUser = userService.getCurrentUser();
            return ResponseEntity.ok(ApiResponse.<DirectVideoUploadSignature>builder()
                    .code(200)
                    .result(lessonVideoService.createRawUploadSignature(currentUser.getId(), "certificates"))
                    .build());
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(503).body(ApiResponse.<DirectVideoUploadSignature>builder()
                    .code(503)
                    .message(exception.getMessage())
                    .build());
        }
    }

    @PutMapping("/updateStatus/{userId}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable int userId,
            @RequestBody UserUpdateStatusRequest request
    ) {
        try {
            UserResponse updatedUser = userService.updateUserStatus(userId, request);
            return ResponseEntity.ok(
                    ApiResponse.<UserResponse>builder()
                            .code(0)
                            .message("Cập nhật vai trò và trạng thái thành công")
                            .result(updatedUser)
                            .build()
            );
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật role/active:", e);
            return ResponseEntity.badRequest().body(
                    ApiResponse.<UserResponse>builder()
                            .code(1)
                            .message("Cập nhật thất bại: " + e.getMessage())
                            .build()
            );
        }
    }


}
