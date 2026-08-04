import React from "react";
import { ArrowLeft, BookOpen, CheckCircle, Share2, Star } from "lucide-react";
import CourseVideoPlayer from "./CourseVideoPlayer";
import { courseVideoTabs, formatDuration } from "./courseLearningView";

const CourseLearningSidebar = React.lazy(() => import("./CourseLearningSidebar"));
const LessonResourceList = React.lazy(() => import("../courses/LessonResourceList"));
const LessonQnaPanel = React.lazy(() => import("./LessonQnaPanel"));

export default function PurchasedCourseView({
  accessMessage = "",
  activeTab = "Tổng quan",
  canUseLessonQuestions = false,
  course,
  courseDetails = [],
  courseId,
  currentUserId,
  focusedQuestionId,
  isPurchased = true,
  lessonQuestions = [],
  onActiveTabChange,
  onBack,
  onCreateQuestion,
  onMarkLessonCompleted,
  onQuestionFormChange,
  onRefreshQuestions,
  onReplyChange,
  onReplyQuestion,
  onResolveQuestion,
  onRetryVideo,
  onVideoError,
  onVideoReady,
  onVideoSelect,
  onViewCourse,
  progressSavingLessonId,
  progressSummary,
  questionForm,
  questionSaving = false,
  questionsError = "",
  questionsLoading = false,
  replyDrafts = {},
  replySavingId,
  resolvingQuestionId,
  selectedEpisode,
  selectedEpisodeResources = [],
  selectedVideo,
  selectedVideoIndex = 0,
  totalDuration = 0,
  videoLoadFailed = false,
  videoPoster,
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100 pb-12 lg:flex-row lg:pb-16">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-4 text-slate-100 sm:px-8 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-white/20"
                title="Về trang khóa học"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-900/30">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold leading-tight text-white sm:text-lg">
                  {course?.name || "Khóa học"}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-200 ring-1 ring-emerald-400/30">
                    Đã mua - xem đầy đủ
                  </span>
                  <span className="hidden text-xs text-slate-400 sm:inline">ID {courseId}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-xl bg-white/10 p-2.5 transition-colors hover:bg-white/15"
              title="Chia sẻ"
              aria-label="Chia sẻ"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </header>

        <CourseVideoPlayer
          accessMessage={accessMessage}
          isPurchased={isPurchased}
          onRetryVideo={onRetryVideo}
          onVideoError={onVideoError}
          onVideoReady={onVideoReady}
          onViewCourse={onViewCourse}
          selectedVideo={selectedVideo}
          videoLoadFailed={videoLoadFailed}
          videoPoster={videoPoster}
        />

        <div className="mx-4 mb-2 mt-4 shrink-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_-4px_24px_rgba(15,23,42,0.06)] sm:mx-6 lg:mx-8">
          <div className="flex gap-2 border-b border-slate-100 px-5 pt-3 sm:px-8">
            {courseVideoTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => onActiveTabChange(tab)}
                className={`relative rounded-t-lg px-4 py-3.5 text-sm font-medium transition-colors sm:px-6 ${
                  activeTab === tab ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          <div className="mx-auto w-full max-w-4xl px-6 py-8 sm:px-10 sm:py-10">
            {activeTab === "Tổng quan" && (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
                  <div className="space-y-4 pr-0 sm:col-span-1 sm:pr-4">
                    <h3 className="text-xl font-semibold leading-snug text-slate-900">
                      {course?.name}
                    </h3>
                    <div className="flex items-center gap-3 pt-1 text-slate-600">
                      <span className="text-3xl font-bold tabular-nums text-slate-900">
                        {course?.rating != null ? Number(course.rating).toFixed(1) : "-"}
                      </span>
                      <Star className="h-6 w-6 shrink-0 fill-amber-400 text-amber-400" />
                      <span className="text-sm text-slate-500">Đánh giá</span>
                    </div>
                  </div>
                  <div className="flex min-h-[6.5rem] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 px-5 py-6 text-center">
                    <div className="text-2xl font-bold leading-none tabular-nums text-slate-900 sm:text-3xl">
                      {courseDetails.length}
                    </div>
                    <div className="mt-3 text-xs uppercase tracking-wide text-slate-500">Tập</div>
                  </div>
                  <div className="flex min-h-[6.5rem] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 px-5 py-6 text-center">
                    <div className="text-2xl font-bold leading-none tabular-nums text-slate-900 sm:text-3xl">
                      {formatDuration(totalDuration)}
                    </div>
                    <div className="mt-3 text-xs uppercase tracking-wide text-slate-500">Tổng thời lượng</div>
                  </div>
                </div>

                {selectedEpisode && (
                  <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-5 sm:flex sm:items-center sm:justify-between sm:gap-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Bài đang học</p>
                      <h4 className="mt-1 text-base font-semibold text-slate-900">
                        Tập {selectedEpisode.episodeNumber}
                      </h4>
                      <p className="mt-1 text-sm text-slate-600">
                        {selectedEpisode.completed
                          ? "Bạn đã hoàn thành bài này."
                          : "Đánh dấu khi bạn đã học xong bài này để cập nhật tiến độ."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => onMarkLessonCompleted(selectedEpisode, event)}
                      disabled={progressSavingLessonId === selectedEpisode.id}
                      className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition sm:mt-0 sm:w-auto ${
                        selectedEpisode.completed
                          ? "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <CheckCircle className={`h-4 w-4 ${selectedEpisode.completed ? "fill-emerald-500 text-emerald-500" : ""}`} />
                      {progressSavingLessonId === selectedEpisode.id
                        ? "Đang cập nhật..."
                        : selectedEpisode.completed
                          ? "Bỏ đánh dấu đã học"
                          : "Đánh dấu đã học"}
                    </button>
                  </div>
                )}

                {course?.description && (
                  <p className="mt-10 max-w-3xl border-t border-slate-100 pt-8 text-sm leading-relaxed text-slate-600 sm:text-base">
                    {course.description}
                  </p>
                )}
              </>
            )}

            {activeTab === "Tài liệu" && (
              <div>
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Tài liệu bài học</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">
                    Bài {selectedEpisode?.episodeNumber}: {selectedEpisode?.name || selectedVideo?.title}
                  </h3>
                </div>
                <React.Suspense
                  fallback={(
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                      Đang tải tài liệu bài học...
                    </div>
                  )}
                >
                  <LessonResourceList resources={selectedEpisodeResources} />
                </React.Suspense>
              </div>
            )}

            {activeTab === "Hỏi đáp" && (
              <React.Suspense
                fallback={(
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                    Đang tải hỏi đáp...
                  </div>
                )}
              >
                <LessonQnaPanel
                  canUseLessonQuestions={canUseLessonQuestions}
                  currentUserId={currentUserId}
                  focusedQuestionId={focusedQuestionId}
                  lessonQuestions={lessonQuestions}
                  onCreateQuestion={onCreateQuestion}
                  onQuestionFormChange={onQuestionFormChange}
                  onRefresh={onRefreshQuestions}
                  onReplyChange={onReplyChange}
                  onReplyQuestion={onReplyQuestion}
                  onResolveQuestion={onResolveQuestion}
                  questionForm={questionForm}
                  questionSaving={questionSaving}
                  questionsError={questionsError}
                  questionsLoading={questionsLoading}
                  replyDrafts={replyDrafts}
                  replySavingId={replySavingId}
                  resolvingQuestionId={resolvingQuestionId}
                  selectedEpisode={selectedEpisode}
                  selectedVideo={selectedVideo}
                />
              </React.Suspense>
            )}
          </div>
        </div>
      </div>

      <React.Suspense
        fallback={(
          <aside className="w-full shrink-0 border-t border-slate-200 bg-white p-6 text-sm text-slate-500 lg:sticky lg:top-0 lg:max-h-screen lg:w-[24rem] lg:border-l lg:border-t-0">
            Đang tải mục lục khóa học...
          </aside>
        )}
      >
        <CourseLearningSidebar
          courseDetails={courseDetails}
          isPurchased={isPurchased}
          onVideoSelect={onVideoSelect}
          progressSummary={progressSummary}
          selectedVideoIndex={selectedVideoIndex}
          totalDuration={totalDuration}
        />
      </React.Suspense>
    </div>
  );
}
