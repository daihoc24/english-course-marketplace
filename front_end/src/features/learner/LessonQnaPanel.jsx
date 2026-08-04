import { MessageSquare, Send } from "lucide-react";
import LessonQuestionCard from "../../component/LessonQuestionCard";
import { formatDateTime } from "../../shared/utils/formatters";

const formatQuestionDateTime = (value) => formatDateTime(value, "");

export default function LessonQnaPanel({
  canUseLessonQuestions = false,
  currentUserId,
  focusedQuestionId,
  lessonQuestions = [],
  onCreateQuestion,
  onQuestionFormChange,
  onRefresh,
  onReplyChange,
  onReplyQuestion,
  onResolveQuestion,
  questionForm = { title: "", content: "" },
  questionSaving = false,
  questionsError = "",
  questionsLoading = false,
  replyDrafts = {},
  replySavingId,
  resolvingQuestionId,
  selectedEpisode,
  selectedVideo = {},
}) {
  return (
    <div>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Hỏi đáp bài học</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            Bài {selectedEpisode?.episodeNumber}: {selectedEpisode?.name || selectedVideo.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={questionsLoading || !canUseLessonQuestions}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Làm mới
        </button>
      </div>

      {!canUseLessonQuestions ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          Bạn cần mua khóa học và đăng nhập để dùng hỏi đáp của bài học.
        </div>
      ) : (
        <>
          <form onSubmit={onCreateQuestion} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="hidden rounded-xl bg-white p-2 text-blue-600 shadow-sm sm:block">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <input
                  value={questionForm.title}
                  onChange={(event) => onQuestionFormChange?.({ ...questionForm, title: event.target.value })}
                  placeholder="Tóm tắt câu hỏi của bạn"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
                <textarea
                  value={questionForm.content}
                  onChange={(event) => onQuestionFormChange?.({ ...questionForm, content: event.target.value })}
                  placeholder="Mô tả rõ phần bạn chưa hiểu trong bài học này"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={questionSaving || !questionForm.title.trim() || !questionForm.content.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {questionSaving ? "Đang gửi..." : "Đặt câu hỏi"}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {questionsError && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {questionsError}
            </div>
          )}

          <div className="mt-5 space-y-4">
            {questionsLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                Đang tải hỏi đáp...
              </div>
            ) : lessonQuestions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                Chưa có câu hỏi nào cho bài học này.
              </div>
            ) : lessonQuestions.map((question) => (
              <LessonQuestionCard
                key={question.id}
                domId={`lesson-question-${question.id}`}
                question={question}
                highlighted={Number(question.id) === Number(focusedQuestionId)}
                metadata={[
                  <>
                    Hỏi bởi <strong className="text-slate-700">{question.userName}</strong>
                  </>,
                ]}
                canResolve={Number(question.userId) === Number(currentUserId) && question.status !== "RESOLVED"}
                resolving={resolvingQuestionId === question.id}
                resolveLabel="Đã giải đáp"
                onResolve={() => onResolveQuestion?.(question.id)}
                replyValue={replyDrafts[question.id] || ""}
                onReplyChange={(value) => onReplyChange?.(question.id, value)}
                onReply={() => onReplyQuestion?.(question.id)}
                replySaving={replySavingId === question.id}
                replyPlaceholder="Phản hồi trong cuộc thảo luận này"
                replyButtonLabel="Phản hồi"
                formatDateTime={formatQuestionDateTime}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
