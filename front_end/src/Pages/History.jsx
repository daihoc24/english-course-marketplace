import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import axiosClient from '../API/axiosClient';
import CourseHistoryCard from '../features/orders/CourseHistoryCard';

const PAGE_SIZE = 9;

const normalizeStatus = (status) => {
  if (status === 'PAID') return 'completed';
  if (status === 'PENDING') return 'pending';
  if (status === 'REFUNDED') return 'refunded';
  return status || 'completed';
};

const mapCourse = (item) => ({
  id: item.orderId,
  id_course: item.courseId,
  status: normalizeStatus(item.status),
  courseName: item.courseName || 'Khóa học',
  courseImage: item.courseImage || null,
  instructor: item.sellerName || 'Giảng viên',
  rating: item.rating ?? 0,
  progress: item.progressPercent || 0,
  completedLessons: item.completedLessons || 0,
  totalLessons: item.totalLessons || 0,
  price: item.pricePaid ?? 0,
  refundEligibleUntil: item.refundEligibleUntil,
  description: item.description || '',
});

const UserOrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    totalPages: 0,
    totalElements: 0,
    last: true,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const fetchMyCourses = useCallback(async ({ page = 0, append = false } = {}) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await axiosClient.get('/order/my-courses', {
        params: {
          page,
          size: PAGE_SIZE,
          status: statusFilter,
          keyword: debouncedSearch || undefined,
        },
      });
      const result = response.data?.result;
      const content = Array.isArray(result?.content) ? result.content.map(mapCourse) : [];

      setOrders((current) => (append ? [...current, ...content] : content));
      setPageInfo({
        number: result?.number ?? page,
        totalPages: result?.totalPages ?? 0,
        totalElements: result?.totalElements ?? content.length,
        last: result?.last ?? true,
      });
    } catch (error) {
      console.error('Error fetching my courses:', error);
      const message = error.response?.data?.message || 'Không thể tải danh sách khóa học của bạn.';
      setError(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchMyCourses({ page: 0, append: false });
  }, [fetchMyCourses]);

  const handleRefresh = () => {
    fetchMyCourses({ page: 0, append: false });
  };

  const handleLoadMore = () => {
    if (loadingMore || pageInfo.last) return;
    fetchMyCourses({ page: pageInfo.number + 1, append: true });
  };

  const handleStartLearning = (courseId) => {
    if (courseId == null) return;
    navigate(`/course-video/${courseId}`);
  };

  const handleRefundRequest = async (order) => {
    const { requestOrderRefund } = await import('../features/orders/requestOrderRefund');
    const submitted = await requestOrderRefund(order.id);
    if (submitted) {
      await fetchMyCourses({ page: 0, append: false });
    }
  };

  const stats = useMemo(() => {
    const completed = orders.filter((order) => order.status === 'completed');
    const averageProgress = completed.length
      ? Math.round(completed.reduce((sum, order) => sum + order.progress, 0) / completed.length)
      : 0;
    return {
      loaded: orders.length,
      total: pageInfo.totalElements,
      canLearn: completed.length,
      averageProgress,
      totalLessons: orders.reduce((sum, order) => sum + (order.totalLessons || 0), 0),
    };
  }, [orders, pageInfo.totalElements]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 bg-slate-50 min-h-screen">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Đang tải khóa học của bạn...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 bg-slate-50 min-h-screen">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Có lỗi xảy ra</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-950 mb-2">Khóa học của tôi</h1>
              <p className="text-slate-600">
                Quản lý và tiếp tục học các khóa học bạn đã mua.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="lg:w-52">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả khóa học</option>
              <option value="completed">Đã mua</option>
              <option value="pending">Đang xử lý</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Danh sách khóa học</h2>
          <p className="text-sm text-slate-500">
            Đang hiển thị {stats.loaded}/{stats.total} khóa học phù hợp.
          </p>
        </div>
        {!pageInfo.last && (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? 'Đang tải thêm...' : 'Xem thêm khóa học'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length > 0 ? (
          orders.map((order) => (
            <CourseHistoryCard
              key={order.id}
              order={order}
              onRefundRequest={handleRefundRequest}
              onStartLearning={handleStartLearning}
            />
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-950 mb-2">Không tìm thấy khóa học</h3>
            <p className="text-slate-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Thử thay đổi bộ lọc để xem các khóa học khác.'
                : 'Bạn chưa mua khóa học nào. Hãy khám phá các khóa học phù hợp với mình.'}
            </p>
          </div>
        )}
      </div>

      {orders.length > 0 && (
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-950">Thống kê học tập</h3>
            <span className="text-xs text-slate-500">
              Tính trên {stats.loaded} khóa học đang hiển thị
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-slate-600">Tổng khóa học</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">{stats.canLearn}</div>
              <div className="text-sm text-slate-600">Có thể học</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.averageProgress}%</div>
              <div className="text-sm text-slate-600">Tiến độ trung bình</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.totalLessons}</div>
              <div className="text-sm text-slate-600">Bài học đã tải</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrderHistory;


