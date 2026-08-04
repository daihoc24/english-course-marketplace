import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Navigate, useLocation } from "react-router-dom";
import axiosClient from "../API/axiosClient";
import { getMyReports } from "../API/ReportService";
import { ProductContext } from "../context/ProductContext";
import { searchCourses } from "../services/CourseService.js";
import { COURSE_DEFAULT_IMAGES } from "../utils/courseImages";
import { getActiveSession, getSessionUserId, isAuthenticated } from "../utils/session";
import CourseHeroSection from "../features/courses/detail/CourseHeroSection";
import {
  DetailErrorState,
  DetailLoadingState,
  DetailSectionFallback,
} from "../features/courses/detail/DetailStates";
import {
  promptLoginForEnrollment,
  promptLoginForFavorite,
  promptLoginToReportCourse,
  promptLoginToWatchCourse,
  promptPurchaseRequired,
} from "../features/courses/detail/courseDetailPrompts";
import {
  calculateTotalDuration,
  formatDuration,
  isDirectVideoUrl,
} from "../features/learner/courseLearningView";
import "./Detail.css";

const CourseCommentsSection = React.lazy(() => import("../component/CourseCommentsSection"));
const CourseDetailMainContent = React.lazy(() => import("../features/courses/detail/CourseDetailMainContent"));
const CourseReportPanel = React.lazy(() => import("../features/courses/detail/CourseReportPanel"));
const CourseVideoPreviewModal = React.lazy(() => import("../features/courses/detail/CourseVideoPreviewModal"));
const RelatedCoursesCarousel = React.lazy(() => import("../features/courses/detail/RelatedCoursesCarousel"));

