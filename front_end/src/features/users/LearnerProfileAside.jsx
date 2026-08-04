import { Link } from "react-router-dom";
import { Award, CreditCard, Mail, Phone, User } from "lucide-react";
import { formatVnd as formatMoney } from "../../shared/utils/formatters";

const genderLabel = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
    <div className="rounded-xl bg-white p-2 text-blue-600 shadow-sm">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="truncate text-sm font-semibold text-slate-800">{value}</p>
    </div>
  </div>
);

export default function LearnerProfileAside({ learnerCreditBalance = 0, userInfo = {} }) {
  return (
    <aside className="space-y-6">
      <section className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-emerald-600 p-3 text-white">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-950">Tín dụng học tập</h3>
            <p className="mt-2 text-3xl font-bold text-emerald-700">{formatMoney(learnerCreditBalance)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Đây là tiền hoàn đã được admin duyệt. Bạn có thể dùng để mua khóa khác hoặc rút tiền.
            </p>
            <Link
              to="/my-refunds"
              className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Xem tín dụng & rút tiền
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Liên hệ</h3>
        <div className="mt-5 space-y-3">
          <InfoRow icon={<Mail className="h-5 w-5" />} label="Email" value={userInfo.email || "Chưa cập nhật"} />
          <InfoRow icon={<Phone className="h-5 w-5" />} label="Số điện thoại" value={userInfo.phone || "Chưa cập nhật"} />
          <InfoRow icon={<User className="h-5 w-5" />} label="Giới tính" value={genderLabel[userInfo.gender] || "Chưa cập nhật"} />
        </div>
      </section>

      <section className="rounded-3xl border border-blue-100 bg-blue-50/70 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-950">Gợi ý hoàn thiện hồ sơ</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Thêm mục tiêu học tập, số điện thoại và chứng chỉ giúp hồ sơ trông đáng tin hơn khi trao đổi với giảng viên.
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}
