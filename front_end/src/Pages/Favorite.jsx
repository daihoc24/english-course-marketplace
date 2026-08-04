import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import { ProductContext } from "../context/ProductContext";
import ProductCard from "../component/ProductCard";

const Favorite = () => {
  const { favorites } = useContext(ProductContext);
  const totalFavorites = favorites.length;

  return (
    <main className="min-h-[62vh] bg-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:py-12">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-600">
              <Heart className="h-4 w-4 fill-current" />
              {totalFavorites} khóa học đã lưu
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Danh sách yêu thích
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Những khóa học bạn đã lưu để xem lại hoặc mua sau.
            </p>
          </div>

          {totalFavorites > 0 && (
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
            >
              <Search className="h-4 w-4" />
              Tìm thêm khóa học
            </Link>
          )}
        </div>

        {totalFavorites === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <Heart className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Chưa có khóa học yêu thích
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Bấm biểu tượng trái tim ở khóa học bạn quan tâm để lưu vào đây.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
              Khám phá khóa học
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Favorite;
