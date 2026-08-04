import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "../API/axiosClient";
import { MessageCircle, Send, User } from "lucide-react";
import { isAuthenticated } from "../utils/session";

const MAX_LEN = 2000;
const INITIAL_VISIBLE_COMMENTS = 3;
const LOAD_MORE_COMMENTS = 5;

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(iso);
  }
}

const CourseCommentsSection = ({ courseId, session }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COMMENTS);

  const loadComments = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await axiosClient.get(`/courses/${courseId}/comments`);
      const body = res.data;
      if (body?.code === 404) {
        setLoadError(body.message || "Không tìm thấy khóa học");
        setComments([]);
        return;
      }
      setComments(Array.isArray(body?.result) ? body.result : []);
    } catch (e) {
      setLoadError(
        e?.response?.data?.message ||
          e.message ||
          "Không tải được bình luận"
      );
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COMMENTS);
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setPostError("Vui lòng nhập nội dung bình luận.");
      return;
    }
    if (trimmed.length > MAX_LEN) {
      setPostError(`Tối đa ${MAX_LEN} ký tự.`);
      return;
    }
    setPostError(null);
    setSubmitting(true);
    try {
      const res = await axiosClient.post(`/courses/${courseId}/comments`, {
        content: trimmed,
      });
      const body = res.data;
      if (body?.code !== 200 || !body?.result) {
        throw new Error(body?.message || "Đăng bình luận thất bại");
      }
      setText("");
      setComments((prev) => [body.result, ...prev]);
      setVisibleCount((current) => Math.max(current, INITIAL_VISIBLE_COMMENTS));
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không gửi được bình luận. Hãy đăng nhập và thử lại.";
      setPostError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const loggedIn = isAuthenticated(session);
  const visibleComments = comments.slice(0, visibleCount);
  const hiddenCommentCount = Math.max(
    comments.length - visibleComments.length,
    0
  );
  const canCollapseComments = visibleCount > INITIAL_VISIBLE_COMMENTS;

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-7 h-7 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Bình luận</h2>
      </div>

      {loggedIn ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <label htmlFor="course-comment" className="sr-only">
            Nội dung bình luận
          </label>
          <textarea
            id="course-comment"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_LEN}
            placeholder="Chia sẻ cảm nhận về khóa học..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
            <span className="text-sm text-gray-500">
              {text.length}/{MAX_LEN} ký tự
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Đang gửi..." : "Gửi bình luận"}
            </button>
          </div>
          {postError && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {postError}
            </p>
          )}
        </form>
      ) : (
        <p className="mb-8 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-gray-700 text-sm">
          Đăng nhập để tham gia bình luận.
        </p>
      )}

      {loading && (
        <p className="text-gray-500 text-center py-8">
          Đang tải bình luận...
        </p>
      )}
      {!loading && loadError && (
        <p className="text-red-600 text-center py-4">{loadError}</p>
      )}
      {!loading && !loadError && comments.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          Chưa có bình luận nào.
        </p>
      )}

      {!loading && !loadError && comments.length > 0 && (
        <>
          <ul className="space-y-6">
            {visibleComments.map((c) => (
              <li
                key={c.id}
                className="flex gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0"
              >
                <div className="shrink-0">
                  {c.userAvatar ? (
                    <img
                      src={c.userAvatar}
                      alt=""
                      className="h-11 w-11 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-gray-200 flex items-center justify-center border border-gray-200">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-semibold text-gray-900">
                      {c.userFullname || "Người dùng"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-800 whitespace-pre-wrap break-words">
                    {c.content}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {(hiddenCommentCount > 0 || canCollapseComments) && (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {hiddenCommentCount > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((current) =>
                      Math.min(current + LOAD_MORE_COMMENTS, comments.length)
                    )
                  }
                  className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  Xem thêm bình luận
                  <span className="ml-2 text-blue-500">
                    ({Math.min(LOAD_MORE_COMMENTS, hiddenCommentCount)} tiếp
                    theo)
                  </span>
                </button>
              )}

              {canCollapseComments && (
                <button
                  type="button"
                  onClick={() => setVisibleCount(INITIAL_VISIBLE_COMMENTS)}
                  className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Thu gọn bình luận
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default CourseCommentsSection;
