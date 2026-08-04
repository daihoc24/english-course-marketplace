import { CheckCircle, Image as ImageIcon, Send, Video, X } from "lucide-react";
import ActionButton from "../../shared/components/buttons/ActionButton";
import {
  complaintStatusLabel,
  isVideoEvidenceUrl,
} from "./complaintView";

const InfoCard = ({ label, subValue, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-2 font-semibold text-slate-950">{value}</p>
    {subValue && <p className="mt-1 text-sm text-slate-500">{subValue}</p>}
  </div>
);

const Timeline = ({ complaint, formatDate }) => {
  const items = [
    { label: "Học viên gửi khiếu nại", date: complaint.date, active: true },
    {
      label: "Admin yêu cầu người bán xử lý",
      date: complaint.sellerActionRequestedAt,
      active: Boolean(complaint.sellerActionRequestedAt),
    },
    {
      label: "Người bán phản hồi",
      date: complaint.sellerRespondedAt,
      active: Boolean(complaint.sellerRespondedAt),
    },
    {
      label: complaint.status === "REFUND_RECOMMENDED" ? "Đề xuất hoàn tiền" : "Admin kết luận",
      date: complaint.refundRecommendedAt || complaint.resolvedAt,
      active: ["RESOLVED", "REFUND_RECOMMENDED"].includes(complaint.status),
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tiến trình xử lý</p>
      <div className="mt-4 space-y-4">
        {items.map((item, index) => (
          <div key={item.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`h-3 w-3 rounded-full ${item.active ? "bg-blue-500" : "bg-slate-200"}`} />
              {index < items.length - 1 && <span className="mt-1 h-8 w-px bg-slate-200" />}
            </div>
            <div>
              <p className={`text-sm font-semibold ${item.active ? "text-slate-800" : "text-slate-400"}`}>
                {item.label}
              </p>
              <p className="mt-1 text-xs text-slate-500">{item.date ? formatDate(item.date) : "Chưa có"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MessageBox = ({ title, text, time, tone }) => {
  const toneClass = {
    orange: "border-orange-100 bg-orange-50 text-orange-800",
    blue: "border-blue-100 bg-blue-50 text-blue-800",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-800",
  }[tone];

  return (
    <div className={`mt-5 rounded-2xl border p-5 ${toneClass}`}>
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{text}</p>
      {time && <p className="mt-3 text-xs opacity-75">{time}</p>}
    </div>
  );
};

export default function ComplaintDetailPanel({
  complaint,
  error,
  formatDate,
  onApplyAction,
  onClose,
  onResponseChange,
  response,
  savingAction,
  successMessage,
}) {
  if (!complaint) return null;

  const isClosed = ["RESOLVED", "REFUND_RECOMMENDED"].includes(complaint.status);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Chi tiết khiếu nại</p>
            <h3 className="mt-1 text-xl font-bold text-slate-950">{complaint.subject}</h3>
            <p className="mt-1 text-sm text-slate-500">{complaint.courseTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
          >
            <X size={22} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 pb-8">
          {successMessage && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle size={16} /> {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard label="Học viên" value={complaint.userName} subValue={complaint.userEmail} />
            <InfoCard label="Người bán" value={complaint.sellerName} subValue={complaint.sellerEmail || "Chưa có email"} />
            <InfoCard label="Ngày gửi" value={formatDate(complaint.date)} />
            <InfoCard label="Trạng thái" value={complaintStatusLabel[complaint.status] || complaint.status} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nội dung học viên gửi</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">{complaint.detail}</p>
              {complaint.attachmentUrl && (
                <a
                  href={complaint.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-blue-300"
                >
                  {isVideoEvidenceUrl(complaint.attachmentUrl) ? (
                    <video src={complaint.attachmentUrl} controls preload="metadata" className="max-h-80 w-full bg-slate-900" />
                  ) : (
                    <img src={complaint.attachmentUrl} alt="Minh chứng khiếu nại" className="max-h-80 w-full bg-slate-50 object-contain" />
                  )}
                  <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-blue-700">
                    {isVideoEvidenceUrl(complaint.attachmentUrl) ? <Video size={16} /> : <ImageIcon size={16} />}
                    Xem minh chứng
                  </div>
                </a>
              )}
            </div>
            <Timeline complaint={complaint} formatDate={formatDate} />
          </div>

          {complaint.sellerActionRequest && (
            <MessageBox
              tone="orange"
              title="Admin đã yêu cầu người bán xử lý"
              text={complaint.sellerActionRequest}
              time={formatDate(complaint.sellerActionRequestedAt)}
            />
          )}

          {complaint.sellerResponse && (
            <MessageBox
              tone="blue"
              title="Người bán đã phản hồi"
              text={complaint.sellerResponse}
              time={formatDate(complaint.sellerRespondedAt)}
            />
          )}

          {isClosed ? (
            <MessageBox
              tone="emerald"
              title={complaint.status === "REFUND_RECOMMENDED" ? "Đã đề xuất hoàn tiền" : "Kết luận của admin"}
              text={complaint.refundRecommendationReason || complaint.adminResponse || "Đã xử lý."}
              time={formatDate(complaint.refundRecommendedAt || complaint.resolvedAt)}
            />
          ) : (
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-slate-800">Nội dung xử lý</label>
              <textarea
                value={response}
                onChange={(event) => onResponseChange(event.target.value)}
                placeholder="Nhập phản hồi cho học viên, yêu cầu người bán xử lý, hoặc lý do đề xuất hoàn tiền..."
                rows={5}
                className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />
              <div className="sticky bottom-0 -mx-6 mt-5 flex flex-wrap justify-end gap-3 border-t border-slate-100 bg-white/95 px-6 py-4 pb-5 backdrop-blur">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Đóng
                </button>
                <ActionButton
                  busy={savingAction === "seller"}
                  disabled={Boolean(savingAction) || !response.trim()}
                  tone="orange"
                  onClick={() => onApplyAction("seller", "Đã yêu cầu người bán xử lý.")}
                >
                  Yêu cầu người bán xử lý
                </ActionButton>
                <ActionButton
                  busy={savingAction === "refund"}
                  disabled={Boolean(savingAction) || !response.trim()}
                  tone="rose"
                  onClick={() => onApplyAction("refund", "Đã đề xuất hoàn tiền cho học viên.")}
                >
                  Đề xuất hoàn tiền
                </ActionButton>
                <ActionButton
                  busy={savingAction === "resolve"}
                  disabled={Boolean(savingAction) || !response.trim()}
                  tone="blue"
                  onClick={() => onApplyAction("resolve", "Đã gửi phản hồi và đóng khiếu nại.")}
                >
                  <Send size={15} /> Đóng khiếu nại
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
