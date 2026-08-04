import { getPasswordStrengthMeta, passwordRules } from "./authView";

const PasswordStrength = ({ password }) => {
  const meta = getPasswordStrengthMeta(password);

  return (
    <div className="mt-2 space-y-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full transition-all duration-300 ${meta.colorClass}`} style={{ width: `${meta.percent}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{meta.label}</span>
        <span>
          {meta.strength}/{passwordRules.length} điều kiện
        </span>
      </div>
    </div>
  );
};

export default PasswordStrength;
