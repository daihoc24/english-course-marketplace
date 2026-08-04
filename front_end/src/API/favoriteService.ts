import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";

export type FavoriteCourse = { id: number; name?: string; price?: number };
type FavoriteRequest = { userId: number; productId: number };

const authHeaders = (token?: string) => (token ? { Authorization: `Bearer ${token}` } : undefined);

const favoriteService = {
  getUserFavorites: (userId: number, token?: string) =>
    axiosClient.get<ApiResponse<FavoriteCourse[]>>(`/favorites/idUser/${userId}`, { headers: authHeaders(token) }),

  addToFavorites: (userId: number, courseId: number) =>
    axiosClient.post("/favorites/add", { userId, productId: courseId } satisfies FavoriteRequest),

  removeFromFavorites: (userId: number, courseId: number) =>
    axiosClient.delete("/favorites/remove", { data: { userId, productId: courseId } satisfies FavoriteRequest }),

  checkFavorite: async (userId: number, courseId: number, token?: string) => {
    try {
      const response = await favoriteService.getUserFavorites(userId, token);
      return response.data.result.some((course) => course.id === courseId);
    } catch {
      return false;
    }
  },
};

export default favoriteService;
