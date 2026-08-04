const HomeCourseHighlightCard = ({ course, onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    className="rounded-xl border border-gray-700 bg-gray-900 p-5 text-left transition hover:border-blue-500 hover:bg-gray-800"
  >
    <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
      {course.categoryName || course.level || "Khóa học"}
    </p>
    <h3 className="mt-3 line-clamp-2 text-lg font-bold text-white">{course.name}</h3>
    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-400">
      {course.description || "Khóa học đang được công khai trên hệ thống."}
    </p>
    <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-gray-300">
      {course.episodeCount != null && <span className="rounded-full bg-gray-800 px-3 py-1">{course.episodeCount} bài học</span>}
      <span className="rounded-full bg-gray-800 px-3 py-1">{course.durationLabel}</span>
      {course.studentCount != null && <span className="rounded-full bg-gray-800 px-3 py-1">{Number(course.studentCount).toLocaleString("vi-VN")} người mua</span>}
    </div>
  </button>
);

export default HomeCourseHighlightCard;
