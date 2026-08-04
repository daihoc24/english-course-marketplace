package com.example.back_end.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "fullname", nullable = false)
    private String fullname;

    @Column(name = "email",unique = true, nullable = false, length = 45)
    private String email;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "avatar")
    private String avatar;

    @Column(name = "introduce", length = 225)
    private String introduce;

    @Column(name = "gender", length = 45)
    private String gender;

    @Column(name = "certificate", columnDefinition = "TEXT")
    private String certificate;

    @Column(name = "active", nullable = false)
    private Boolean active = false;

    @ManyToMany
    private Set<Role> roles;
}
