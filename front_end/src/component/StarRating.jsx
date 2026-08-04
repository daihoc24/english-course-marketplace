import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import axiosClient from "../API/axiosClient";
import { readStoredSession } from "../utils/session";

const StarRating = ({ courseId, currentRating = 0 }) => {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUserRating = async () => {
      const session = readStoredSession();
      if (!session?.currentUser?.id) return;

      try {
        const response = await axiosClient.get(
          `/courses/${courseId}/user-rating/${session.currentUser.id}`
        );
        if (response.data.code === 200 && response.data.result) {
          setUserRating(response.data.result.rating);
        }
      } catch (error) {
        console.error("Error fetching user rating:", error);
      }
    };

    void fetchUserRating();
  }, [courseId]);

  const handleRatingClick = async (rating) => {
    const session = readStoredSession();
    if (!session?.currentUser?.id) {
      setMessage("Bạn cần đăng nhập để đánh giá.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await axiosClient.post(`/courses/${courseId}/rate`, {
        courseId: parseInt(courseId, 10),
        userId: session.currentUser.id,
        rating,
      });

      if (response.data.code === 200) {
        setUserRating(rating);
        setMessage("Đã lưu đánh giá của bạn.");
      } else {
        setMessage(response.data.message || "Không thể lưu đánh giá.");
      }
    } catch (error) {
      const fallbackMessage = "Có lỗi xảy ra khi lưu đánh giá.";
      const responseMessage = error.response?.data?.message || fallbackMessage;
      setMessage(String(responseMessage).replace(/^Error:\s*/i, ""));
    } finally {
      setLoading(false);
    }
  };

  const roundedRating = Number(currentRating || 0);

  return (
    <div className="course-rating-block">
      <div className="course-rating-summary">
        <span className="course-rating-value">
          {roundedRating > 0 ? roundedRating.toFixed(1) : "Chưa có đánh giá"}
        </span>
        <div className="course-rating-stars" aria-label="Điểm đánh giá trung bình">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= Math.floor(roundedRating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="course-rating-input">
        <span>Đánh giá của bạn</span>
        <div className="course-rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 cursor-pointer transition-colors ${
                star <= (hoverRating || userRating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 hover:text-yellow-200"
              } ${loading ? "pointer-events-none opacity-50" : ""}`}
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
        </div>
        {userRating > 0 && <span>{userRating} sao</span>}
        {loading && <span>Đang lưu...</span>}
      </div>
      {message && <p className="course-rating-message">{message}</p>}
    </div>
  );
};

export default StarRating;
