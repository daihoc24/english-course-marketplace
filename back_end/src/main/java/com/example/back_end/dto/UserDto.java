package com.example.back_end.dto;

import com.example.back_end.entity.Role;
import jakarta.persistence.Column;
import lombok.Data;

import java.util.Set;

@Data
public class UserDto {
    private Integer id;
    private String username;
    private String fullname;
    private String email;
    private String phone;
    private String avatar;
    private String introduce;
    private String gender;
    private String certificate;
    private Boolean active = false;
    private Set<Role> roles;
}
