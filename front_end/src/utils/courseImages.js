const buildCoursePlaceholder = (title, from, to) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${from}"/>
          <stop offset="100%" stop-color="${to}"/>
        </linearGradient>
        <radialGradient id="glow" cx="72%" cy="28%" r="58%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.45)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>
      <rect width="900" height="520" rx="34" fill="url(#bg)"/>
      <rect width="900" height="520" rx="34" fill="url(#glow)"/>
      <circle cx="720" cy="110" r="86" fill="rgba(255,255,255,0.16)"/>
      <circle cx="790" cy="190" r="42" fill="rgba(255,255,255,0.12)"/>
      <path d="M96 354 C184 304 248 402 330 340 C400 286 478 306 546 260 C628 204 694 238 782 184" fill="none" stroke="rgba(255,255,255,0.24)" stroke-width="18" stroke-linecap="round"/>
      <text x="76" y="120" fill="white" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="800">${title}</text>
      <text x="78" y="176" fill="rgba(255,255,255,0.78)" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500">English Academy</text>
      <rect x="76" y="390" width="210" height="54" rx="27" fill="rgba(255,255,255,0.16)"/>
      <text x="108" y="425" fill="white" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700">Online course</text>
    </svg>
  `)}`;

export const COURSE_DEFAULT_IMAGES = [
  buildCoursePlaceholder("IELTS Mastery", "#1e3a8a", "#2563eb"),
  buildCoursePlaceholder("TOEIC Practice", "#0f172a", "#0891b2"),
  buildCoursePlaceholder("Grammar Bootcamp", "#312e81", "#7c3aed"),
  buildCoursePlaceholder("Speaking Skills", "#14532d", "#10b981"),
];
