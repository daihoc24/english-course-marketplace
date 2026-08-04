import React from "react";
import { Play } from "lucide-react";
import { FiHeart } from "react-icons/fi";
import StarRating from "../../../component/StarRating";
import { formatVND } from "../../../utils/formatVND";
import { COURSE_DEFAULT_IMAGES } from "../../../utils/courseImages";

const CourseHeroSection = ({
  course,
  courseId,
  totalEpisodes,
  totalDurationLabel,
  previewEpisodes,
  isPurchased,
  isFavorite,
  hasValidVideoPreview,
  courseThumbnail,
  onWatchCourse,
  onEnrollment,
  onToggleFavorite,
  onPreview,
}) => {
  const favoriteLabel = isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích";

  return (
    <div className="course-detail-hero flex flex-col border-b border-gray-200 pb-8 md:flex-row">
      <div className="md:w-1/2 md:pr-6">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-3xl font-bold text-blue-600">{course.name}</h1>
        </div>

        <p className="mt-3 mb-4 text-gray-700">{course.description}</p>

        <div className="mb-3 flex items-center">
          <StarRating courseId={courseId} currentRating={course.rating} />
        </div>

        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-600">
            Tiếng Anh
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
            {totalEpisodes} tập
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
            {totalDurationLabel} tổng thời lượng
          </span>
          {previewEpisodes > 0 && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-green-600">
              {previewEpisodes} xem trước miễn phí
            </span>
          )}
          {course.studentCount != null && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              {Number(course.studentCount).toLocaleString("vi-VN")} người đã mua
            </span>
          )}
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          {isPurchased ? (
            <button
              type="button"
              onClick={onWatchCourse}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
            >
              <Play className="h-5 w-5" />
              Tiếp tục học
            </button>
          ) : (
            <>
              <div className="flex items-center">
                <span className="text-3xl font-bold text-blue-600">
                  {formatVND(course.price || 0)}
                </span>
              </div>
              <button
                type="button"
                onClick={onEnrollment}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Mua ngay
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onToggleFavorite}
            className={`course-favorite-button flex items-center gap-2 rounded-lg border px-6 py-3 font-semibold transition-colors ${
              isFavorite
                ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
                : "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FiHeart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
            {favoriteLabel}
          </button>
        </div>
      </div>

      <div className="md:w-1/2">
        <div className="course-preview-frame overflow-hidden rounded-lg bg-gray-100">
          {hasValidVideoPreview ? (
            <div className="group relative aspect-video">
              <div
                className="absolute inset-0 cursor-pointer transition-opacity group-hover:opacity-90"
                onClick={onPreview}
              >
                <img
                  src={courseThumbnail}
                  alt={`Ảnh xem trước khóa học ${course.name}`}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src =
                      COURSE_DEFAULT_IMAGES[(Number(courseId || 0) + 1) % COURSE_DEFAULT_IMAGES.length];
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 transition-all group-hover:bg-opacity-40">
                  <div className="course-preview-play rounded-full bg-blue-600 p-3 shadow-lg transition-transform group-hover:scale-110">
                    <Play className="h-8 w-8 fill-current text-white" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex aspect-video cursor-pointer items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 transition-opacity hover:opacity-90"
              onClick={onPreview}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  onPreview(event);
                }
              }}
            >
              <div className="text-center text-white">
                <Play className="mx-auto mb-2 h-16 w-16 opacity-80" />
                <p className="text-lg font-semibold">Xem thử khóa học</p>
                <p className="mt-1 text-sm opacity-75">Chưa có video xem trước</p>
              </div>
            </div>
          )}
        </div>

        <div className="course-preview-action mt-4 text-center">
          <button
            type="button"
            onClick={onPreview}
            disabled={!hasValidVideoPreview}
            className={`mx-auto flex items-center gap-2 rounded-lg px-6 py-2 font-medium transition-colors ${
              hasValidVideoPreview
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
          >
            <Play className="h-4 w-4" />
            {hasValidVideoPreview ? "Xem thử bài học" : "Chưa có video xem thử"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CourseHeroSection);
