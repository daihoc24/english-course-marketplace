import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import LessonQuestionService from "../../API/LessonQuestionService";
import AdminPagination from "../../component/AdminPagination";
import LessonQuestionCard from "../../component/LessonQuestionCard";
import { ProductContext } from "../../context/ProductContext";
import ActionButton from "../../shared/components/buttons/ActionButton";
import MetricCard from "../../shared/components/cards/MetricCard";
import TableToolbar from "../../shared/components/table/TableToolbar";
import { loadSwal } from "../../shared/utils/alerts";
import { formatDateTime } from "../../shared/utils/formatters";
import { normalizePagePayload } from "../../utils/pagination";
import useDebouncedValue from "../../utils/useDebouncedValue";
import { qnaStatusOptions } from "./sellerDashboardView";
import { getSellerIdFromSession } from "./sellerSession";

const questionSummary = (questions, totalQuestions) => ({
  total: totalQuestions,
  open: questions.filter((item) => item.status === "OPEN").length,
  answered: questions.filter((item) => item.status === "ANSWERED").length,
  resolved: questions.filter((item) => item.status === "RESOLVED").length,
});

const SellerQnaTab = () => {
  const { session } = useContext(ProductContext);
  const sellerId = getSellerIdFromSession(session);
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replySavingId, setReplySavingId] = useState(null);
  const [resolveSavingId, setResolveSavingId] = useState(null);
  const debouncedKeyword = useDebouncedValue(keyword);

  const replaceQuestion = useCallback((updatedQuestion) => {
    setQuestions((current) => current.map((item) => (
      Number(item.id) === Number(updatedQuestion.id) ? updatedQuestion : item
    )));
  }, []);

  const loadQuestions = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const response = await LessonQuestionService.getSellerQuestions(sellerId, {
        page: page - 1,
        size: pageSize,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        keyword: debouncedKeyword.trim() || undefined,
      });
      const { content, totalElements } = normalizePagePayload(response);
      setQuestions(content);
      setTotalQuestions(totalElements);
    } catch (error) {
      console.error("Unable to load seller Q&A", error);
      setQuestions([]);
      setTotalQuestions(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, page, pageSize, sellerId, statusFilter]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, pageSize, statusFilter]);

  const handleReply = async (questionId) => {
    const content = String(replyDrafts[questionId] || "").trim();
    if (!content || replySavingId) return;
    setReplySavingId(questionId);
    try {
      const response = await LessonQuestionService.replyQuestion(questionId, { content });
      if (response.code !== 200) {
        throw new Error(response.message || "Không thể gửi phản hồi");
      }
      replaceQuestion(response.result);
      setReplyDrafts((current) => ({ ...current, [questionId]: "" }));
    } catch (error) {
      const Swal = await loadSwal();
      await Swal.fire({
        title: "Không thể gửi phản hồi",
        text: error?.response?.data?.message || error.message || "Vui lòng thử lại.",
        icon: "error",
      });
    } finally {
      setReplySavingId(null);
    }
  };

  const handleResolve = async (questionId) => {
    if (resolveSavingId) return;
    setResolveSavingId(questionId);
    try {
      const response = await LessonQuestionService.resolveQuestion(questionId);
      if (response.code !== 200) {
        throw new Error(response.message || "Không thể cập nhật câu hỏi");
      }
      replaceQuestion(response.result);
    } catch (error) {
      const Swal = await loadSwal();
      await Swal.fire({
        title: "Không thể cập nhật câu hỏi",
        text: error?.response?.data?.message || error.message || "Vui lòng thử lại.",
        icon: "error",
      });
    } finally {
      setResolveSavingId(null);
    }
  };

  const summary = useMemo(
    () => questionSummary(questions, totalQuestions),
    [questions, totalQuestions],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard label="Tổng câu hỏi" value={summary.total.toLocaleString("vi-VN")} tone="slate" />
        <MetricCard label="Chưa trả lời" value={summary.open.toLocaleString("vi-VN")} tone="amber" />
        <MetricCard label="Đã trả lời" value={summary.answered.toLocaleString("vi-VN")} tone="blue" />
        <MetricCard label="Đã giải quyết" value={summary.resolved.toLocaleString("vi-VN")} tone="emerald" />
      </div>

      <TableToolbar
        actions={(
          <ActionButton onClick={loadQuestions} icon={<FiRefreshCw />} tone="slate">
            Làm mới
          </ActionButton>
        )}
        filterOptions={qnaStatusOptions}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        onSearchChange={setKeyword}
        searchPlaceholder="Tìm theo khóa học, bài học, học viên hoặc nội dung hỏi đáp..."
        searchValue={keyword}
      />

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Đang tải hỏi đáp...
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Chưa có câu hỏi phù hợp.
          </div>
        ) : questions.map((question, index) => (
          <LessonQuestionCard
            key={question.id}
            question={question}
            indexLabel={(page - 1) * pageSize + index + 1}
            metadata={[
              <>
                Học viên: <strong className="text-slate-700">{question.userName}</strong>
              </>,
              <>
                Khóa: <strong className="text-slate-700">{question.courseName}</strong>
              </>,
              <>
                Bài {question.episodeNumber}: <strong className="text-slate-700">{question.lessonName}</strong>
              </>,
            ]}
            canResolve={question.status !== "RESOLVED"}
            resolving={resolveSavingId === question.id}
            resolveLabel="Đã giải quyết"
            onResolve={() => handleResolve(question.id)}
            replyValue={replyDrafts[question.id] || ""}
            onReplyChange={(value) => setReplyDrafts((current) => ({ ...current, [question.id]: value }))}
            onReply={() => handleReply(question.id)}
            replySaving={replySavingId === question.id}
            replyAsTextarea
            replyPlaceholder="Trả lời học viên trong thread này..."
            replyButtonLabel="Trả lời"
            formatDateTime={formatDateTime}
          />
        ))}
      </div>

      <AdminPagination
        currentPage={page}
        itemLabel="câu hỏi"
        onPageChange={setPage}
        onPageSizeChange={(nextSize) => {
          setPageSize(nextSize);
          setPage(1);
        }}
        pageSize={pageSize}
        totalItems={totalQuestions}
      />
    </div>
  );
};

export default SellerQnaTab;
