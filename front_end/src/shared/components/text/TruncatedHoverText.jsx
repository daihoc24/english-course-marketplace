import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

const TruncatedHoverText = ({ text, fallback = "-", lines = 2, className = "" }) => {
  const displayText = String(text || "").trim() || fallback;
  const anchorRef = useRef(null);
  const tooltipId = useId();
  const [tooltip, setTooltip] = useState(null);

  const hideTooltip = useCallback(() => {
    setTooltip(null);
  }, []);

  const showTooltip = useCallback(() => {
    if (!anchorRef.current || typeof window === "undefined") return;

    const rect = anchorRef.current.getBoundingClientRect();
    const viewportPadding = 16;
    const width = Math.min(520, Math.max(280, rect.width + 160), window.innerWidth - viewportPadding * 2);
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - width / 2, viewportPadding),
      window.innerWidth - width - viewportPadding
    );
    const shouldPlaceAbove = rect.bottom + 140 > window.innerHeight && rect.top > 140;

    setTooltip({
      left,
      top: shouldPlaceAbove ? rect.top - 10 : rect.bottom + 10,
      width,
      placement: shouldPlaceAbove ? "top" : "bottom",
    });
  }, []);

  useEffect(() => {
    if (!tooltip) return undefined;

    window.addEventListener("resize", hideTooltip);
    window.addEventListener("scroll", hideTooltip, true);

    return () => {
      window.removeEventListener("resize", hideTooltip);
      window.removeEventListener("scroll", hideTooltip, true);
    };
  }, [hideTooltip, tooltip]);

  return (
    <>
      <span
        ref={anchorRef}
        className={`block cursor-help break-words transition-colors hover:text-blue-700 focus:outline-none focus-visible:text-blue-700 ${className}`}
        aria-label={displayText}
        aria-describedby={tooltip ? tooltipId : undefined}
        tabIndex={0}
        onBlur={hideTooltip}
        onFocus={showTooltip}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        style={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: lines,
          overflow: "hidden",
        }}
      >
        {displayText}
      </span>
      {tooltip &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            className="pointer-events-none fixed z-[9999] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium leading-5 text-slate-700 shadow-xl shadow-slate-900/15"
            style={{
              left: tooltip.left,
              top: tooltip.top,
              width: tooltip.width,
              transform: tooltip.placement === "top" ? "translateY(-100%)" : undefined,
            }}
          >
            <span
              className={`absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-slate-200 bg-white ${
                tooltip.placement === "top"
                  ? "-bottom-1 border-b border-r"
                  : "-top-1 border-l border-t"
              }`}
            />
            {displayText}
          </div>,
          document.body
        )}
    </>
  );
};

export default TruncatedHoverText;
