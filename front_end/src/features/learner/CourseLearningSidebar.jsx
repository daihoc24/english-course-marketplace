import { CheckCircle, Clock, Lock } from "lucide-react";
import { formatDuration } from "./courseLearningView";

export default function CourseLearningSidebar({
  courseDetails = [],
  isPurchased = false,
  onVideoSelect,
  progressSummary = { completedLessons: 0, totalLessons: 0, progressPercent: 0 },
  selectedVideoIndex = 0,
  totalDuration = 0,
}) {
  return (
    <aside className="w-full lg:w-[24rem] shrink-0 bg-white lg:border-l border-t lg:border-t-0 border-slate-200 flex flex-col shadow-sm lg:max-h-screen lg:sticky lg:top-0 lg:self-start">
      <div className="px-6 py-6 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Nội dung khóa học</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          {courseDetails.length} tập · {formatDuration(totalDuration)}
        </p>

        {isPurchased && (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Tiến độ học</span>
              <span>{progressSummary.progressPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all"
                style={{ width: `${progressSummary.progressPercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {progressSummary.completedLessons}/{progressSummary.totalLessons} bài đã học
            </p>
          </div>
        )}
      </div>

      <div className="overflow-y-auto flex-1 min-h-0 py-4 px-2">
        {courseDetails.map((episode, index) => {
          const hasAccess = isPurchased || episode.isPreview;
          const isSelected = selectedVideoIndex === index;

          return (
            <div
              key={`${episode.id}-${index}`}
              role="button"
              tabIndex={hasAccess ? 0 : -1}
              onClick={() => hasAccess && onVideoSelect?.(episode, index)}
              onKeyDown={(event) => {
                if (!hasAccess) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onVideoSelect?.(episode, index);
                }
              }}
              className={`mx-2 sm:mx-3 mb-3 rounded-xl border transition-all ${
                isSelected
                  ? "border-blue-200 bg-blue-50/90 shadow-sm ring-1 ring-blue-100"
                  : "border-transparent bg-transparent hover:bg-slate-50"
              } ${hasAccess ? "cursor-pointer" : "cursor-not-allowed opacity-75"}`}
            >
              <div className="flex items-start justify-between gap-4 p-4 sm:p-5">
                <div className="flex items-start gap-4 min-w-0">
                  <div
                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                      !hasAccess
                        ? "bg-slate-200 text-slate-500"
                        : episode.isPreview
                        ? "bg-emerald-500 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {!hasAccess ? <Lock className="w-3.5 h-3.5" /> : episode.episodeNumber}
                  </div>

                  <div className="min-w-0 space-y-2">
                    <div className="font-medium text-sm sm:text-base text-slate-900 leading-snug">
                      Tập {episode.episodeNumber}
                    </div>
                    {episode.isPreview && (
                      <span className="inline-block text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                        Xem thử
                      </span>
                    )}
                    {!hasAccess && (
                      <p className="text-xs text-amber-900/90 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 leading-relaxed max-w-[14rem]">
                        Mở khóa sau khi mua khóa học
                      </p>
                    )}
                    {isPurchased && hasAccess && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          episode.completed
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <CheckCircle className={`h-3.5 w-3.5 ${episode.completed ? "fill-emerald-500 text-emerald-500" : "text-slate-400"}`} />
                        {episode.completed ? "Đã học" : "Chưa học"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 text-xs text-slate-400 tabular-nums pt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{episode.duration} phút</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
