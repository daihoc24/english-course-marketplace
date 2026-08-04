package com.example.back_end.controller;



import com.example.back_end.dto.request.FavoriteRequest;
import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.entity.Course;
import com.example.back_end.entity.Favorite;
import com.example.back_end.service.favourite.FavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/favorites")
public class FavoriteController {
    private final FavoriteService favoriteService;
    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Course> addFavorite(@RequestBody FavoriteRequest request) {
        return favoriteService.addFavoriteForCurrentUser(request.getProductId());
    }
    @DeleteMapping("/remove")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> deleteFavorite(@RequestBody FavoriteRequest request) {
        return favoriteService.removeFavoriteForCurrentUser(request.getProductId());
    }
    @GetMapping("/idUser/{userId}")
    @PreAuthorize("@userAccessAuthorization.canAccess(#userId, authentication)")
    public ApiResponse<List<Course>> getFavoritesByUserId(@PathVariable int userId) {
        return ApiResponse.<List<Course>>builder().result(favoriteService.getFavoritesByUserId(userId)).build();
    }

}
//=======
//@RestController
//@RequestMapping("/api/favorites")
//@RequiredArgsConstructor
//@Slf4j
//public class FavoriteController {
//    private final FavoriteService favoriteService;
//
//    @GetMapping("/user/{userId}")
//    public ApiResponse<List<FavoriteResponseDTO>> getUserFavorites(@PathVariable Integer userId) {
//        try {
//            List<FavoriteResponseDTO> favorites = favoriteService.getUserFavorites(userId);
//            return ApiResponse.<List<FavoriteResponseDTO>>builder()
//                    .code(200)
//                    .message("Success")
//                    .result(favorites)
//                    .build();
//        } catch (Exception e) {
//            log.error("Error getting user favorites: ", e);
//            return ApiResponse.<List<FavoriteResponseDTO>>builder()
//                    .code(500)
//                    .message("Error getting user favorites")
//                    .build();
//        }
//    }
//
//    @PostMapping("/user/{userId}/course/{courseId}")
//    public ApiResponse<FavoriteResponseDTO> addToFavorites(
//            @PathVariable Integer userId,
//            @PathVariable Integer courseId) {
//        try {
//            FavoriteResponseDTO favorite = favoriteService.addToFavorites(userId, courseId);
//            return ApiResponse.<FavoriteResponseDTO>builder()
//                    .code(200)
//                    .message("Success")
//                    .result(favorite)
//                    .build();
//        } catch (Exception e) {
//            log.error("Error adding to favorites: ", e);
//            return ApiResponse.<FavoriteResponseDTO>builder()
//                    .code(500)
//                    .message("Error adding to favorites")
//                    .build();
//        }
//    }
//
//    @DeleteMapping("/user/{userId}/course/{courseId}")
//    public ApiResponse<Void> removeFromFavorites(
//            @PathVariable Integer userId,
//            @PathVariable Integer courseId) {
//        try {
//            favoriteService.removeFromFavorites(userId, courseId);
//            return ApiResponse.<Void>builder()
//                    .code(200)
//                    .message("Success")
//                    .build();
//        } catch (Exception e) {
//            log.error("Error removing from favorites: ", e);
//            return ApiResponse.<Void>builder()
//                    .code(500)
//                    .message("Error removing from favorites")
//                    .build();
//        }
//    }
//}
//>>>>>>> main
