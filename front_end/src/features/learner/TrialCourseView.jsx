import {
  ArrowLeft,
  BookOpen,
  Globe,
  Layers,
  Lock,
  Share2,
  Star,
} from "lucide-react";
import { isDirectVideoUrl, trialCategories } from "./courseLearningView";

export default function TrialCourseView({
  accessMessage = "",
  course,
  courseDetails = [],
  onBack,
  onCheckout,
  onRetryVideo,
  onVideoError,
  onVideoReady,
  onVideoSelect,
  onViewCourse,
  selectedVideo,
  selectedVideoIndex = 0,
  videoLoadFailed = false,
  videoPoster,
}) {
  const previewEpisodes = courseDetails.filter((episode) => episode.isPreview);
  const lockedEpisodes = Math.max(courseDetails.length - previewEpisodes.length, 0);
  const trialEpisode = courseDetails[selectedVideoIndex];
  const trialVideoUrl = trialEpisode?.isPreview ? selectedVideo?.url || "" : "";
  const rating = Number(course?.rating || 0);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại khóa học
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            title="Chia sẻ"
            aria-label="Chia sẻ"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
          <div className="flex min-w-max gap-2">
            {trialCategories.map((category) => (
              <span
                key={category}
                className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-600"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
          {course?.name || "Khóa học"}
        </h1>
        <p className="mt-2 text-lg font-medium text-blue-600 sm:text-xl">Video xem thử miễn phí</p>
        <p className="mt-1 text-sm text-slate-500">
          Một số bài được mở miễn phí. Mua khóa học để học toàn bộ bài giảng và tài liệu.
        </p>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:mt-10 lg:grid-cols-5 lg:gap-10">
          <div className="space-y-4 lg:col-span-3">
            {accessMessage && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {accessMessage}
              </div>
            )}
            <div className="aspect-video overflow-hidden rounded-xl bg-black shadow-xl ring-1 ring-slate-200/80">
              {isDirectVideoUrl(trialVideoUrl) && !videoLoadFailed ? (
                <video
                  className="h-full w-full"
                  src={trialVideoUrl}
                  poster={videoPoster}
                  controls
                  controlsList="nodownload"
                  preload="metadata"
                  onError={onVideoError}
                  onCanPlay={onVideoReady}
                >
                  Trình duyệt không hỗ trợ phát video này.
                </video>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-slate-900 p-8 text-white">
                  <Lock className="mb-3 h-10 w-10 text-slate-400" />
                  <p className="text-center text-sm text-slate-300">
                    {videoLoadFailed && trialVideoUrl
                      ? "Không tải được video xem thử. Kiểm tra mạng hoặc thử mở lại video."
                      : "Chưa có video xem thử cho khóa này."}
                  </p>
                  {videoLoadFailed && trialVideoUrl && (
                    <button
                      type="button"
                      onClick={onRetryVideo}
                      className="mt-4 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      Thử tải lại
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onViewCourse}
                    className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
                  >
                    Xem chi tiết khóa học
                  </button>
                </div>
              )}
            </div>

            {previewEpisodes.length > 1 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Các tập xem thử</p>
                <div className="flex flex-wrap gap-2">
                  {courseDetails.map((episode, index) => {
                    if (!episode.isPreview) return null;
                    const selected = selectedVideoIndex === index;
                    return (
                      <button
                        key={`preview-${episode.episodeNumber}-${index}`}
                        type="button"
                        onClick={() => onVideoSelect?.(episode, index)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          selected
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        Tập {episode.episodeNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:col-span-2">
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              {course?.description ||
                "Khám phá nội dung khóa học qua video xem thử. Đăng ký để mở toàn bộ bài giảng và tài liệu."}
            </p>

            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 text-sm shadow-xl shadow-slate-200/70">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xl font-bold tabular-nums">
                  {course?.rating != null ? rating.toFixed(1) : "-"}
                </span>
                <div className="flex text-amber-400">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < Math.round(rating) ? "fill-amber-400" : "fill-slate-200 text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium text-slate-500">
                  {rating > 0 ? "Đánh giá khóa học" : "Chưa có đánh giá"}
                </span>
              </div>
              <p className="text-slate-700">
                <BookOpen className="mr-2 inline-block h-4 w-4 align-text-bottom text-slate-500" />
                {previewEpisodes.length} bài học được xem thử
              </p>
              <p className="text-slate-700">
                <Lock className="mr-2 inline-block h-4 w-4 align-text-bottom text-slate-500" />
                {lockedEpisodes} bài học cần mua để mở khóa
              </p>
              <div className="flex flex-wrap gap-4 text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-slate-500" />
                  Tiếng Anh
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-slate-500" />
                  {courseDetails.length} bài trong khóa
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onViewCourse}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
              >
                Xem chi tiết
              </button>
              <button
                type="button"
                onClick={onCheckout}
                className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700"
              >
                Đăng ký mua
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
