import { Search } from "lucide-react";

export default function TableToolbar({
  actions,
  filterOptions = [],
  filterValue,
  filters,
  onFilterChange,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  searchValue,
}) {
  const activeFilters = filters || (
    filterOptions.length > 0
      ? [{ options: filterOptions, value: filterValue, onChange: onFilterChange }]
      : []
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          />
        </div>

        {activeFilters.map((filter, index) => (
          <select
            key={filter.key || index}
            value={filter.value}
            onChange={(event) => filter.onChange(event.target.value)}
            className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 ${filter.className || "lg:w-56"}`}
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}

        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </section>
  );
}
