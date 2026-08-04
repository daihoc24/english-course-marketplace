package com.example.back_end.dto.request;

import lombok.Data;

@Data
public class UserUpdateStatusRequest {
    private String role;  // Ví dụ: "ADMIN", "USER", "SELLER"
    private Boolean active; // true / false
}
