import { memo } from "react";
import { FiCheck, FiSend } from "react-icons/fi";

const qnaStatusLabel = {
  OPEN: "Chưa trả lời",
  ANSWERED: "Đã trả lời",
  RESOLVED: "Đã giải quyết",
};

const qnaStatusClassName = (status) => {
  if (status === "RESOLVED") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (status === "ANSWERED") return "bg-blue-50 text-blue-700 ring-blue-100";
  return "bg-amber-50 text-amber-700 ring-amber-100";
};

function LessonQuestionCard({
  canResolve = false,
  domId,
  formatDateTime = () => "",
  highlighted = false,
  indexLabel,
  metadata = [],
  onReply,
  onReplyChange,
  onResolve,
  question,
  replyAsTextarea = false,
  replyButtonLabel = "Trả lời",
  replyPlaceholder = "Nhập phản hồi...",
  replySaving = false,
  replyValue = "",
  resolveLabel = "Đã giải quyết",
  resolving = false,
}) {
  const replies = Array.isArray(question?.replies) ? question.replies : [];
  const replyDisabled = replySaving || !String(replyValue || "").trim();
  const ReplyInput = replyAsTextarea ? "textarea" : "input";

  return (
    <article
      id={domId}
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        highlighted ? "ring-2 ring-blue-300" : ""
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {indexLabel && (
              <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-100 px-2 text-sm font-bold text-slate-700">
                {indexLabel}
              </span>
            )}
            <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${qnaStatusClassName(question.status)}`}>
              {qnaStatusLabel[question.status] || question.status || qnaStatusLabel.OPEN}
            </span>
            <span className="text-xs text-slate-400">{formatDateTime(question.createdAt)}</span>
          </div>

          <h3 className="mt-3 text-base font-bold text-slate-950 sm:text-lg">{question.title}</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{question.content}</p>

          {metadata.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
              {metadata.map((item, index) => (
                <span key={index}>{item}</span>
              ))}
            </div>
          )}
        </div>

        {canResolve && (
          <button
            type="button"
            onClick={onResolve}
            disabled={resolving}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiCheck />
            {resolving ? "Đang cập nhật..." : resolveLabel}
          </button>
        )}
      </div>

      {replies.length > 0 && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          {replies.map((reply) => (
            <div key={reply.id} className={`rounded-xl px-4 py-3 ${reply.instructorReply ? "bg-blue-50" : "bg-slate-50"}`}>
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                <span className={`font-bold ${reply.instructorReply ? "text-blue-700" : "text-slate-700"}`}>
                  {reply.userName}
                </span>
                {reply.instructorReply && (
                  <span className="rounded-full bg-white px-2 py-0.5 font-bold text-blue-700">Giảng viên</span>
                )}
                <span className="text-slate-400">{formatDateTime(reply.createdAt)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <ReplyInput
          value={replyValue}
          onChange={(event) => onReplyChange?.(event.target.value)}
          placeholder={replyPlaceholder}
          rows={replyAsTextarea ? 2 : undefined}
          className={`min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 ${
            replyAsTextarea ? "resize-none" : ""
          }`}
        />
        <button
          type="button"
          onClick={onReply}
          disabled={replyDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiSend />
          {replySaving ? "Đang gửi..." : replyButtonLabel}
        </button>
      </div>
    </article>
  );
}

export default memo(LessonQuestionCard);
