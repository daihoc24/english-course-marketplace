import React, { useCallback, useState, useEffect, useContext, useLayoutEffect, useMemo, useRef } from "react";
import { FiSearch, FiHeart, FiMenu, FiX, FiMic, FiBell, FiUser } from "react-icons/fi";
import { useNavigate, Link, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.jpg";
import { introspect, logOutApi } from "../API/AuthService";
import { NotificationService } from "../API/NotificationService";
import { ProductContext } from '../context/ProductContext';
import { getActiveSession, getSessionRole } from "../utils/session";

const HeaderNotificationMenu = React.lazy(() => import("./HeaderNotificationMenu"));

const Header = () => {
  const {favorites,setSession,session}= useContext(ProductContext);
  const activeSession = useMemo(() => getActiveSession(session), [session]);
  const headerRef = useRef(null);
  const [isToken, setIsToken] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLogin,setIsLogin] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const recognition = useMemo(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return SpeechRecognition ? new SpeechRecognition() : null;
  }, []);

  useEffect(() => {
    if (!recognition) return undefined;

    recognition.continuous = false;
    recognition.lang = "vi-VN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setSearchQuery(text);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort?.();
    };
  }, [recognition]);

  const handleVoiceSearch = () => {
  if (!recognition) {
    alert("Trình duyệt của bạn chưa hỗ trợ tìm kiếm bằng giọng nói");
    return;
  }

  if (isListening) {
    recognition.stop();
    setIsListening(false);
  } else {
    recognition.start();
    setIsListening(true);
  }
  };
  const navigate = useNavigate(); 
  const location = useLocation();
  const isWorkspaceRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/seller/dashboard") ||
    location.pathname.startsWith("/seller/course") ||
    location.pathname.startsWith("/seller/wallet");
  const effectiveCompact = isWorkspaceRoute || isCompact;
  const shouldShowHeaderSearch = !location.pathname.startsWith("/shop") && !isWorkspaceRoute;

  useLayoutEffect(() => {
    if (typeof document === "undefined") return undefined;

    const root = document.documentElement;
    const updateHeaderHeight = () => {
      const height = headerRef.current?.getBoundingClientRect().height || 0;
      root.style.setProperty("--app-header-height", `${Math.ceil(height)}px`);
    };

    updateHeaderHeight();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateHeaderHeight)
        : null;

    if (observer && headerRef.current) {
      observer.observe(headerRef.current);
    }

    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
      root.style.removeProperty("--app-header-height");
    };
  }, []);

  const checkToken = useCallback(async (token) => {
    try {
      const response = await introspect({token});
      return response.data.result.valid;
    } catch (error) {
      console.error("Lỗi kiểm tra token:", error);
      return false;
    }
  }, []);
  useEffect(() => {
    const check = async () => {
      if (activeSession?.token) {
        const isValid = await checkToken(activeSession.token);
        if (isValid) {
          setIsLogin(true);
          setIsToken(activeSession.token);
        } else {
          setIsLogin(false);
          setIsToken("");
        }
      } else {
        setIsLogin(false);
        setIsToken("");
      }
    };
    check();
  }, [activeSession?.token, checkToken]);
  const menuItems = [
    { name: "Trang chủ", link: "/" },
    { name: "Khóa học", link: "/shop" },
    { name: "Giảng viên", link: "/teachers" },
  ];

  const userRole = getSessionRole(activeSession);
  const isAdminUser = userRole === "ADMIN";
  const isSellerUser = userRole === "SELLER";
  if (isAdminUser) {
    menuItems.push({ name: "Quản trị", link: "/admin/dashboard" });
  }
  if (isSellerUser) {
    menuItems.push({ name: "Bảng giảng viên", link: "/seller/dashboard" });
  }
  const adminAccountMenuItems = [
    { label: "Tổng quan", to: "/admin/dashboard" },
    { label: "Duyệt khóa học", to: "/admin/course-approval" },
    { label: "Đơn hàng", to: "/admin/orders" },
    { label: "Hoàn tiền", to: "/admin/refunds" },
    { label: "Chi trả", to: "/admin/withdrawals" },
    { label: "Khiếu nại", to: "/admin/ComplaintManagement" },
    { label: "Người dùng", to: "/admin/UserManagement" },
    { label: "Phân tích", to: "/admin/CourseAnalytics" },
  ];
  const sellerAccountMenuItems = [
    { label: "Hồ sơ cá nhân", to: "/user-info" },
    { label: "Quản lý khóa học", to: "/seller/dashboard" },
    { label: "Hỏi đáp", to: "/seller/dashboard?tab=qna" },
    { label: "Doanh thu", to: "/seller/dashboard?tab=revenue" },
    { label: "Rút tiền", to: "/seller/dashboard?tab=withdraw" },
    { label: "Hoàn tiền", to: "/seller/dashboard?tab=refund" },
    { label: "Khiếu nại", to: "/seller/dashboard?tab=reports" },
  ];
  const learnerAccountMenuItems = [
    { label: "Hồ sơ cá nhân", to: "/user-info" },
    { label: "Khóa học của tôi", to: "/UserHistory" },
    { label: "Khiếu nại của tôi", to: "/my-reports" },
    { label: "Tín dụng & hoàn tiền", to: "/my-refunds" },
  ];
  const accountMenuItems = isAdminUser
    ? adminAccountMenuItems
    : isSellerUser
      ? sellerAccountMenuItems
      : learnerAccountMenuItems;
  const accountMenuLabel = isAdminUser ? "Quản trị" : isSellerUser ? "Khu vực người bán" : "Tài khoản";
  const shouldShowFavoriteShortcut = !isAdminUser;

  useEffect(() => {
    if (isWorkspaceRoute) {
      setIsCompact(false);
      return undefined;
    }

    let animationFrameId = null;
    const handleScroll = () => {
      if (animationFrameId) return;
      animationFrameId = window.requestAnimationFrame(() => {
        setIsCompact((current) => {
          if (!current && window.scrollY > 120) return true;
          if (current && window.scrollY < 32) return false;
          return current;
        });
        animationFrameId = null;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [isWorkspaceRoute]);

  const formatNotificationTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return "Vừa xong";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const loadNotifications = useCallback(async () => {
    if (!isLogin || !isToken) {
      setNotifications([]);
      setNotificationCount(0);
      return;
    }
    try {
      setNotificationLoading(true);
      const response = await NotificationService.getMine(0, 8);
      const result = response.data?.result;
      setNotifications(result?.notifications?.content ?? []);
      setNotificationCount(result?.unreadCount ?? 0);
    } catch (error) {
      console.warn("Không thể tải thông báo:", error);
    } finally {
      setNotificationLoading(false);
    }
  }, [isLogin, isToken]);

  useEffect(() => {
    loadNotifications();
    if (!isLogin || !isToken) return undefined;
    const intervalId = window.setInterval(loadNotifications, 30000);
    const refreshHandler = () => loadNotifications();
    window.addEventListener("notification:refresh", refreshHandler);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("notification:refresh", refreshHandler);
    };
  }, [isLogin, isToken, loadNotifications]);

  useEffect(() => {
    if (!isLogin || !isToken || typeof EventSource === "undefined") return undefined;

    let reconnectTimer = null;
    const source = new EventSource(NotificationService.streamUrl(isToken));

    source.addEventListener("notification", (event) => {
      try {
        const notification = JSON.parse(event.data);
        setNotifications((items) => {
          if (items.some((item) => item.id === notification.id)) return items;
          return [notification, ...items].slice(0, 8);
        });
        if (!notification.read) {
          setNotificationCount((count) => count + 1);
        }
        window.dispatchEvent(new CustomEvent("notification:new", { detail: notification }));
      } catch (error) {
        console.warn("Không thể đọc thông báo realtime:", error);
      }
    });

    source.onerror = () => {
      reconnectTimer = window.setTimeout(loadNotifications, 1500);
    };

    return () => {
      source.close();
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
    };
  }, [isLogin, isToken, loadNotifications]);

  const handleNotificationToggle = () => {
    if (!activeSession?.token) {
      navigate("/auth/login");
      return;
    }
    setIsNotificationOpen((open) => !open);
    if (!isNotificationOpen) loadNotifications();
  };

  const handleNotificationClick = async (notification) => {
    let targetUrl = notification.targetUrl;
    if (targetUrl?.startsWith("/detail/") && targetUrl.includes("reportId=")) {
      try {
        const parsed = new URL(targetUrl, window.location.origin);
        const courseId = parsed.pathname.split("/").filter(Boolean).pop();
        const reportId = parsed.searchParams.get("reportId");
        if (courseId && reportId) {
          targetUrl = `/my-reports?courseId=${encodeURIComponent(courseId)}&reportId=${encodeURIComponent(reportId)}`;
        } else if (!targetUrl.includes("#my-reports")) {
          targetUrl = `${targetUrl}#my-reports`;
        }
      } catch {
        if (!targetUrl.includes("#my-reports")) {
          targetUrl = `${targetUrl}#my-reports`;
        }
      }
    }

    try {
      if (!notification.read) {
        await NotificationService.markAsRead(notification.id);
        setNotificationCount((count) => Math.max(0, count - 1));
      }
    } catch (error) {
      console.warn("Không thể đánh dấu đã đọc:", error);
    } finally {
      setIsNotificationOpen(false);
      if (targetUrl) {
        navigate(targetUrl);
        window.setTimeout(() => {
          window.dispatchEvent(new CustomEvent("notification:navigate", { detail: { targetUrl } }));
        }, 80);
      }
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
      setNotificationCount(0);
    } catch (error) {
      console.warn("Không thể đánh dấu tất cả thông báo:", error);
    }
  };



  return (
     <header ref={headerRef} className={`sticky top-0 z-50 bg-gray-900 transition-all duration-300 ${effectiveCompact ? "shadow-2xl shadow-slate-950/25" : "shadow-md"}`}>
      <nav className={`bg-gray-900 transition-all duration-300 ${effectiveCompact ? "py-2" : "py-4"}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className={`transition-all duration-300 ${effectiveCompact ? "w-36" : "w-48"}`}>
              <Link to="/">
                <img 
                  src={logo}
                  alt="Logo" 
                  className={`w-auto object-contain cursor-pointer transition-all duration-300 ${effectiveCompact ? "h-10" : "h-14"}`}
                  style={{ maxWidth: '200px' }}
                />
              </Link>
            </div>

            <div className={`hidden lg:flex items-center transition-all duration-300 ${effectiveCompact ? "space-x-6 text-[15px]" : "space-x-8 text-base"}`}>
              <Link to="/" className="text-gray-300 hover:text-blue-400 flex items-center">Trang chủ</Link>
              
              

              {menuItems.slice(1).map((item, index) => (
                <Link
                  key={index}
                  to={item.link}
                  className="text-gray-300 hover:text-blue-400 flex items-center"
                >
                  {item.name}
                </Link>
              ))}
              {shouldShowHeaderSearch && (
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
                      }
                    }}
                    placeholder="Tìm khóa học..."
                    className={`rounded-full bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:border-blue-500 transition-all duration-300 ${effectiveCompact ? "w-52 px-4 py-1.5 pl-10" : "w-60 px-4 py-2 pl-10"}`}
                  />
                  <FiSearch
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 cursor-pointer"
                    onClick={() => {
                      if (searchQuery.trim()) {
                        navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
                      } else {
                        navigate('/shop');
                      }
                    }}
                  />
                  <button onClick={handleVoiceSearch}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${isListening ? "text-red-500" : "text-gray-400"} hover:bg-gray-800`}
                  >
                    <FiMic className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className={`flex items-center transition-all duration-300 ${effectiveCompact ? "space-x-4" : "space-x-6"}`}>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleNotificationToggle}
                    className="relative flex items-center justify-center"
                    aria-label="Thông báo"
                  >
                    <FiBell className={`${effectiveCompact ? "text-xl" : "text-2xl"} text-gray-300 hover:text-blue-400 cursor-pointer transition-all duration-300`} />
                  </button>
                  {notificationCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                  {isNotificationOpen && (
                    <React.Suspense fallback={null}>
                      <HeaderNotificationMenu
                        formatNotificationTime={formatNotificationTime}
                        notificationCount={notificationCount}
                        notificationLoading={notificationLoading}
                        notifications={notifications}
                        onMarkAllRead={handleMarkAllNotificationsRead}
                        onNotificationClick={handleNotificationClick}
                        onViewAll={() => {
                          setIsNotificationOpen(false);
                          navigate("/notifications");
                        }}
                      />
                    </React.Suspense>
                  )}
                </div>
                {shouldShowFavoriteShortcut && (
                  <div className="relative">
                    <FiHeart
                        className={`${effectiveCompact ? "text-xl" : "text-2xl"} text-gray-300 hover:text-blue-400 cursor-pointer transition-all duration-300`}
                        onClick={() => navigate('/favorites')}
                    />
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {favorites.length}
                    </span>
                  </div>
                )}

                <div className="relative group">
                  <div className={`${effectiveCompact ? "w-9 h-9" : "w-10 h-10"} rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-all duration-300`}
                  onClick={()=> {activeSession?.token ? setIsOpen(!isOpen) : navigate('/auth/login');}}
                  >
                    <FiUser className="text-xl text-gray-300" />
                  </div>
                  {isOpen && (
                    <div className="absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 py-2 shadow-2xl shadow-slate-950/30">
                      <div className="border-b border-slate-800 px-4 pb-3 pt-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
                          {accountMenuLabel}
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-white">
                          {activeSession?.currentUser?.fullname || activeSession?.currentUser?.username || "Người dùng"}
                        </p>
                      </div>
                      {accountMenuItems.map((item) => (
                        <Link
                          key={item.to + item.label}
                          to={item.to}
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-2.5 text-sm text-slate-200 transition hover:bg-slate-800 hover:text-white"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            if (isToken) await logOutApi({ token: isToken });
                          } catch (error) {
                            console.warn("Không thể thông báo logout cho máy chủ:", error);
                          } finally {
                            localStorage.removeItem("session");
                            window.dispatchEvent(new Event("sessionUpdated"));
                            setSession(null);
                            setIsToken("");
                            setIsLogin(false);
                            setIsOpen(false);
                            navigate("/auth/login", { replace: true });
                          }
                        }}
                        className="mt-1 block w-full border-t border-slate-800 px-4 py-2.5 text-left text-sm text-slate-200 transition hover:bg-slate-800 hover:text-white"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                className="lg:hidden text-gray-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute top-0 right-0 w-64 h-full bg-gray-900 shadow-lg py-4 px-6">
              <div className="flex justify-end">
                <button onClick={() => setIsMenuOpen(false)}>
                  <FiX size={24} className="text-gray-300" />
                </button>
              </div>
              <div className="mt-8 space-y-4">
                {menuItems.map((item, index) => (
                  <div key={index}>
                    <Link
                      to={item.link}
                      className="block text-gray-300 hover:text-blue-400 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
