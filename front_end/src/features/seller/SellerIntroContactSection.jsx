import { ChevronDown, Mail, Phone, Sparkles } from "lucide-react";

export default function SellerIntroContactSection({
  intro,
  seller,
  showFullIntro,
  shownIntro,
  onToggleIntro,
}) {
  return (
    <div className="grid gap-6 p-7 md:grid-cols-[1.2fr_0.8fr] md:p-10">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
          <Sparkles size={20} className="text-blue-600" />
          Giới thiệu
        </h2>
        <p className="mt-4 whitespace-pre-line text-[15px] leading-8 text-slate-700">{shownIntro}</p>
        {intro.length > 360 && (
          <button
            type="button"
            onClick={onToggleIntro}
            className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-700"
          >
            {showFullIntro ? "Thu gọn" : "Xem thêm"}
            <ChevronDown size={16} className={showFullIntro ? "rotate-180 transition" : "transition"} />
          </button>
        )}
      </div>

      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Thông tin liên hệ</h2>
        <div className="mt-5 space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <Mail size={18} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-slate-500">Email</p>
              <p className="font-semibold text-slate-950">{seller.email || "Chưa cập nhật"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone size={18} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-slate-500">Số điện thoại</p>
              <p className="font-semibold text-slate-950">{seller.phone || "Chưa cập nhật"}</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
