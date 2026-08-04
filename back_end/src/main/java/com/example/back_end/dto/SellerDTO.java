package com.example.back_end.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SellerDTO {
    private Integer id;
    private String fullname;
    private String email;
    private String phone;
    private String avatar;
    private String introduce;
    private String certificate;
    private String gender;
}
