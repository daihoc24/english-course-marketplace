import React, { useCallback, useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../API/axiosClient';
import LessonQuestionService from '../API/LessonQuestionService';
import { ProductContext } from '../context/ProductContext';
import {
  buildProgressFromDetails,
  calculateTotalDuration,
  findInitialPlayableEpisodeIndex,
  toSelectedLessonVideo,
} from '../features/learner/courseLearningView';
import {
  CourseVideoEmptyState,
  CourseVideoErrorState,
  CourseVideoFallback,
  CourseVideoLoadingState,
} from '../features/learner/CourseVideoStates';
import { getActiveSession, getSessionUserId } from '../utils/session';

const PurchasedCourseView = React.lazy(() => import('../features/learner/PurchasedCourseView'));
const TrialCourseView = React.lazy(() => import('../features/learner/TrialCourseView'));

const CourseVideo = () => {
  const [activeTab, setActiveTab] = useState('Tổng quan');
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [courseDetails, setCourseDetails] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState({
    title: 'Đang tải...',
    url: '',
  });
  const [videoLoadFailed, setVideoLoadFailed] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [accessMessage, setAccessMessage] = useState("");
  const [progressSummary, setProgressSummary] = useState({ completedLessons: 0, totalLessons: 0, progressPercent: 0 });
  const [progressSavingLessonId, setProgressSavingLessonId] = useState(null);
  const [lessonQuestions, setLessonQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState("");
  const [questionForm, setQuestionForm] = useState({ title: "", content: "" });
  const [replyDrafts, setReplyDrafts] = useState({});
  const [questionSaving, setQuestionSaving] = useState(false);
  const [replySavingId, setReplySavingId] = useState(null);
  const [resolvingQuestionId, setResolvingQuestionId] = useState(null);

  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useContext(ProductContext);
  const activeSession = getActiveSession(session);
  const currentUserId = getSessionUserId(session);
  const focusedQuestionId = searchParams.get("questionId");
  const selectedEpisodeParam = searchParams.get("episode") || "";


  useEffect(() => {
    setVideoLoadFailed(false);
  }, [selectedVideo.url]);


  const selectedEpisode = courseDetails[selectedVideoIndex];
  const canUseLessonQuestions = Boolean(activeSession?.token && isPurchased && selectedEpisode?.id);

  const replaceQuestion = (updatedQuestion) => {
    setLessonQuestions((current) => current.map((item) => (
      Number(item.id) === Number(updatedQuestion.id) ? updatedQuestion : item
    )));
  };

  const loadLessonQuestions = useCallback(async () => {
    if (!canUseLessonQuestions) {
      setLessonQuestions([]);
      setQuestionsError("");
      return;
    }
    setQuestionsLoading(true);
    try {
      const response = await LessonQuestionService.getLessonQuestions(courseId, selectedEpisode.id);
      if (response.code !== 200) throw new Error(response.message || "Không thể tải hỏi đáp");
      setLessonQuestions(Array.isArray(response.result) ? response.result : []);
      setQuestionsError("");
    } catch (error) {
      setLessonQuestions([]);
      setQuestionsError(error?.response?.data?.message || error.message || "Không thể tải hỏi đáp bài học.");
    } finally {
      setQuestionsLoading(false);
    }
  }, [canUseLessonQuestions, courseId, selectedEpisode?.id]);

  useEffect(() => {
    if (activeTab === "Hỏi đáp") {
      loadLessonQuestions();
    }
  }, [activeTab, loadLessonQuestions]);

  useEffect(() => {
    if (focusedQuestionId) {
      setActiveTab("Hỏi đáp");
    }
  }, [focusedQuestionId]);

  useEffect(() => {
    if (activeTab !== "Hỏi đáp" || !focusedQuestionId || lessonQuestions.length === 0) return undefined;
    const timer = window.setTimeout(() => {
      document.getElementById(`lesson-question-${focusedQuestionId}`)?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [activeTab, focusedQuestionId, lessonQuestions.length]);

  const handleCreateQuestion = async (event) => {
    event.preventDefault();
    if (!canUseLessonQuestions || questionSaving) return;
    setQuestionSaving(true);
    try {
      const response = await LessonQuestionService.createQuestion(courseId, selectedEpisode.id, {
        title: questionForm.title,
        content: questionForm.content,
      });
      if (response.code !== 200) throw new Error(response.message || "Không thể gửi câu hỏi");
      setLessonQuestions((current) => [response.result, ...current]);
      setQuestionForm({ title: "", content: "" });
      setQuestionsError("");
    } catch (error) {
      setQuestionsError(error?.response?.data?.message || error.message || "Không thể gửi câu hỏi.");
    } finally {
      setQuestionSaving(false);
    }
  };

  const handleReplyQuestion = async (questionId) => {
    const content = String(replyDrafts[questionId] || "").trim();
    if (!content || replySavingId) return;
    setReplySavingId(questionId);
    try {
      const response = await LessonQuestionService.replyQuestion(questionId, { content });
      if (response.code !== 200) throw new Error(response.message || "Không thể gửi phản hồi");
      replaceQuestion(response.result);
      setReplyDrafts((current) => ({ ...current, [questionId]: "" }));
      setQuestionsError("");
    } catch (error) {
      setQuestionsError(error?.response?.data?.message || error.message || "Không thể gửi phản hồi.");
    } finally {
      setReplySavingId(null);
    }
  };

  const handleReplyChange = useCallback((questionId, value) => {
    setReplyDrafts((current) => ({ ...current, [questionId]: value }));
  }, []);

  const handleResolveQuestion = async (questionId) => {
    if (resolvingQuestionId) return;
    setResolvingQuestionId(questionId);
    try {
      const response = await LessonQuestionService.resolveQuestion(questionId);
      if (response.code !== 200) throw new Error(response.message || "Không thể cập nhật câu hỏi");
      replaceQuestion(response.result);
      setQuestionsError("");
    } catch (error) {
      setQuestionsError(error?.response?.data?.message || error.message || "Không thể cập nhật câu hỏi.");
    } finally {
      setResolvingQuestionId(null);
    }
  };

  const handleVideoSelect = (episode, index) => {
    if (!isPurchased && !episode.isPreview) {
      setAccessMessage("Bạn cần mua khóa học để xem bài giảng này. Hiện chỉ mở các bài xem thử.");
      return;
    }

    setAccessMessage("");
    setSelectedVideo({
      title: `Bài ${episode.episodeNumber}`,
      url: episode.link,
    });
    setSelectedVideoIndex(index);
  };

  const handleToggleLessonCompleted = async (episode, event) => {
    event?.stopPropagation();
    if (!isPurchased || !episode?.id || progressSavingLessonId) return;

    setProgressSavingLessonId(episode.id);
    try {
      const response = episode.completed
        ? await axiosClient.delete(`/courses/${courseId}/progress/${episode.id}`)
        : await axiosClient.post(`/courses/${courseId}/progress/${episode.id}`);
      const completedIds = new Set(response.data?.result?.completedLessonIds || []);
      setCourseDetails((current) => {
        const next = current.map((item) => ({
          ...item,
          completed: completedIds.has(item.id),
        }));
        setProgressSummary(buildProgressFromDetails(next));
        return next;
      });
      setAccessMessage("");
    } catch (error) {
      setAccessMessage(error.response?.data?.message || "Không thể cập nhật tiến độ học. Vui lòng thử lại.");
    } finally {
      setProgressSavingLessonId(null);
    }
  };

  const handleBack = () => {
    navigate(`/detail/${courseId}`);
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        setError("Thiếu mã khóa học");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const uid = currentUserId;
        const courseResponse = await axiosClient.get(`/courses/${courseId}`, uid ? { params: { userId: uid } } : undefined);
        let response;
        try {
          response = await axiosClient.get(`/courses/${courseId}/learning-content`);
        } catch (contentError) {
          console.warn("[CourseVideo] learning-content failed, falling back to public preview details", {
            courseId,
            status: contentError.response?.status,
            message: contentError.response?.data?.message || contentError.message,
            hasSession: Boolean(activeSession?.token),
            userId: uid,
          });
          response = await axiosClient.get(`/courses/details/${courseId}`);
        }

        const courseResult = courseResponse.data?.result;
        if (courseResponse.data?.code === 200 && courseResult) {
          setCourse({
            name: courseResult.name || "Khóa học",
            description: courseResult.description || "",
            rating: courseResult.rating ?? 0,
            price: courseResult.price ?? 0,
            categoryName: courseResult.categoryName || "Tiếng Anh",
            episodeCount: courseResult.episodeCount,
            totalDuration: courseResult.totalDuration,
            image: courseResult.image || "",
          });
          setIsPurchased(!!courseResult.purchased);
        } else {
          throw new Error("Không tìm thấy thông tin khóa học");
        }
        
        if (response.data && response.data.code === 200 && response.data.result && Array.isArray(response.data.result)) {
          const details = response.data.result;
          setCourseDetails(details);
          setProgressSummary(buildProgressFromDetails(details));
          const purchased = !!courseResult?.purchased || details.some((detail) => detail.link && !detail.isPreview);
          setIsPurchased(purchased);

          if (details.length > 0) {
            const idx = findInitialPlayableEpisodeIndex(details, selectedEpisodeParam, purchased);
            setSelectedVideo(toSelectedLessonVideo(details[idx], purchased));
            setSelectedVideoIndex(idx);
          }
        } else {
          throw new Error(`Invalid response format: ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        console.error('API fetch failed:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load course';
        setError(errorMessage);
        
        setCourseDetails([]);
        setSelectedVideo({ title: '', url: '' });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, activeSession?.token, currentUserId, selectedEpisodeParam]);

  if (loading) {
    return <CourseVideoLoadingState courseId={courseId} />;
  }

  if (error && courseDetails.length === 0) {
    return (
      <CourseVideoErrorState
        courseId={courseId}
        error={error}
        onBack={handleBack}
        onLogin={() => navigate("/auth/login")}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!course || !courseDetails.length) {
    return <CourseVideoEmptyState courseId={courseId} />;
  }

  const totalDuration = calculateTotalDuration(courseDetails);
  const selectedEpisodeResources = selectedEpisode?.resources || [];
  const videoPoster = course?.image || undefined;
  if (!isPurchased) {
    return (
      <React.Suspense fallback={<CourseVideoFallback trial />}>
        <TrialCourseView
          accessMessage={accessMessage}
          course={course}
          courseDetails={courseDetails}
          onBack={handleBack}
          onCheckout={() => navigate(`/checkout/${courseId}`)}
          onRetryVideo={() => setVideoLoadFailed(false)}
          onVideoError={() => setVideoLoadFailed(true)}
          onVideoReady={() => setVideoLoadFailed(false)}
          onVideoSelect={handleVideoSelect}
          onViewCourse={() => navigate(`/detail/${courseId}`)}
          selectedVideo={selectedVideo}
          selectedVideoIndex={selectedVideoIndex}
          videoLoadFailed={videoLoadFailed}
          videoPoster={videoPoster}
        />
      </React.Suspense>
    );
  }
  return (
    <React.Suspense fallback={<CourseVideoFallback />}>
      <PurchasedCourseView
        accessMessage={accessMessage}
        activeTab={activeTab}
        canUseLessonQuestions={canUseLessonQuestions}
        course={course}
        courseDetails={courseDetails}
        courseId={courseId}
        currentUserId={currentUserId}
        focusedQuestionId={focusedQuestionId}
        isPurchased={isPurchased}
        lessonQuestions={lessonQuestions}
        onActiveTabChange={setActiveTab}
        onBack={handleBack}
        onCreateQuestion={handleCreateQuestion}
        onMarkLessonCompleted={handleToggleLessonCompleted}
        onQuestionFormChange={setQuestionForm}
        onRefreshQuestions={loadLessonQuestions}
        onReplyChange={handleReplyChange}
        onReplyQuestion={handleReplyQuestion}
        onResolveQuestion={handleResolveQuestion}
        onRetryVideo={() => setVideoLoadFailed(false)}
        onVideoError={() => setVideoLoadFailed(true)}
        onVideoReady={() => setVideoLoadFailed(false)}
        onVideoSelect={handleVideoSelect}
        onViewCourse={() => navigate(`/detail/${courseId}`)}
        progressSavingLessonId={progressSavingLessonId}
        progressSummary={progressSummary}
        questionForm={questionForm}
        questionSaving={questionSaving}
        questionsError={questionsError}
        questionsLoading={questionsLoading}
        replyDrafts={replyDrafts}
        replySavingId={replySavingId}
        resolvingQuestionId={resolvingQuestionId}
        selectedEpisode={selectedEpisode}
        selectedEpisodeResources={selectedEpisodeResources}
        selectedVideo={selectedVideo}
        selectedVideoIndex={selectedVideoIndex}
        totalDuration={totalDuration}
        videoLoadFailed={videoLoadFailed}
        videoPoster={videoPoster}
      />
    </React.Suspense>
  );
};

export default CourseVideo;
