package com.example.back_end.service.favourite;

import com.example.back_end.dto.CourseDto;
import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.entity.Course;
import com.example.back_end.entity.Favorite;

import java.util.List;

public interface IFavoriteService {
    ApiResponse<Course> addFavorite(int userId, int productId);
    ApiResponse<Course> addFavoriteForCurrentUser(int productId);
    ApiResponse<Void> removeFavorite(int userId, int productId);
    ApiResponse<Void> removeFavoriteForCurrentUser(int productId);
    List<Course> getFavoritesByUserId(int userId);

    boolean isFavorite(int userId, int productId);

}
