import { BookOpen, Clock, Star } from "lucide-react";
import { COURSE_DEFAULT_IMAGES } from "../../utils/courseImages";
import { formatVND } from "../../utils/formatVND";
import { formatSellerCourseDuration } from "./sellerPublicView";

export default function SellerPublicCoursesGrid({ courses = [], onSelectCourse }) {
  if (!courses.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
        <BookOpen className="mx-auto mb-4 text-slate-400" size={44} />
        <h3 className="text-lg font-bold text-slate-950">Chưa có khóa học công khai</h3>
        <p className="mt-2 text-slate-500">
          Khi người bán có khóa học đã được duyệt, danh sách sẽ xuất hiện tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => {
        const fallbackImage = COURSE_DEFAULT_IMAGES[(course.id ?? 0) % COURSE_DEFAULT_IMAGES.length];
        const image = course.image || fallbackImage;
        const lessonCount = course.episodeCount ?? course.lessons ?? 0;
        const duration = course.duration ?? course.totalDuration ?? 0;

        return (
          <article
            key={course.id}
            onClick={() => onSelectCourse?.(course.id)}
            className="group flex h-full min-h-[405px] cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative aspect-video shrink-0 overflow-hidden bg-slate-100">
              <img
                src={image}
                alt={course.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = fallbackImage;
                }}
              />
              <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-blue-700 shadow-sm backdrop-blur">
                {lessonCount} bài
              </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-extrabold leading-7 text-slate-950">
                {course.name}
              </h3>
              <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">
                {course.description || "Chưa có mô tả."}
              </p>

              <div className="mt-4 flex min-h-6 items-center justify-between gap-3 text-sm text-slate-500">
                <span className="inline-flex min-w-0 items-center gap-1">
                  <Clock size={15} className="shrink-0" />
                  <span className="truncate">{formatSellerCourseDuration(duration)}</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1">
                  <Star size={15} className="fill-amber-400 text-amber-400" />
                  {Number(course.rating || 0).toFixed(1)}
                </span>
              </div>

              <div className="mt-auto flex min-h-11 items-center justify-between gap-3 pt-5">
                <p className="min-w-0 truncate text-xl font-extrabold text-blue-700">{formatVND(course.price)}</p>
                <span className="inline-flex shrink-0 items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition group-hover:bg-blue-700">
                  Xem chi tiết
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
