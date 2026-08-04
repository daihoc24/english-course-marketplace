import { Children } from "react";

const defaultHeaderClass = "p-4";

export default function DataTable({
  children,
  columns,
  colWidths = [],
  emptyMessage = "Không có dữ liệu.",
  loading = false,
  loadingMessage = "Đang tải...",
  minWidth = 960,
}) {
  const colSpan = columns.length;
  const hasRows = Children.count(children) > 0;
  const tableMinWidth = typeof minWidth === "number" ? `${minWidth}px` : minWidth;

  return (
    <div className="overflow-x-auto">
      <table className="table-fixed text-sm" style={{ minWidth: tableMinWidth }}>
        {colWidths.length > 0 && (
          <colgroup>
            {colWidths.map((width, index) => (
              <col key={`${width}-${index}`} style={{ width }} />
            ))}
          </colgroup>
        )}
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((column) => {
              const normalized = typeof column === "string" ? { label: column } : column;
              return (
                <th key={normalized.key || normalized.label} className={normalized.className || defaultHeaderClass}>
                  {normalized.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={colSpan} className="p-8 text-center text-slate-500">
                {loadingMessage}
              </td>
            </tr>
          ) : hasRows ? (
            children
          ) : (
            <tr>
              <td colSpan={colSpan} className="p-8 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
