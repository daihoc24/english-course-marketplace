import { Check, CreditCard, ExternalLink, Image as ImageIcon, Video, X } from "lucide-react";
import InfoBadge from "../../shared/components/badges/InfoBadge";
import StatusBadge from "../../shared/components/badges/StatusBadge";
import ActionButton from "../../shared/components/buttons/ActionButton";
import TruncatedHoverText from "../../shared/components/text/TruncatedHoverText";
import { formatDateTime } from "../../shared/utils/formatters";
import {
  gatewayProviderLabel,
  gatewayProviderTone,
  gatewayStatusLabel,
  getHumanRefundMessage,
  getRefundReason,
  getVisibleRefundAdminNote,
  isVideoEvidenceUrl,
  refundCompactStatusLabel,
  refundStatusLabel,
  refundStatusTone,
} from "./refundView";

const actionableRefundStatuses = ["PENDING", "REQUIRES_ATTENTION"];

export default function AdminRefundRow({
  refund,
  rowNumber,
  onDecision,
  onPreviewEvidence,
}) {
  const refundReason = getRefundReason(refund);
  const adminNote = getVisibleRefundAdminNote(refund);
  const systemMessage = getHumanRefundMessage(refund);
  const gatewayRefundLabel = refund.gatewayRefundStatus
    ? gatewayStatusLabel[refund.gatewayRefundStatus] || refund.gatewayRefundStatus
    : "";
  const isWarningResult = refund.gatewayRefundStatus === "INSUFFICIENT_SELLER_BALANCE";

  return (
    <tr className="align-top transition hover:bg-slate-50/60">
      <td className="p-4 font-semibold text-slate-700">{rowNumber}</td>
      <td className="p-4 text-slate-600">{formatDateTime(refund.requestedAt)}</td>
      <td className="p-4">
        <p className="font-semibold text-slate-900">{refund.requesterName || "—"}</p>
        <p className="mt-1 text-slate-500">Đơn #{refund.orderId || "—"}</p>
      </td>
      <td className="p-4">
        <p className="font-semibold text-slate-900">{refund.courseName || "—"}</p>
      </td>
      <td className="p-4">
        <TruncatedHoverText text={refundReason} lines={2} className="leading-6 text-slate-800" />
      </td>
      <td className="p-4">
        {refund.attachmentUrl ? (
          <button
            type="button"
            onClick={() => onPreviewEvidence(refund)}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100"
          >
            {isVideoEvidenceUrl(refund.attachmentUrl) ? <Video size={15} /> : <ImageIcon size={15} />}
            Xem
            <ExternalLink size={13} />
          </button>
        ) : (
          <InfoBadge title="Chưa có minh chứng">Chưa có</InfoBadge>
        )}
      </td>
      <td className="p-4 text-slate-600">
        {refund.gatewayProvider ? (
          <InfoBadge
            icon={<CreditCard size={13} />}
            shape="pill"
            size="sm"
            tone={gatewayProviderTone[refund.gatewayProvider] || "slate"}
          >
            {gatewayProviderLabel[refund.gatewayProvider] || refund.gatewayProvider}
          </InfoBadge>
        ) : (
          "—"
        )}
        {refund.gatewayRefundId && (
          <div className="mt-2 break-all text-xs text-slate-400">{refund.gatewayRefundId}</div>
        )}
      </td>
      <td className="p-4">
        <StatusBadge
          title={refundStatusLabel[refund.status] || refund.status || ""}
          tone={refundStatusTone[refund.status] || "slate"}
        >
          {refundCompactStatusLabel[refund.status] || refundStatusLabel[refund.status] || refund.status || "—"}
        </StatusBadge>
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
        {actionableRefundStatuses.includes(refund.status) ? (
          <div className="flex flex-col gap-2">
            <ActionButton
              type="button"
              onClick={() => onDecision(refund, "APPROVED")}
              tone="emerald"
              className="w-full"
            >
              <Check size={15} /> Cộng tín dụng
            </ActionButton>
            <ActionButton
              type="button"
              onClick={() => onDecision(refund, "REJECTED")}
              tone="rose"
              className="w-full"
            >
              <X size={15} /> Từ chối
            </ActionButton>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Đã xử lý</span>
        )}
      </td>
    </tr>
  );
}
