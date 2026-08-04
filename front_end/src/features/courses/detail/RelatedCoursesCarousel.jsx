import React from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { formatVND } from "../../../utils/formatVND";
import { COURSE_DEFAULT_IMAGES } from "../../../utils/courseImages";

const RelatedCoursesCarousel = ({
  courses,
  currentSlide,
  onPrevious,
  onNext,
  onSelectCourse,
}) => {
  if (!Array.isArray(courses) || courses.length < 2) return null;

  return (
    <div className="py-8 border-t border-gray-200">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Khóa học liên quan</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrevious}
            className="rounded-full border p-2 transition-colors hover:bg-gray-50"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="rounded-full border p-2 transition-colors hover:bg-gray-50"
            disabled={currentSlide >= courses.length - 4}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {courses.slice(currentSlide, currentSlide + 4).map((course) => (
          <div
            key={course.id}
            className="cursor-pointer overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-lg"
            onClick={() => onSelectCourse(course.id)}
          >
            <div className="aspect-video bg-gray-200">
              <img
                src={course.image || COURSE_DEFAULT_IMAGES[(course.id ?? 0) % COURSE_DEFAULT_IMAGES.length]}
                alt={course.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="mb-2 font-semibold">{course.name}</h3>
              <div className="mb-2 flex items-center">
                <Star className="h-4 w-4 fill-current text-yellow-400" />
                <span className="ml-1 text-sm text-gray-600">
                  {course.averageRating != null ? course.averageRating.toFixed(1) : "N/A"}
                </span>
              </div>
              <div className="mb-2 text-sm text-gray-600">{course.sellerName}</div>
              <div className="font-bold text-blue-600">
                {formatVND(course.price || 0)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RelatedCoursesCarousel);
