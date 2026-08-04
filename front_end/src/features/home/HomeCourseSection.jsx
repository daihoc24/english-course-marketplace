import StateBlock from "../../shared/components/feedback/StateBlock";

const CourseSkeletonCard = () => (
  <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
    <div className="h-48 animate-pulse bg-gray-700" />
    <div className="space-y-3 p-5">
      <div className="h-5 w-3/4 animate-pulse rounded bg-gray-700" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-gray-700" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-700" />
    </div>
  </div>
);

const CourseLoadError = ({ onRetry }) => (
  <div className="rounded-xl border border-blue-900/60 bg-gray-900 p-6 text-center">
    <p className="text-sm text-gray-300">Chưa tải được danh sách khóa học.</p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
    >
      Tải lại
    </button>
  </div>
);

const HomeCourseSection = ({
  title,
  description,
  actionLabel = "Xem tất cả",
  onAction,
  loading,
  error,
  items,
  skeletonCount = 4,
  emptyText = "Chưa có dữ liệu",
  renderItem,
}) => {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          {description && <p className="mt-2 text-sm text-gray-400">{description}</p>}
        </div>
        {onAction && (
          <button type="button" onClick={onAction} className="text-blue-400 transition hover:text-blue-300">
            {actionLabel}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: skeletonCount }, (_, index) => <CourseSkeletonCard key={index} />)
        ) : error ? (
          <div className="sm:col-span-2 lg:col-span-4">
            <CourseLoadError onRetry={onAction} />
          </div>
        ) : items?.length ? (
          items.map((item) => renderItem(item))
        ) : (
          <div className="sm:col-span-2 lg:col-span-4">
            <StateBlock compact text={emptyText} />
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeCourseSection;
