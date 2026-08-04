package com.example.back_end.repositories;

import com.example.back_end.entity.Course;
import com.example.back_end.entity.Favorite;
import com.example.back_end.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Integer> {
    List<Favorite> findAllByIdUser_Id(int userId);
    void deleteByIdUser_IdAndIdCourse_Id(int userId, int courseId);
    boolean existsByIdUser_IdAndIdCourse_Id(int userId, int courseId);
    void deleteAllByIdUser_Id(int userId);

}
