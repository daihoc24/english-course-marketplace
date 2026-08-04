const AuthFeedbackBox = ({ feedback, children }) => {
  if (!feedback) return null;

  const toneClass =
    feedback.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${toneClass}`} role="status">
      <p>{feedback.message}</p>
      {children}
    </div>
  );
};

export default AuthFeedbackBox;
