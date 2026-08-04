package com.example.back_end.configuration;

import com.example.back_end.constant.PredefinedRole;
import com.example.back_end.entity.Role;
import com.example.back_end.entity.User;
import com.example.back_end.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserAccessAuthorizationTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private Authentication authentication;

    @Test
    void allowsUserToAccessOwnData() {
        User user = user(12, PredefinedRole.USER_ROLE);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("learner@example.test");
        when(userRepository.findByEmail("learner@example.test")).thenReturn(Optional.of(user));

        assertTrue(new UserAccessAuthorization(userRepository).canAccess(12, authentication));
    }

    @Test
    void rejectsUserAccessingAnotherUsersData() {
        User user = user(12, PredefinedRole.SELLER_ROLE);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("seller@example.test");
        when(userRepository.findByEmail("seller@example.test")).thenReturn(Optional.of(user));

        assertFalse(new UserAccessAuthorization(userRepository).canAccess(99, authentication));
    }

    @Test
    void allowsAdminToAccessManagedData() {
        User admin = user(1, PredefinedRole.ADMIN_ROLE);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("admin@example.test");
        when(userRepository.findByEmail("admin@example.test")).thenReturn(Optional.of(admin));

        assertTrue(new UserAccessAuthorization(userRepository).canAccess(99, authentication));
    }

    private User user(Integer id, String roleName) {
        return User.builder().id(id).email("ignored@example.test")
                .roles(Set.of(Role.builder().name(roleName).build())).build();
    }
}
