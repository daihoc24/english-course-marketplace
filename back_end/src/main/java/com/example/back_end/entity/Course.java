package com.example.back_end.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "course")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "courseid")
    private Integer id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "price")
    private Double price;

    @Column(name = "sellerid")
    private Integer sellerId;

    @Column(name = "categoryid")
    private Integer categoryId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "status")
    private Boolean status;

    @Column(name = "level")
    private String level;

    @Column(name = "image", columnDefinition = "TEXT")
    private String image;

    @Column(name = "total_hour")
    private Integer totalHour;

    @Column(name = "lessons")
    private Integer lessons;

    @Column(name = "age")
    private String age;
    @JsonManagedReference
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CourseDetail> courseDetails;
}
