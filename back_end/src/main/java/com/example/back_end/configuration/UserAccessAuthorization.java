package com.example.back_end.configuration;

import com.example.back_end.constant.PredefinedRole;
import com.example.back_end.entity.User;
import com.example.back_end.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/** Kiểm tra người dùng chỉ truy cập dữ liệu của chính họ; ADMIN được phép quản trị. */
@Component("userAccessAuthorization")
@RequiredArgsConstructor
public class UserAccessAuthorization {
    private final UserRepository userRepository;

    public boolean canAccess(Integer requestedUserId, Authentication authentication) {
        if (requestedUserId == null || authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        User currentUser = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (currentUser == null) {
            return false;
        }
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(role -> PredefinedRole.ADMIN_ROLE.equals(role.getName()));
        return isAdmin || requestedUserId.equals(currentUser.getId());
    }
}
