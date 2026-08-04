import { FiExternalLink, FiImage, FiVideo } from "react-icons/fi";
import InfoBadge from "../../shared/components/badges/InfoBadge";
import StatusBadge from "../../shared/components/badges/StatusBadge";
import TruncatedHoverText from "../../shared/components/text/TruncatedHoverText";
import { formatDateTime } from "../../shared/utils/formatters";
import {
  gatewayStatusLabel,
  getHumanRefundMessage,
  getRefundReason,
  getVisibleRefundAdminNote,
  isVideoEvidenceUrl,
  refundCompactStatusLabel,
  refundStatusLabel,
  refundStatusTone,
} from "../refunds/refundView";

export default function SellerRefundRow({ refund, rowNumber, onPreviewEvidence }) {
  const refundReason = getRefundReason(refund);
  const adminNote = getVisibleRefundAdminNote(refund);
  const systemMessage = getHumanRefundMessage(refund);
  const gatewayRefundLabel = refund.gatewayRefundStatus
    ? gatewayStatusLabel[refund.gatewayRefundStatus] || refund.gatewayRefundStatus
    : "";
  const isWarningResult = refund.gatewayRefundStatus === "INSUFFICIENT_SELLER_BALANCE";

  return (
    <tr className="align-top transition hover:bg-slate-50/70">
      <td className="p-4 font-semibold text-slate-700">{rowNumber}</td>
      <td className="p-4 text-slate-700">#{refund.orderId || refund.id}</td>
      <td className="p-4 text-slate-700">{refund.requesterName || "—"}</td>
      <td className="p-4">
        <p className="font-semibold leading-6 text-slate-900">{refund.courseName || "—"}</p>
        <p className="mt-1 text-xs text-slate-500">Mã khóa: {refund.courseId || "—"}</p>
      </td>
      <td className="p-4 text-slate-700">{formatDateTime(refund.requestedAt)}</td>
      <td className="p-4">
        <StatusBadge
          title={refundStatusLabel[refund.status] || refund.status || ""}
          tone={refundStatusTone[refund.status] || "slate"}
        >
          {refundCompactStatusLabel[refund.status] || refundStatusLabel[refund.status] || refund.status || "—"}
        </StatusBadge>
      </td>
      <td className="p-4">
        <TruncatedHoverText text={refundReason} lines={2} className="leading-6 text-slate-800" />
      </td>
      <td className="p-4">
        {adminNote ? (
          <TruncatedHoverText text={adminNote} lines={2} className="leading-6 text-slate-700" />
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="p-4">
        {gatewayRefundLabel || refund.refundProcessedAt || systemMessage ? (
          <div className="space-y-1.5 text-xs leading-5">
            {gatewayRefundLabel && (
              <p className={`font-semibold ${isWarningResult ? "text-orange-700" : "text-slate-700"}`}>
                {gatewayRefundLabel}
              </p>
            )}
            {refund.refundProcessedAt && (
              <p className="text-slate-400">{formatDateTime(refund.refundProcessedAt)}</p>
            )}
            {systemMessage && (
              <TruncatedHoverText
                text={systemMessage}
                lines={2}
                className={isWarningResult ? "text-orange-700" : "text-slate-600"}
              />
            )}
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="p-4">
        {refund.attachmentUrl ? (
          <button
            type="button"
            onClick={() => onPreviewEvidence(refund)}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100"
          >
            {isVideoEvidenceUrl(refund.attachmentUrl) ? <FiVideo /> : <FiImage />}
            Xem
            <FiExternalLink />
          </button>
        ) : (
          <InfoBadge size="sm" title="Không có minh chứng">
            Không có
          </InfoBadge>
        )}
      </td>
    </tr>
  );
}
