import { FiArrowRight, FiHeart } from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../context/ProductContext";
import { formatVND } from "../utils/formatVND";
import { getActiveSession } from "../utils/session";
import { COURSE_DEFAULT_IMAGES } from "../utils/courseImages";

const renderStars = (rating) => {
  const displayRating = rating != null ? Math.round(rating) : 0;
  return (
    <div className="flex">
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          className={`h-4 w-4 fill-current ${index < displayRating ? "text-yellow-400" : "text-gray-600"}`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09L5.4 12.18.4 7.91l6.09-.89L10 2l2.51 5.02 6.09.89-4.999 4.27 1.279 5.91z" />
        </svg>
      ))}
    </div>
  );
};

const formatDuration = (totalMinutes) => {
  if (totalMinutes == null || totalMinutes === 0) return "";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours} giờ ${minutes} phút`;
  if (hours > 0) return `${hours} giờ`;
  return `${minutes} phút`;
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isInFavorites, toggleFavorite: contextToggleFavorite, session, purchasedCourseIds } = useProduct();
  const activeSession = getActiveSession(session);

  const isPurchased = purchasedCourseIds.has(product.id);
  const isLoggedIn = Boolean(activeSession?.currentUser);
  const isFavorited = isInFavorites(product.id);
  const fallbackIndex = Math.abs(Number(product.id) || 0) % COURSE_DEFAULT_IMAGES.length;
  const fallbackImage = COURSE_DEFAULT_IMAGES[fallbackIndex];
  const durationLabel = formatDuration(product.totalDuration);
  const hasMeta = product.episodeCount != null || durationLabel || product.studentCount != null;

  const handleOpenDetail = () => {
    navigate(`/detail/${product.id}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenDetail();
    }
  };

  const handleButtonClick = (event) => {
    event.stopPropagation();
    handleOpenDetail();
  };

  const handleToggleFavorite = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn) {
      toast.info("Vui lòng đăng nhập để thêm vào yêu thích.");
      return;
    }

    try {
      await contextToggleFavorite(product.id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật yêu thích.");
    }
  };

  return (
    <article
      className="group relative flex h-full min-h-[430px] cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-700 bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg transition-all duration-300 hover:border-blue-500/60 hover:shadow-2xl"
      onClick={handleOpenDetail}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-slate-800">
        <img
          src={product.image || fallbackImage}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950/45 via-slate-950/15 to-transparent" />

        {isLoggedIn && isPurchased && (
          <div
            className="absolute left-3 top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow"
            data-testid="purchased-badge"
          >
            Đã mua
          </div>
        )}

        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isFavorited ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
          className="absolute right-3 top-3 rounded-full bg-slate-950/60 p-2 text-white backdrop-blur transition hover:bg-slate-950/80"
          data-testid="favorite-button"
        >
          <FiHeart className={`h-5 w-5 ${isFavorited ? "fill-current text-red-500" : "text-white"}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5 text-white">
        <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-semibold leading-7">{product.name}</h3>

        <p className="mt-2 flex min-h-6 items-center text-gray-300">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
          <span className="line-clamp-1">{product.sellerName || "Nền tảng"}</span>
        </p>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-gray-400">
          {product.description || "Khóa học đang được công khai trên hệ thống."}
        </p>

        <p className="mt-3 min-h-5 text-sm text-gray-400">
          {hasMeta && (
            <>
              {product.episodeCount != null && <span>{product.episodeCount} bài</span>}
              {product.episodeCount != null && durationLabel && <span> · </span>}
              {durationLabel && <span>{durationLabel}</span>}
              {(product.episodeCount != null || durationLabel) && product.studentCount != null && <span> · </span>}
              {product.studentCount != null && <span>{Number(product.studentCount).toLocaleString("vi-VN")} người mua</span>}
            </>
          )}
        </p>

        <div className="mt-3 flex min-h-5 items-center justify-between gap-3">
          <div className="flex items-center">
            {renderStars(product.rating)}
            {product.rating != null && <span className="ml-2 text-sm text-gray-400">({product.rating.toFixed(1)})</span>}
          </div>
        </div>

        <div className="mt-auto flex min-h-10 items-center justify-between gap-3 pt-4">
          <p className="min-w-0 truncate font-bold text-red-400" data-testid="price-display">
            {isLoggedIn && isPurchased ? "Đã sở hữu" : formatVND(product.price)}
          </p>

          <button
            type="button"
            onClick={handleButtonClick}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            {isLoggedIn && isPurchased ? "Vào học" : "Xem chi tiết"}
            <FiArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
