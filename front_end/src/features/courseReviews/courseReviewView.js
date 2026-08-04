export const courseReviewStatusLabel = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

export const courseReviewStatusTone = {
  pending: "amber",
  approved: "emerald",
  rejected: "rose",
};

export const courseReviewStatusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

export const getCourseReviewSummary = (requests) => ({
  pending: requests.filter((request) => request.status === "pending").length,
  approved: requests.filter((request) => request.status === "approved").length,
  rejected: requests.filter((request) => request.status === "rejected").length,
});

export const courseReviewCategoryLabels = {
  1: "IELTS",
  2: "Tiếng Anh thương mại",
  3: "Tiếng Anh thiếu nhi",
  4: "Giao tiếp",
  5: "Ngữ pháp",
  6: "Tiếng Anh tổng quát",
};

export const courseReviewLevelLabels = {
  Beginner: "Cơ bản",
  Intermediate: "Trung cấp",
  "Upper Intermediate": "Trung cấp cao",
  Advanced: "Nâng cao",
};

export const formatCourseReviewDuration = (minutes) => {
  const totalMinutes = Number(minutes || 0);
  if (totalMinutes <= 0) return "Chưa cập nhật";
  if (totalMinutes < 60) return `${totalMinutes} phút`;

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  return remainingMinutes > 0
    ? `${hours} giờ ${remainingMinutes} phút`
    : `${hours} giờ`;
};

export const toCourseReviewItem = (review) => {
  const lessonVideos = review.lessonVideos ?? [];
  const totalLessonMinutes = lessonVideos.reduce(
    (sum, lesson) => sum + Number(lesson.duration || 0),
    0
  );

  return {
    id: review.id,
    type: "create",
    course: {
      title: review.courseName,
      description: review.description || "Chưa có mô tả",
      price: review.price ?? 0,
      duration: formatCourseReviewDuration(totalLessonMinutes),
      level: courseReviewLevelLabels[review.level] || review.level || "Chưa cập nhật",
      category: courseReviewCategoryLabels[review.categoryId] || "Chưa phân loại",
      lessons: lessonVideos.length,
      thumbnail: review.image || "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=600&q=80",
    },
    seller: {
      id: review.sellerId,
      name: review.sellerName,
      email: "",
      avatar: `https://ui-avatars.com/api/?background=eff6ff&color=1d4ed8&name=${encodeURIComponent(review.sellerName || "Seller")}`,
    },
    status: String(review.status || "pending").toLowerCase(),
    submittedAt: review.submittedAt,
    requestId: `REV-${review.id}`,
    rejectionReason: review.rejectionReason,
    lessonVideos,
  };
};
