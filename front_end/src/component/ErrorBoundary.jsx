import React from "react";

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Không ghi session, token hoặc dữ liệu người dùng vào log.
    console.error("Application render error", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <section className="max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <p className="text-sm font-semibold text-blue-600">Course Marketplace</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Đã có lỗi không mong muốn</h1>
          <p className="mt-3 text-slate-600">Bạn có thể tải lại trang để tiếp tục sử dụng.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
          >
            Tải lại trang
          </button>
        </section>
      </main>
    );
  }
}
