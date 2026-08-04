import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axiosClient from "../API/axiosClient";
import SellerCredentialsPanel from "../features/seller/SellerCredentialsPanel";
import SellerIntroContactSection from "../features/seller/SellerIntroContactSection";
import SellerProfileHero from "../features/seller/SellerProfileHero";
import {
  SellerCoursesFallback,
  SellerDetailErrorState,
  SellerDetailLoadingState,
} from "../features/seller/SellerDetailStates";
import {
  getSellerDetailStats,
  getSellerIntro,
  getVisibleIntro,
} from "../features/seller/sellerDetailView";
import { parseCertificateEntries } from "../utils/certificates";

const SellerPublicCoursesGrid = lazy(() => import("../features/seller/SellerPublicCoursesGrid"));

const SellerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [sellerCourses, setSellerCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullIntro, setShowFullIntro] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!id) {
        setError("Thiếu mã người bán.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [sellerResponse, coursesResponse] = await Promise.all([
          axiosClient.get(`/users/id/${id}`),
          axiosClient.get(`/seller/${id}/courses`).catch(() => null),
        ]);
        const sellerPayload = sellerResponse.data?.result ?? sellerResponse.data;
        if (!sellerPayload?.id) throw new Error("Không tìm thấy người bán.");
        setSeller(sellerPayload);
        setSellerCourses(coursesResponse?.data?.result || []);
      } catch (err) {
        console.error("Failed to load seller detail:", err);
        setError(err.response?.data?.message || err.message || "Không thể tải thông tin người bán.");
      } finally {
        setLoading(false);
      }
    };

    void fetchSellerData();
  }, [id]);

  const certificates = useMemo(() => parseCertificateEntries(seller?.certificate), [seller?.certificate]);
  const stats = useMemo(() => getSellerDetailStats(sellerCourses), [sellerCourses]);
  const intro = useMemo(() => getSellerIntro(seller), [seller]);
  const shownIntro = useMemo(() => getVisibleIntro(intro, showFullIntro), [intro, showFullIntro]);

  if (loading) return <SellerDetailLoadingState />;
  if (error || !seller) return <SellerDetailErrorState error={error} onBack={() => navigate(-1)} />;

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <SellerProfileHero certificatesCount={certificates.length} seller={seller} stats={stats} />
          <SellerIntroContactSection
            intro={intro}
            seller={seller}
            showFullIntro={showFullIntro}
            shownIntro={shownIntro}
            onToggleIntro={() => setShowFullIntro((value) => !value)}
          />
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-10">
          <div className="border-b border-slate-200">
            <nav className="flex gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("about")}
                className={`border-b-2 px-1 pb-4 text-sm font-bold ${
                  activeTab === "about"
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Năng lực
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("courses")}
                className={`border-b-2 px-1 pb-4 text-sm font-bold ${
                  activeTab === "courses"
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Khóa học ({stats.totalCourses})
              </button>
            </nav>
          </div>

          {activeTab === "about" ? (
            <SellerCredentialsPanel certificates={certificates} stats={stats} />
          ) : (
            <div className="mt-8">
              <Suspense fallback={<SellerCoursesFallback />}>
                <SellerPublicCoursesGrid
                  courses={sellerCourses}
                  onSelectCourse={(courseId) => navigate(`/detail/${courseId}`)}
                />
              </Suspense>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default SellerDetail;
