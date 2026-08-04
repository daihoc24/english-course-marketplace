import { Lock } from "lucide-react";
import { isDirectVideoUrl } from "./courseLearningView";

export default function CourseVideoPlayer({
  accessMessage = "",
  isPurchased = false,
  onVideoError,
  onVideoReady,
  onRetryVideo,
  onViewCourse,
  selectedVideo,
  videoLoadFailed = false,
  videoPoster,
}) {
  const videoUrl = selectedVideo?.url || "";

  return (
    <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center px-5 py-8 sm:px-8 sm:py-10 min-h-[40vh]">
      {accessMessage && (
        <div className="mb-4 w-full max-w-5xl rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {accessMessage}
        </div>
      )}

      {isDirectVideoUrl(videoUrl) && !videoLoadFailed ? (
        <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
          <video
            className="w-full h-full"
            src={videoUrl}
            poster={videoPoster}
            controls
            controlsList="nodownload"
            preload="metadata"
            onError={onVideoError}
            onCanPlay={onVideoReady}
          >
            Trình duyệt không hỗ trợ phát video này.
          </video>
        </div>
      ) : (
        <div className="w-full max-w-lg text-center px-6 py-12 rounded-2xl bg-slate-900/80 ring-1 ring-white/10">
          <div className="w-14 h-14 rounded-2xl bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Video không khả dụng</h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {videoLoadFailed && videoUrl
              ? "Không tải được video. Kiểm tra mạng hoặc thử mở lại video."
              : !isPurchased
              ? "Tập này chưa mở xem thử. Mua khóa học để xem toàn bộ nội dung."
              : "Liên kết video đang được cập nhật."}
          </p>

          {videoLoadFailed && videoUrl && (
            <button
              type="button"
              onClick={onRetryVideo}
              className="mb-3 inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Thử tải lại
            </button>
          )}

          {!isPurchased && (
            <button
              type="button"
              onClick={onViewCourse}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 text-sm font-semibold transition-colors"
            >
              Xem chi tiết và mua khóa học
            </button>
          )}
        </div>
      )}
    </div>
  );
}
