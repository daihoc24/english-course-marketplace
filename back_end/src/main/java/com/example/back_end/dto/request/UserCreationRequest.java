package com.example.back_end.dto.request;

import com.example.back_end.entity.Role;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.NonFinal;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

@Data
public class UserCreationRequest {
    private String username;
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
    private String fullname;
    private String email;
    private String phone;
    private Boolean active = false;
}
