import React from "react";
import CourseCurriculum from "./CourseCurriculum";
import SellerInfoCard from "./SellerInfoCard";

const CourseDetailMainContent = ({
  seller,
  instructorExpanded,
  onToggleInstructor,
  onViewSeller,
  episodes,
  totalEpisodes,
  totalDurationLabel,
  isPurchased,
  onEpisodeClick,
}) => (
  <>
    <SellerInfoCard
      seller={seller}
      expanded={instructorExpanded}
      onToggleExpanded={onToggleInstructor}
      onViewSeller={onViewSeller}
    />

    <CourseCurriculum
      episodes={episodes}
      totalEpisodes={totalEpisodes}
      totalDurationLabel={totalDurationLabel}
      isPurchased={isPurchased}
      onEpisodeClick={onEpisodeClick}
    />
  </>
);

export default React.memo(CourseDetailMainContent);
