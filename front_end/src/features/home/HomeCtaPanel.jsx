const HomeCtaPanel = ({ onExploreCourses, onExploreTeachers }) => (
  <section className="container mx-auto px-4 py-16">
    <div className="rounded-2xl border border-blue-900/50 bg-slate-900 p-8 md:flex md:items-center md:justify-between md:p-12">
      <div className="mb-6 md:mb-0 md:w-2/3">
        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Sẵn sàng bắt đầu học?</h2>
        <p className="mb-6 text-lg text-gray-300">
          Chọn khóa học theo trình độ, xem trước bài học và theo dõi tiến độ ngay trong tài khoản của bạn.
        </p>
        <div className="flex flex-wrap gap-4">
          <button type="button" onClick={onExploreCourses} className="rounded-full bg-white px-6 py-3 font-bold text-blue-900 shadow-lg transition hover:bg-gray-100">
            Xem khóa học
          </button>
          <button type="button" onClick={onExploreTeachers} className="rounded-full border-2 border-white px-6 py-3 font-bold text-white transition hover:bg-white/10">
            Tìm giảng viên
          </button>
        </div>
      </div>

      <div className="space-y-3 text-sm text-gray-300 md:w-1/3">
        <p className="rounded-xl border border-white/10 px-4 py-3">Video học, tài liệu và hỏi đáp theo từng bài.</p>
        <p className="rounded-xl border border-white/10 px-4 py-3">Thanh toán, hoàn tiền và thông báo được gom trong tài khoản.</p>
        <p className="rounded-xl border border-white/10 px-4 py-3">Admin và seller có dashboard riêng để xử lý vận hành.</p>
      </div>
    </div>
  </section>
);

export default HomeCtaPanel;
