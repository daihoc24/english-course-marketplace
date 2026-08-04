package com.example.back_end.dto.request;

import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    private String fullname;
    private String username;
    private String phone;
    private String gender;
    private String introduce;
    private String certificate;
}
