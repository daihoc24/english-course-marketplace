import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (hash || params.has("reportId")) return;

    const scrollTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0;
      }
    };

    scrollTop();
    const frameId = window.requestAnimationFrame(scrollTop);

    return () => window.cancelAnimationFrame(frameId);
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
