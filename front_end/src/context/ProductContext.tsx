import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import favoriteService, { type FavoriteCourse } from "../API/favoriteService";
import { getActiveSession, readStoredSession } from "../utils/session";
import {
  getPurchasedCourseIds,
  searchCourses as searchCoursesAPI,
  type CourseSearchParams,
  type CourseSummary,
} from "../services/CourseService";
import type { LoginSession } from "../types/api";

type ProductContextValue = {
  products: CourseSummary[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  keyword: string;
  categoryId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  sortBy: string;
  sortDirection: "asc" | "desc";
  fetchCourses: (params?: CourseSearchParams) => Promise<void>;
  purchasedCourseIds: Set<number>;
  session: LoginSession | null;
  setSession: Dispatch<SetStateAction<LoginSession | null>>;
  favorites: FavoriteCourse[];
  setFavorites: Dispatch<SetStateAction<FavoriteCourse[]>>;
  toggleFavorite: (productId: number) => Promise<void>;
  isInFavorites: (productId: number) => boolean;
  getFavoriteProducts: () => FavoriteCourse[];
};

export const ProductContext = createContext<ProductContextValue | null>(null);

export const useProduct = (): ProductContextValue => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProduct must be used within a ProductProvider");
  return context;
};

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("createdDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<Set<number>>(new Set());
  const [session, setSession] = useState<LoginSession | null>(() => readStoredSession() as LoginSession | null);
  const [favorites, setFavorites] = useState<FavoriteCourse[]>([]);

  useEffect(() => {
    const loadSession = () => {
      setSession(readStoredSession() as LoginSession | null);
    };

    loadSession();
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "session") loadSession();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("sessionUpdated", loadSession);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("sessionUpdated", loadSession);
    };
  }, []);

  useEffect(() => {
    const fetchPurchasedIds = async () => {
      const activeSession = getActiveSession(session) as LoginSession | null;
      const userId = activeSession?.currentUser?.id;
      if (!userId) {
        setPurchasedCourseIds(new Set());
        return;
      }
      try {
        const response = await getPurchasedCourseIds(userId);
        setPurchasedCourseIds(response.code === 200 && Array.isArray(response.result) ? new Set(response.result) : new Set());
      } catch {
        setPurchasedCourseIds(new Set());
      }
    };
    void fetchPurchasedIds();
  }, [session]);

  const fetchCourses = useCallback(async (params: CourseSearchParams = {}) => {
    setLoading(true);
    setError(null);
    const requestParams: CourseSearchParams = {
      page: params.page ?? currentPage,
      size: params.size ?? pageSize,
      sortBy: params.sortBy ?? sortBy,
      sortDirection: params.sortDirection ?? sortDirection,
    };
    if (params.keyword != null) requestParams.keyword = params.keyword;
    else if (keyword) requestParams.keyword = keyword;
    if (params.categoryId != null) requestParams.categoryId = params.categoryId;
    else if (categoryId != null) requestParams.categoryId = categoryId;
    if (params.minPrice != null) requestParams.minPrice = params.minPrice;
    else if (minPrice != null) requestParams.minPrice = minPrice;
    if (params.maxPrice != null) requestParams.maxPrice = params.maxPrice;
    else if (maxPrice != null) requestParams.maxPrice = maxPrice;
    if (params.minRating != null) requestParams.minRating = params.minRating;
    else if (minRating != null) requestParams.minRating = minRating;

    try {
      const response = await searchCoursesAPI(requestParams);
      if (response.code !== 200 || !response.result) return;
      const result = response.result;
      setProducts(result.content ?? []);
      setCurrentPage(result.page?.number ?? result.number ?? 0);
      setTotalPages(result.page?.totalPages ?? result.totalPages ?? 0);
      setTotalElements(result.page?.totalElements ?? result.totalElements ?? 0);
      setPageSize(result.page?.size ?? result.size ?? 12);
      if (params.keyword !== undefined) setKeyword(params.keyword || "");
      if (params.categoryId !== undefined) setCategoryId(params.categoryId);
      if (params.minPrice !== undefined) setMinPrice(params.minPrice);
      if (params.maxPrice !== undefined) setMaxPrice(params.maxPrice);
      if (params.minRating !== undefined) setMinRating(params.minRating);
      if (params.sortBy !== undefined) setSortBy(params.sortBy || "createdDate");
      if (params.sortDirection !== undefined) setSortDirection(params.sortDirection || "desc");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Không thể tải khóa học. Vui lòng thử lại.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, currentPage, keyword, maxPrice, minPrice, minRating, pageSize, sortBy, sortDirection]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const activeSession = getActiveSession(session) as LoginSession | null;
      const userId = activeSession?.currentUser?.id;
      if (!userId || !activeSession?.token) return;
      try {
        const response = await favoriteService.getUserFavorites(userId, activeSession.token);
        setFavorites(response.data.result ?? []);
      } catch {
        setFavorites([]);
      }
    };
    void fetchFavorites();
  }, [session]);

  const toggleFavorite = async (productId: number) => {
    const activeSession = getActiveSession(session) as LoginSession | null;
    const userId = activeSession?.currentUser?.id;
    if (!userId) return;
    try {
      if (favorites.some((course) => course.id === productId)) {
        await favoriteService.removeFromFavorites(userId, productId);
        setFavorites((previous) => previous.filter((course) => course.id !== productId));
      } else {
        await favoriteService.addToFavorites(userId, productId);
        const response = await favoriteService.getUserFavorites(userId, activeSession?.token);
        setFavorites(response.data.result ?? []);
      }
    } catch {
      // Thất bại không làm thay đổi dữ liệu yêu thích đang hiển thị.
    }
  };

  const value: ProductContextValue = {
    products, loading, error, currentPage, totalPages, totalElements, pageSize,
    keyword, categoryId, minPrice, maxPrice, minRating, sortBy, sortDirection,
    fetchCourses, purchasedCourseIds, session, setSession, favorites, setFavorites,
    toggleFavorite,
    isInFavorites: (productId) => favorites.some((course) => course.id === productId),
    getFavoriteProducts: () => favorites.filter((course) => course != null),
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};
