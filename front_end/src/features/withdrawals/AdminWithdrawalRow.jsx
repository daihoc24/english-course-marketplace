import { AlertTriangle, Check, Clock, X } from "lucide-react";
import InfoBadge from "../../shared/components/badges/InfoBadge";
import StatusBadge from "../../shared/components/badges/StatusBadge";
import ActionButton from "../../shared/components/buttons/ActionButton";
import TruncatedHoverText from "../../shared/components/text/TruncatedHoverText";
import { formatDateTime, formatVnd } from "../../shared/utils/formatters";
import {
  formatWithdrawalText,
  getWithdrawalSourceTone,
  withdrawalMethodLabel,
  withdrawalSourceLabel,
  withdrawalStatusLabel,
  withdrawalStatusTone,
} from "./withdrawalView";

const reviewableStatuses = ["PENDING", "REQUIRES_ATTENTION"];

export default function AdminWithdrawalRow({ withdrawal, rowNumber, onDecision }) {
  const adminNote = formatWithdrawalText(withdrawal.adminNote);
  const failureReason = formatWithdrawalText(withdrawal.failureReason);
  const sellerNote = formatWithdrawalText(withdrawal.note);
  const bankName = formatWithdrawalText(withdrawal.bankName);
  const accountName = formatWithdrawalText(withdrawal.accountName);

  return (
    <tr className="align-top transition hover:bg-slate-50/60">
      <td className="p-4 font-semibold text-slate-700">{rowNumber}</td>
      <td className="p-4 text-slate-600">{formatDateTime(withdrawal.requestedAt)}</td>
      <td className="p-4">
        <p className="font-semibold text-slate-900">{withdrawal.sellerName || "—"}</p>
        <p className="mt-1 text-xs text-slate-500">
          Mã người bán: {withdrawal.sellerId || "—"}
        </p>
      </td>
      <td className="p-4">
        <p className="text-base font-bold text-blue-700">{formatVnd(withdrawal.amountVnd)}</p>
        {withdrawal.source && (
          <InfoBadge
            className="mt-2 font-semibold"
            shape="pill"
            size="sm"
            tone={getWithdrawalSourceTone(withdrawal.source)}
          >
            {withdrawalSourceLabel[withdrawal.source] || withdrawal.source}
          </InfoBadge>
        )}
      </td>
      <td className="p-4">
        <p className="font-semibold text-slate-800">
          {withdrawalMethodLabel[withdrawal.method] || withdrawal.method || "—"}
        </p>
        <p className="mt-1 text-slate-600">{accountName || "—"}</p>
        <p className="mt-1 text-xs text-slate-500">
          {[bankName, withdrawal.accountNumber].filter(Boolean).join(" · ") || "—"}
        </p>
      </td>
      <td className="p-4">
        {sellerNote ? (
          <TruncatedHoverText text={sellerNote} lines={2} className="leading-6 text-slate-700" />
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="p-4">
        <StatusBadge tone={withdrawalStatusTone[withdrawal.status] || "slate"}>
          {withdrawalStatusLabel[withdrawal.status] || withdrawal.status || "—"}
        </StatusBadge>
      </td>
      <td className="p-4">
        {withdrawal.reviewedAt && (
          <p className="text-xs font-medium text-slate-500">
            {formatDateTime(withdrawal.reviewedAt)}
          </p>
        )}
        {withdrawal.reviewerName && (
          <p className="mt-1 text-xs text-slate-400">Bởi {withdrawal.reviewerName}</p>
        )}
        {adminNote && (
          <TruncatedHoverText text={adminNote} lines={2} className="mt-2 text-xs leading-5 text-slate-600" />
        )}
        {failureReason && (
          <div className="mt-2 flex gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-xs font-medium leading-5 text-orange-700 ring-1 ring-orange-100">
            <AlertTriangle className="mt-0.5 shrink-0" size={14} />
            <TruncatedHoverText text={failureReason} lines={2} className="text-orange-700" />
          </div>
        )}
        {!withdrawal.reviewedAt && !withdrawal.reviewerName && !adminNote && !failureReason && (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
      <td className="p-4">
        {reviewableStatuses.includes(withdrawal.status) ? (
          <div className="flex flex-wrap gap-2">
            <ActionButton type="button" onClick={() => onDecision(withdrawal, "PAID")} tone="emerald">
              <Check size={15} /> Chi trả
            </ActionButton>
            <ActionButton type="button" onClick={() => onDecision(withdrawal, "REJECTED")} tone="rose">
              <X size={15} /> Từ chối
            </ActionButton>
          </div>
        ) : withdrawal.status === "PROCESSING" ? (
          <div className="flex flex-wrap gap-2">
            <ActionButton type="button" onClick={() => onDecision(withdrawal, "PAID")} tone="emerald">
              <Check size={15} /> Chi trả
            </ActionButton>
            <ActionButton type="button" onClick={() => onDecision(withdrawal, "FAILED")} tone="rose">
              <X size={15} /> Thất bại
            </ActionButton>
          </div>
        ) : (
          <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
            <Clock size={14} /> Đã xử lý
          </span>
        )}
      </td>
    </tr>
  );
}
