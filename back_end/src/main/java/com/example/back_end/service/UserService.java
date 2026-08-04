package com.example.back_end.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.back_end.constant.PredefinedRole;
import com.example.back_end.dto.UserDto;
import com.example.back_end.dto.request.IntrospectRequest;
import com.example.back_end.dto.request.UserCreationRequest;
import com.example.back_end.dto.request.UserProfileUpdateRequest;
import com.example.back_end.dto.request.UserUpdateStatusRequest;
import com.example.back_end.dto.response.AuthenticationResponse;
import com.example.back_end.dto.response.IntrospectResponse;
import com.example.back_end.dto.response.UserResponse;
import com.example.back_end.entity.EmailVerificationCode;
import com.example.back_end.entity.Role;
import com.example.back_end.entity.User;
import com.example.back_end.exception.AppException;
import com.example.back_end.exception.ErrorCode;
import com.example.back_end.mapper.UserMapper;
import com.example.back_end.repositories.RoleRepository;
import com.example.back_end.repositories.EmailVerificationCodeRepository;
import com.example.back_end.repositories.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {
    private static final long EMAIL_VERIFICATION_GRACE_MINUTES = 30;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmailVerificationCodeRepository emailVerificationCodeRepository;
    private final ModelMapper modelMapper;
    private final UserMapper userMapper;
    private final Cloudinary cloudinary;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

    @Value("${jwt.signer-key}")
    private String SIGNER_KEY;

    public User createRequest(UserCreationRequest request) {
        String normalizedEmail = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        requireVerifiedRegistrationEmail(normalizedEmail);
        request.setEmail(normalizedEmail);

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }
        // Map fields from request to entity
        User user = modelMapper.map(request, User.class);
        // Encrypt password after mapping
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(normalizedEmail);
        user.setActive(true);

        // Assign default USER role
        var role = roleRepository.findByName(PredefinedRole.USER_ROLE)
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .name(PredefinedRole.USER_ROLE)
                                .description("User role")
                                .build()
                ));
        user.setRoles(new HashSet<>(List.of(role)));

        return userRepository.save(user);
    }

    private void requireVerifiedRegistrationEmail(String email) {
        LocalDateTime verifiedAt = emailVerificationCodeRepository
                .findTopByEmailAndConsumedAtIsNotNullOrderByConsumedAtDesc(email)
                .map(EmailVerificationCode::getConsumedAt)
                .orElseThrow(() -> new IllegalArgumentException("Vui lòng xác thực email trước khi tạo tài khoản"));

        if (verifiedAt.isBefore(LocalDateTime.now().minusMinutes(EMAIL_VERIFICATION_GRACE_MINUTES))) {
            throw new IllegalArgumentException("Phiên xác thực email đã hết hạn, vui lòng xác thực lại");
        }
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public List<User> getUsers() {
        log.info("In method at User");
        return userRepository.findAll();
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(String keyword, String role, String status, Pageable pageable) {
        return userRepository.searchAdminUsers(
                        normalizeKeyword(keyword),
                        normalizeRoleFilter(role),
                        normalizeActiveFilter(status),
                        pageable
                )
                .map(UserService::toResponse);
    }

    public User getUserById(Integer id) {
        return userRepository.findUserById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id))
                ;
    }

    private String generateToken(User user) {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("CDWED.com")
                .issueTime(new Date())
                .expirationTime(Date.from(
                        Instant.now().plus(1, ChronoUnit.HOURS)
                ))
                .claim("scope", buildScope(user))
                .build();
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWSObject jws = new JWSObject(header, new Payload(claims.toJSONObject()));
        try {
            jws.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jws.serialize();
        } catch (JOSEException e) {
            log.error("Token signing error", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    private String buildScope(User user) {
        StringJoiner joiner = new StringJoiner(" ");
        if (!CollectionUtils.isEmpty(user.getRoles())) {
            user.getRoles().forEach(role -> joiner.add(role.getName()));
        }
        return joiner.toString();
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return null;
        }
        return keyword.trim();
    }

    private String normalizeRoleFilter(String role) {
        if (role == null || role.trim().isEmpty() || "ALL".equalsIgnoreCase(role)) {
            return null;
        }
        return role.trim().replaceFirst("^ROLE_", "").toUpperCase(Locale.ROOT);
    }

    private Boolean normalizeActiveFilter(String status) {
        if (status == null || status.trim().isEmpty() || "ALL".equalsIgnoreCase(status)) {
            return null;
        }
        if ("ACTIVE".equalsIgnoreCase(status)) {
            return true;
        }
        if ("LOCKED".equalsIgnoreCase(status) || "INACTIVE".equalsIgnoreCase(status)) {
            return false;
        }
        return null;
    }

    public List<UserDto> getConvertedUsers(List<User> users) {
        return users.stream().map(this::convertToDto).toList();
    }

    public UserDto convertToDto(User user) {
        UserDto userDto = modelMapper.map(user, UserDto.class);
//        Optional<Image> avatar = imageRepository.findByUserId(user.getId());
//        if (avatar != null) {
//            // Map Image → ImageDto
//            ImageDto avatarDto = modelMapper.map(avatar, ImageDto.class);
//
//            userDto.setAvatar(avatarDto);
//        }
        return userDto;
    }

    public UserResponse getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return toResponse(user);
    }

    public UserResponse updateAvatar(int userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        try {
            // Upload ảnh lên Cloudinary
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "user_avatars",
                            "resource_type", "image"
                    )
            );

            // Xóa ảnh cũ nếu có
            if (user.getAvatar() != null) {
                String publicId = user.getAvatar().split("/")[user.getAvatar().split("/").length - 1].split("\\.")[0];
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }

            // Cập nhật URL ảnh mới
            user.setAvatar((String) uploadResult.get("secure_url"));
            User updatedUser = userRepository.save(user);
            return userMapper.toResponse(updatedUser);

        } catch (IOException e) {
            log.error("Failed to upload avatar", e);
            throw new AppException(ErrorCode.CLOUDINARY_ERROR);
        }
    }

    public UserResponse updateCurrentUserProfile(UserProfileUpdateRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getFullname() != null && !request.getFullname().isBlank()) {
            user.setFullname(request.getFullname().trim());
        }
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            String username = request.getUsername().trim();
            userRepository.findByUsername(username)
                    .filter(existing -> !existing.getId().equals(user.getId()))
                    .ifPresent(existing -> {
                        throw new AppException(ErrorCode.USER_EXISTED);
                    });
            user.setUsername(username);
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender().trim());
        }
        if (request.getIntroduce() != null) {
            user.setIntroduce(request.getIntroduce().trim());
        }
        if (request.getCertificate() != null) {
            user.setCertificate(request.getCertificate().trim());
        }

        return toResponse(userRepository.save(user));
    }

    public UserResponse updateUserStatus(int userId, UserUpdateStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        if (request.getRole() != null) {
            // Giả sử mỗi user chỉ có 1 role, bạn có thể sửa thành danh sách nếu cần
            user.getRoles().clear();
            Role role = roleRepository.findByName(request.getRole())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy role: " + request.getRole()));
            user.getRoles().add(role);
        }

        User savedUser = userRepository.save(user);
        return modelMapper.map(savedUser, UserResponse.class);
    }

    public static UserResponse toResponse(User user) {
        if (user == null) return null;

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullname(user.getFullname())
                .phone(user.getPhone())
                .gender(user.getGender())
                .introduce(user.getIntroduce())
                .certificate(user.getCertificate())
                .avatar(user.getAvatar())
                .imageUrl(user.getAvatar())
                .active(user.getActive())
                .roles(user.getRoles())
                .build();
    }

    public User findOrCreateOAuth2User(String email, String name, String picture) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    // Get USER role
                    Role userRole = roleRepository.findByName(PredefinedRole.USER_ROLE)
                            .orElseGet(() -> roleRepository.save(
                                    Role.builder()
                                            .name(PredefinedRole.USER_ROLE)
                                            .description("User role")
                                            .build()
                            ));

                    User newUser = User.builder()
                            .email(email)
                            .fullname(name)
                            .avatar(picture)
                            .password("")
                            .phone("")
                            .username(email)
                            .roles(Set.of(userRole))
                            .active(true)
                            .build();
                    return userRepository.save(newUser);
                });
    }
}
