export const courseVideoTabs = ["Tổng quan", "Tài liệu", "Hỏi đáp"];

export const trialCategories = [
  "IELTS",
  "TOEIC",
  "TOEFL",
  "BEGINNER",
  "ADVANCED",
  "KIDS & TEENS",
  "CAMBRIDGE",
];

export const formatDuration = (minutes) => {
  const totalMinutes = Number(minutes || 0);
  if (totalMinutes < 60) return `${totalMinutes} phút`;

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  return remainingMinutes > 0 ? `${hours} giờ ${remainingMinutes} phút` : `${hours} giờ`;
};

export const calculateTotalDuration = (courseDetails = []) => (
  Array.isArray(courseDetails)
    ? courseDetails.reduce((total, episode) => total + Number(episode.duration || 0), 0)
    : 0
);

export const buildProgressFromDetails = (details = []) => {
  const totalLessons = details.length;
  const completedLessons = details.filter((episode) => episode.completed).length;

  return {
    totalLessons,
    completedLessons,
    progressPercent: totalLessons === 0 ? 0 : Math.round((completedLessons * 100) / totalLessons),
  };
};

export const findInitialPlayableEpisodeIndex = (details = [], selectedEpisodeParam = "", purchased = false) => {
  if (!details.length) return 0;

  const episodeParam = parseInt(selectedEpisodeParam, 10);
  let selectedIndex = 0;
  const firstPreviewIndex = details.findIndex((episode) => episode.isPreview);

  if (!Number.isNaN(episodeParam)) {
    const foundIndex = details.findIndex((episode) => episode.episodeNumber === episodeParam);
    if (foundIndex >= 0) {
      const episode = details[foundIndex];
      if (purchased || episode.isPreview) selectedIndex = foundIndex;
    }
  }

  if (!purchased && !details[selectedIndex]?.isPreview && firstPreviewIndex >= 0) {
    return firstPreviewIndex;
  }

  return selectedIndex;
};

export const toSelectedLessonVideo = (episode, purchased = false) => {
  if (!episode || (!purchased && !episode.isPreview)) {
    return {
      title: "Chưa có tập xem thử",
      url: "",
    };
  }

  return {
    title: `Bài ${episode.episodeNumber}`,
    url: episode.link,
  };
};

export const isDirectVideoUrl = (url) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) && !/(youtube\.com|youtu\.be)/i.test(parsed.hostname);
  } catch {
    return false;
  }
};
