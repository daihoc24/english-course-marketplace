import React from "react";
import { FiCheckCircle, FiClock, FiImage, FiVideo } from "react-icons/fi";
import {
  gatewayProviderLabel,
  gatewayProviderTone,
  getRefundReason,
  getVisibleRefundAdminNote,
  isVideoEvidenceUrl,
  refundStatusLabel,
  refundStatusTone,
} from "./refundView";
import StatusBadge from "../../shared/components/badges/StatusBadge";
import { formatDateTime } from "../../shared/utils/formatters";
import { cleanOperationalText } from "../../utils/displayText";

const refundUpdateMessage = (item) => {
  if (item?.gatewayRefundStatus === "CREDITED") {
    return "Tiền hoàn đã được cộng vào tín dụng học tập. Bạn có thể dùng để mua khóa khác hoặc rút tiền.";
  }

  if (item?.status === "REQUIRES_ATTENTION" || item?.gatewayRefundStatus === "INSUFFICIENT_SELLER_BALANCE") {
    return "Admin đang kiểm tra thêm trước khi hoàn tiền. Bạn sẽ nhận thông báo khi có kết quả mới.";
  }

  const message = String(item?.gatewayRefundMessage || "").trim();
  if (!message) return "";

  const replacements = [
    ["Demo refund completed without external gateway", "Đã hoàn tiền."],
    ["VNPay refund completed", "Đã hoàn tiền qua VNPay."],
    ["Số dư chưa chi trả của người bán không đủ để hoàn tiền. Cần xử lý thủ công hoặc giữ doanh thu mới để bù.", "Admin đang kiểm tra thêm trước khi hoàn tiền. Bạn sẽ nhận thông báo khi có kết quả mới."],
  ];

  return cleanOperationalText(
    replacements
      .reduce((current, [from, to]) => current.split(from).join(to), message)
      .replace(/\s+\./g, ".")
      .trim()
  );
};

const MyRefundCard = ({ item, onViewCourse }) => {
  const updateMessage = refundUpdateMessage(item);

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={refundStatusTone[item.status] || "slate"}>
              {refundStatusLabel[item.status] || item.status}
            </StatusBadge>
            {item.gatewayProvider && (
              <StatusBadge tone={gatewayProviderTone[item.gatewayProvider] || "blue"}>
                Thanh toán qua {gatewayProviderLabel[item.gatewayProvider] || item.gatewayProvider}
              </StatusBadge>
            )}
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-950">{getRefundReason(item)}</h2>
          <p className="mt-2 text-sm text-slate-500">
            Khóa học: <span className="font-semibold text-slate-800">{item.courseName || "Không rõ khóa học"}</span>
          </p>

          {getVisibleRefundAdminNote(item) ? (
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
              <div className="font-bold">Phản hồi từ admin</div>
              <p className="mt-2 whitespace-pre-wrap">{getVisibleRefundAdminNote(item)}</p>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Admin đang xử lý yêu cầu này.
            </div>
          )}

          {item.attachmentUrl && (
            <a
              href={item.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
            >
              {isVideoEvidenceUrl(item.attachmentUrl) ? (
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiVideo />
                </span>
              ) : (
                <img
                  src={item.attachmentUrl}
                  alt="Minh chứng hoàn tiền"
                  className="h-16 w-16 rounded-xl object-cover"
                />
              )}
              <span className="inline-flex items-center gap-2">
                {isVideoEvidenceUrl(item.attachmentUrl) ? <FiVideo /> : <FiImage />}
                Xem minh chứng đã gửi
              </span>
            </a>
          )}

          {updateMessage && (
            <div
              className={`mt-4 rounded-2xl border p-4 text-sm leading-6 ${
                item.status === "REQUIRES_ATTENTION"
                  ? "border-blue-100 bg-blue-50 text-blue-800"
                  : "border-emerald-100 bg-emerald-50 text-emerald-800"
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                <FiCheckCircle /> Cập nhật từ hệ thống
              </div>
              <p className="mt-2 whitespace-pre-wrap">{updateMessage}</p>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-60">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <FiClock /> Ngày gửi
            </div>
            <p className="mt-2">{formatDateTime(item.requestedAt)}</p>
          </div>
          {item.reviewedAt && (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="font-semibold text-slate-800">Admin xử lý lúc</div>
              <p className="mt-2">{formatDateTime(item.reviewedAt)}</p>
            </div>
          )}
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div className="font-semibold text-slate-800">Trạng thái</div>
            <StatusBadge className="mt-2" tone={refundStatusTone[item.status] || "slate"}>
              {refundStatusLabel[item.status] || item.status || "Không rõ"}
            </StatusBadge>
          </div>
          <button
            type="button"
            onClick={() => item.courseId && onViewCourse(item.courseId)}
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
          >
            Xem khóa học
          </button>
        </div>
      </div>
    </article>
  );
};

export default React.memo(MyRefundCard);
