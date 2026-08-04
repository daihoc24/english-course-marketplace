import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../component/ProductCard";
import { searchCourses } from "../services/CourseService";
import { normalizePagePayload } from "../utils/pagination";
import HomeCourseHighlightCard from "../features/home/HomeCourseHighlightCard";
import HomeCourseSection from "../features/home/HomeCourseSection";
import HomeCtaPanel from "../features/home/HomeCtaPanel";
import HomeHeroSlider from "../features/home/HomeHeroSlider";
import {
  COURSE_SKELETONS,
  HOME_BANNERS,
  HOMEPAGE_COURSE_SIZE,
  RECOMMENDATION_SKELETONS,
  formatDuration,
  getBeginnerCourses,
} from "../features/home/homeView";

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [products, setProducts] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");
  const navigate = useNavigate();

  const fetchAllCourses = useCallback(async () => {
    setCoursesLoading(true);
    setCoursesError("");

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await searchCourses({
          page: 0,
          size: HOMEPAGE_COURSE_SIZE,
          sortBy: "createdDate",
          sortDirection: "desc",
        });

        if (response.code !== 200) {
          throw new Error(response.message || "Không tải được khóa học");
        }

        const { content } = normalizePagePayload(response);
        setProducts(content.map((course) => ({ ...course, courseDetails: undefined })));
        setCoursesError("");
        setCoursesLoading(false);
        return;
      } catch (error) {
        if (attempt === 3) {
          setProducts([]);
          setCoursesError(error?.message || "Không tải được danh sách khóa học");
          setCoursesLoading(false);
          return;
        }
        await new Promise((resolve) => {
          window.setTimeout(resolve, attempt * 500);
        });
      }
    }
  }, []);

  useEffect(() => {
    void fetchAllCourses();
  }, [fetchAllCourses]);

  const recommendedProducts = useMemo(() => products.slice(0, 8), [products]);
  const beginnerProducts = useMemo(() => {
    return getBeginnerCourses(products).map((course) => ({
      ...course,
      durationLabel: formatDuration(course.totalDuration),
    }));
  }, [products]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!isAnimating) {
        setCurrentSlide((prev) => (prev + 1) % HOME_BANNERS.length);
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isAnimating]);

  const changeBanner = useCallback((direction) => {
    setIsAnimating(true);
    if (direction === "next") {
      setCurrentSlide((prev) => (prev + 1) % HOME_BANNERS.length);
    } else {
      setCurrentSlide((prev) => (prev - 1 + HOME_BANNERS.length) % HOME_BANNERS.length);
    }
    window.setTimeout(() => setIsAnimating(false), 500);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <HomeHeroSlider
        banners={HOME_BANNERS}
        currentSlide={currentSlide}
        isAnimating={isAnimating}
        onPrev={() => changeBanner("prev")}
        onNext={() => changeBanner("next")}
        onSelect={setCurrentSlide}
        onExplore={() => navigate("/shop")}
      />

      <HomeCourseSection
        title="Gợi ý cho bạn"
        actionLabel="Xem tất cả"
        onAction={() => navigate("/shop")}
        loading={coursesLoading}
        error={coursesError}
        items={recommendedProducts}
        skeletonCount={RECOMMENDATION_SKELETONS.length}
        renderItem={(product) => <ProductCard key={product.id} product={product} />}
      />

      <HomeCourseSection
        title="Lộ trình đang được quan tâm"
        description="Dựa trên các khóa học đang công khai trong hệ thống."
        actionLabel="Xem tất cả"
        onAction={() => navigate("/shop")}
        loading={coursesLoading}
        error={coursesError}
        items={beginnerProducts}
        skeletonCount={COURSE_SKELETONS.length}
        emptyText="Chưa có khóa học phù hợp để hiển thị."
        renderItem={(course) => (
          <HomeCourseHighlightCard key={course.id} course={course} onOpen={() => navigate(`/detail/${course.id}`)} />
        )}
      />

      <HomeCtaPanel onExploreCourses={() => navigate("/shop")} onExploreTeachers={() => navigate("/teachers")} />
    </div>
  );
};

export default HomePage;