const Detail = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMoreInstructor, setShowMoreInstructor] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  const { session, isInFavorites, toggleFavorite } = useContext(ProductContext);
  const activeSession = getActiveSession(session);
  const activeUserId = getSessionUserId(session);
  const loggedIn = isAuthenticated(session);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [course, setCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState([]);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);

  const [relatedCourses, setRelatedCourses] = useState([]);
  const [_relatedLoading, setRelatedLoading] = useState(false);
  const [myReports, setMyReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? Math.max(0, relatedCourses.length - 4) : prev - 1
    );
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) =>
      prev >= relatedCourses.length - 4 ? 0 : prev + 1
    );
  };

  const handleWatchCourse = () => {
    navigate(`/course-video/${id}`);
  };

  const handleEpisodeClick = async (episode) => {
    if (episode.isPreview) {
      navigate(`/course-video/${id}?episode=${episode.episodeNumber}`);
      return;
    }

    if (!loggedIn) {
      await promptLoginToWatchCourse(navigate);
      return;
    }
    if (!isPurchased) {
      await promptPurchaseRequired();
      return;
    }
    navigate(`/course-video/${id}?episode=${episode.episodeNumber}`);
  };

  const handleSellerClick = (sellerId) => {
    navigate(`/seller/${sellerId}`);
  };

  const handleVideoPreviewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowVideoPreview(true);
  };

  const handleCloseVideoPreview = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowVideoPreview(false);
  };

  const handleEnrollment = async () => {
    if (!loggedIn) {
      await promptLoginForEnrollment(navigate);
    } else {
      navigate(`/checkout/${id}`);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!loggedIn) {
      await promptLoginForFavorite(navigate);
      return;
    }

    toggleFavorite(Number(id));
  };

  const handleOpenReports = () => {
    const reportParams = new URLSearchParams({ courseId: String(id) });
    const courseTitle = course?.name || course?.title || "";
    if (courseTitle) {
      reportParams.set("courseTitle", courseTitle);
    }
    navigate(`/my-reports?${reportParams.toString()}`);
  };

  const promptLoginForReport = async () => {
    await promptLoginToReportCourse(navigate);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showVideoPreview) {
        setShowVideoPreview(false);
      }
    };

    if (showVideoPreview) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [showVideoPreview]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        setError("No course ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const userId = activeUserId;

        const courseResponse = await axiosClient.get(`/courses/${id}`, {
          params: { userId },
        });

        if (
          courseResponse.data &&
          courseResponse.data.code === 200 &&
          courseResponse.data.result
        ) {
          const courseData = courseResponse.data.result;
          setCourse(courseData);

          const purchased = courseData.purchased;
          setIsPurchased(purchased);

          try {
            const detailsResponse = await axiosClient.get(
              `/courses/details/${id}`
            );
            if (detailsResponse.data && detailsResponse.data.code === 200) {
              setCourseDetails(detailsResponse.data.result);
            }
          } catch (detailsError) {
            console.error("Failed to load course details:", detailsError);
          }

          if (courseData.sellerId && courseData.sellerName) {
            try {
              const sellerResponse = await axiosClient.get(`/users/id/${courseData.sellerId}`);
              const sellerData = sellerResponse.data?.result ?? sellerResponse.data;
              if (sellerData) {
                setSeller({
                  id: courseData.sellerId,
                  fullname: sellerData.fullname || courseData.sellerName,
                  avatar: sellerData.avatar || null,
                  email: sellerData.email || null,
                  phone: sellerData.phone || null,
                  introduce: sellerData.introduce || null,
                  certificate: sellerData.certificate || null,
                  gender: sellerData.gender || null,
                });
              } else {
                setSeller({
                  id: courseData.sellerId,
                  fullname: courseData.sellerName,
                });
              }
            } catch (_sellerError) {
              setSeller({
                id: courseData.sellerId,
                fullname: courseData.sellerName,
              });
            }
          }
        } else {
          throw new Error("Invalid course response format");
        }
      } catch (error) {
        console.error("API fetch failed:", error);
        setError(error.response?.data?.message || error.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, activeUserId]);

  useEffect(() => {
    const fetchRelatedCourses = async () => {
      if (!course?.categoryId) {
        setRelatedCourses([]);
        return;
      }

      setRelatedLoading(true);
      try {
        const response = await searchCourses({ categoryId: course.categoryId, size: 5 });
        const courses = response?.result?.content || [];
        const filtered = courses.filter((c) => String(c.id) !== String(id));
        const limited = filtered.slice(0, 4);
        if (limited.length < 2) {
          setRelatedCourses([]);
        } else {
          setRelatedCourses(limited);
        }
      } catch (_error) {
        setRelatedCourses([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelatedCourses();
  }, [course?.categoryId, id]);

  useEffect(() => {
    const fetchMyReports = async () => {
      if (!loggedIn || !activeSession?.token || !id) {
        setMyReports([]);
        return;
      }

      setReportsLoading(true);
      try {
        const response = await getMyReports(id);
        setMyReports(Array.isArray(response.data?.result) ? response.data.result : []);
      } catch (error) {
        console.warn("Không thể tải khiếu nại của người dùng:", error);
        setMyReports([]);
      } finally {
        setReportsLoading(false);
      }
    };

    fetchMyReports();
  }, [id, loggedIn, activeSession?.token]);

  useEffect(() => {
    const scrollToReportSection = () => {
      const reportId = new URLSearchParams(location.search).get("reportId");
      const section = document.getElementById("my-reports");
      if (!reportId) {
        if (location.hash === "#my-reports") {
          section?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

      const element = document.getElementById(`my-report-${reportId}`);
      (element || section)?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    scrollToReportSection();
    const timers = [120, 350, 700].map((delay) => window.setTimeout(scrollToReportSection, delay));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [location.search, location.hash, myReports, reportsLoading]);

  useEffect(() => {
    const handleNotificationNavigate = () => {
      const reportId = new URLSearchParams(window.location.search).get("reportId");
      const section = document.getElementById("my-reports");
      const element = reportId ? document.getElementById(`my-report-${reportId}`) : null;
      (element || section)?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    window.addEventListener("notification:navigate", handleNotificationNavigate);
    return () => window.removeEventListener("notification:navigate", handleNotificationNavigate);
  }, []);

  if (loading) {
    return <DetailLoadingState />;
  }

  if (error) {
    return <DetailErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  if (!course) {
    return <Navigate to="/not-found" replace />;
  }

  const totalDuration = calculateTotalDuration(courseDetails);
  const totalEpisodes = courseDetails ? courseDetails.length : 0;
  const previewEpisodes = courseDetails
    ? courseDetails.filter((ep) => ep.isPreview).length
    : 0;

  const firstPreviewEpisodeLink = Array.isArray(courseDetails)
    ? courseDetails.find((ep) => ep.isPreview)?.link
    : null;
  const previewVideoSource =
    course?.videoPreviewUrl && isDirectVideoUrl(course.videoPreviewUrl)
      ? course.videoPreviewUrl
      : firstPreviewEpisodeLink && isDirectVideoUrl(firstPreviewEpisodeLink)
        ? firstPreviewEpisodeLink
        : null;
  const hasValidVideoPreview = Boolean(previewVideoSource);
  const courseThumbnail =
    course?.image || COURSE_DEFAULT_IMAGES[(Number(course?.id || id || 0)) % COURSE_DEFAULT_IMAGES.length];
  const courseTitle = course?.name || course?.title || "";
  const totalDurationLabel = formatDuration(totalDuration);
  const numericCourseId = Number(id);

  return (
    <div className="course-detail-page max-w-6xl mx-auto px-4 bg-white">
      <div className="py-4 text-sm text-gray-500">
        <span
          className="ml-1 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
          onClick={() => navigate(`/courses?categoryId=${course.categoryId}`)}
        >
          {course.categoryName || "Khóa học"}
        </span>
      </div>

      <CourseHeroSection
        course={course}
        courseId={id}
        totalEpisodes={totalEpisodes}
        totalDurationLabel={totalDurationLabel}
        previewEpisodes={previewEpisodes}
        isPurchased={isPurchased}
        isFavorite={isInFavorites(numericCourseId)}
        hasValidVideoPreview={hasValidVideoPreview}
        courseThumbnail={courseThumbnail}
        onWatchCourse={handleWatchCourse}
        onEnrollment={handleEnrollment}
        onToggleFavorite={handleFavoriteToggle}
        onPreview={handleVideoPreviewClick}
      />

      {showVideoPreview && (
        <React.Suspense fallback={null}>
          <CourseVideoPreviewModal
            open={showVideoPreview}
            previewVideoSource={previewVideoSource}
            courseThumbnail={courseThumbnail}
            onClose={handleCloseVideoPreview}
          />
        </React.Suspense>
      )}

      <React.Suspense fallback={<DetailSectionFallback label="Đang tải nội dung khóa học..." />}>
        <CourseDetailMainContent
          seller={seller}
          instructorExpanded={showMoreInstructor}
          onToggleInstructor={() => setShowMoreInstructor((value) => !value)}
          onViewSeller={handleSellerClick}
          episodes={courseDetails}
          totalEpisodes={totalEpisodes}
          totalDurationLabel={totalDurationLabel}
          isPurchased={isPurchased}
          onEpisodeClick={handleEpisodeClick}
        />
      </React.Suspense>

      <React.Suspense fallback={<DetailSectionFallback label="Đang tải phần khiếu nại..." />}>
        <CourseReportPanel
          loggedIn={loggedIn}
          courseId={id}
          courseTitle={courseTitle}
          myReports={myReports}
          reportsLoading={reportsLoading}
          onCreated={(report) => {
            if (report) setMyReports((items) => [report, ...items]);
          }}
          onLogin={promptLoginForReport}
          onOpenReports={handleOpenReports}
        />
      </React.Suspense>

      <React.Suspense fallback={null}>
        <CourseCommentsSection courseId={numericCourseId} session={activeSession} />
      </React.Suspense>

      <React.Suspense fallback={null}>
        <RelatedCoursesCarousel
          courses={relatedCourses}
          currentSlide={currentSlide}
          onPrevious={handlePrevSlide}
          onNext={handleNextSlide}
          onSelectCourse={(courseId) => navigate(`/detail/${courseId}`)}
        />
      </React.Suspense>
    </div>
  );
};

export default Detail;
