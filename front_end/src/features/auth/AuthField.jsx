const baseInputClass =
  "block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

const AuthField = ({
  label,
  name,
  error,
  hint,
  trailing,
  className = "",
  inputClassName = "",
  ...inputProps
}) => {
  const id = inputProps.id || name;
  const stateClass = error ? "border-rose-400" : "border-slate-300";
  const readOnlyClass = inputProps.readOnly ? "bg-blue-50 text-slate-700" : "bg-white";
  const disabledClass = inputProps.disabled ? "disabled:bg-slate-100 disabled:text-slate-500" : "";
  const paddingClass = trailing ? "pr-11" : "";

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          name={name}
          className={`${baseInputClass} ${stateClass} ${readOnlyClass} ${disabledClass} ${paddingClass} ${inputClassName}`}
          {...inputProps}
        />
        {trailing && <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div>}
      </div>
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
    </div>
  );
};

export default AuthField;
