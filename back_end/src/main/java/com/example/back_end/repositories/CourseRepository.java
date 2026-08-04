package com.example.back_end.repositories;

import com.example.back_end.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Integer>, JpaSpecificationExecutor<Course> {
    long countByStatusTrue();

    Optional<Course> findById(int courseId);

    Optional<Course> findByName(String name);

    List<Course> findBySellerId(Integer sellerId);

    List<Course> findBySellerIdOrderByIdDesc(Integer sellerId);

    List<Course> findByNameContainingIgnoreCase(String name);

    List<Course> findByDescriptionContainingIgnoreCase(String description);

    List<Course> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);

    List<Course> findByCategoryId(Integer categoryId);

    List<Course> findByPriceBetween(Double minPrice, Double maxPrice);

    List<Course> findByRatingGreaterThanEqual(Double minRating);

    List<Course> findByCategoryIdAndStatusTrue(Integer categoryId);

    List<Course> findByPriceBetweenAndStatusTrue(Double minPrice, Double maxPrice);
}
