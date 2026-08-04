package com.example.back_end.dto.response;

import com.example.back_end.entity.Role;
import lombok.*;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private int id;
    private String username;
    private String email;
    private String fullname;
    private String phone;
    private String gender;
    private String introduce;
    private String certificate;
    private String avatar;
    private Boolean active = false;
    private String imageUrl;
    private Set<Role> roles;
}
