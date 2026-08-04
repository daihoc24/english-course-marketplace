export const HOMEPAGE_COURSE_SIZE = 8;

export const COURSE_SKELETONS = Array.from({ length: 4 }, (_, index) => index);
export const RECOMMENDATION_SKELETONS = Array.from({ length: 8 }, (_, index) => index);

export const HOME_BANNERS = [
  {
    title: "Làm chủ tiếng Anh cùng giảng viên chất lượng",
    description: "Học theo lộ trình rõ ràng, luyện nghe nói đọc viết và theo dõi tiến độ ngay trên nền tảng.",
    image: "https://keithspeakingacademy.com/wp-content/uploads/2024/10/Understand-native-English-speaker.jpg",
    bgGradient: "from-purple-900 to-indigo-800",
  },
  {
    title: "Luyện IELTS theo mục tiêu",
    description: "Tập trung vào kỹ năng cần cải thiện, có bài giảng video và nội dung xem thử trước khi mua.",
    image: "https://learnovateonecenter.com/wp-content/uploads/2024/05/IELTS-Training-Learnovate-1024x538.jpg",
    bgGradient: "from-blue-900 to-blue-700",
  },
  {
    title: "Tiếng Anh thương mại thực chiến",
    description: "Cải thiện giao tiếp công việc, phỏng vấn, email và thuyết trình bằng tiếng Anh.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzCZMkcrlHCrHhrS-M9Umn2XwnnIBWAzmkoA&s",
    bgGradient: "from-indigo-900 to-violet-800",
  },
];

export const formatDuration = (totalMinutes) => {
  const minutesValue = Number(totalMinutes || 0);
  if (!minutesValue) return "Chưa cập nhật thời lượng";
  const hours = Math.floor(minutesValue / 60);
  const minutes = minutesValue % 60;
  if (hours && minutes) return `${hours} giờ ${minutes} phút`;
  if (hours) return `${hours} giờ`;
  return `${minutes} phút`;
};

export const getBeginnerCourses = (products = []) => {
  const beginnerCourses = products.filter((product) => {
    const level = String(product.level || "").toLowerCase();
    return level.includes("beginner") || level.includes("cơ bản");
  });

  return (beginnerCourses.length ? beginnerCourses : products).slice(0, 4);
};
