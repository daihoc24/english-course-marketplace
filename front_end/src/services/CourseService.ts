import axiosClient from "../API/axiosClient";
import type { ApiResponse } from "../types/api";

export type CourseSummary = {
  id: number;
  name: string;
  price: number;
  description?: string;
  rating?: number;
  categoryId?: number;
  sellerId?: number;
  status?: boolean;
};

export type CourseSearchParams = {
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
};

export type CoursePageMetadata = {
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
};

export type CoursePage = CoursePageMetadata & {
  content: CourseSummary[];
  page?: CoursePageMetadata;
};

const buildQueryParams = (params: CourseSearchParams) => {
  const query: Record<string, string | number> = {};
  if (params.keyword) query.keyword = params.keyword.slice(0, 100);
  (["categoryId", "minPrice", "maxPrice", "minRating", "page", "size"] as const).forEach((key) => {
    if (params[key] != null) query[key] = params[key];
  });
  if (params.sortBy) query.sortBy = params.sortBy;
  if (params.sortDirection) query.sortDirection = params.sortDirection;
  return query;
};

export const searchCourses = async (params: CourseSearchParams = {}) =>
  (await axiosClient.get<ApiResponse<CoursePage>>("/courses/search/advanced", { params: buildQueryParams(params) })).data;

export const getPurchasedCourseIds = async (userId: number) =>
  (await axiosClient.get<ApiResponse<number[]>>(`/courses/user/${userId}/purchased-course-ids`)).data;

export const getCategories = async () =>
  (await axiosClient.get<ApiResponse<Array<{ id: number; name: string; description?: string }>>>("/courses/categories")).data;

export default { searchCourses, getPurchasedCourseIds, getCategories };
