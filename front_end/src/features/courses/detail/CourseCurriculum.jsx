import React from "react";
import { Clock, Play } from "lucide-react";

const CourseCurriculum = ({
  episodes,
  totalEpisodes,
  totalDurationLabel,
  isPurchased,
  onEpisodeClick,
}) => (
  <div className="py-8">
    <h2 className="mb-6 text-2xl font-bold">Nội dung khóa học</h2>
    <div className="rounded-lg bg-gray-50 p-6">
      <div className="mb-4 text-sm text-gray-600">
        {totalEpisodes} tập • {totalDurationLabel} tổng thời lượng
      </div>

      <div className="space-y-3">
        {episodes?.map((episode) => {
          const canOpen = isPurchased || episode.isPreview;
          return (
            <div
              key={episode.id}
              role="button"
              tabIndex={0}
              onClick={() => onEpisodeClick(episode)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onEpisodeClick(episode);
                }
              }}
              className={`flex items-center justify-between rounded border bg-white p-3 transition-shadow ${
                canOpen
                  ? "cursor-pointer hover:border-blue-200 hover:shadow-md"
                  : "cursor-not-allowed opacity-70"
              }`}
            >
              <div className="flex items-center">
                <Play className="mr-3 h-4 w-4 text-gray-400" />
                <span className="font-medium">Bài {episode.episodeNumber}</span>
                {episode.isPreview && (
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                    Xem trước miễn phí
                  </span>
                )}
                {isPurchased && (
                  <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    Đã mở khóa
                  </span>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="mr-1 h-4 w-4" />
                {episode.duration} phút
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default React.memo(CourseCurriculum);
