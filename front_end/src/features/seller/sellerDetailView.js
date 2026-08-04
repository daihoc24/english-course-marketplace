import { formatSellerCourseDuration } from "./sellerPublicView";

export const getSellerDetailStats = (sellerCourses = []) => {
  const totalCourses = sellerCourses.length;
  const totalLessons = sellerCourses.reduce((sum, course) => sum + Number(course.episodeCount || course.lessons || 0), 0);
  const totalMinutes = sellerCourses.reduce((sum, course) => sum + Number(course.duration || course.totalDuration || 0), 0);
  const ratedCourses = sellerCourses.filter((course) => Number(course.rating || 0) > 0);
  const averageRating = ratedCourses.length
    ? (ratedCourses.reduce((sum, course) => sum + Number(course.rating || 0), 0) / ratedCourses.length).toFixed(1)
    : null;

  return {
    averageRating,
    totalCourses,
    totalDurationLabel: formatSellerCourseDuration(totalMinutes),
    totalHeroDurationLabel: formatSellerCourseDuration(totalMinutes).replace("Chưa có thời lượng", "—"),
    totalLessons,
    totalMinutes,
  };
};

export const getSellerIntro = (seller) =>
  seller?.introduce?.trim() ||
  "Người bán chưa cập nhật phần giới thiệu. Bạn vẫn có thể xem các khóa học đã được công khai bên dưới.";

export const getSellerHeroIntro = (seller) => {
  const intro = seller?.introduce?.trim();
  if (!intro) return "Giảng viên trên nền tảng English Academy.";
  return intro.length > 170 ? `${intro.slice(0, 170)}...` : intro;
};

export const getVisibleIntro = (intro, expanded) =>
  expanded || intro.length <= 360 ? intro : `${intro.slice(0, 360)}...`;
