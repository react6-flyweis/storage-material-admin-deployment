import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useProjectProfitLossQuery } from "../financials.hooks";
import type { ProjectProfitLossItem } from "../financials.api";

export type ProjectWisePLItem = ProjectProfitLossItem;

interface ProjectWiseProfitLossProps {
  data?: ProjectWisePLItem[];
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val);
};

export default function ProjectWiseProfitLoss({
  data: initialData,
}: ProjectWiseProfitLossProps) {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: response, isLoading, isError, error } = useProjectProfitLossQuery({
    page,
    limit,
  });

  const apiProjects = response?.data?.projects;
  const total = response?.data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const projects = apiProjects ?? initialData ?? [];

  return (
    <div className="rounded-2xl border border-white/80 bg-white shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
          Project-wise Profit &amp; Loss
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-245 w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[12px] font-semibold text-slate-700 border-b border-slate-200">
              <th className="px-4 py-3 text-left">Project ID</th>
              <th className="px-4 py-3 text-left">Project Name</th>
              <th className="px-4 py-3 text-left">Revenue</th>
              <th className="px-4 py-3 text-left">Total Expenses</th>
              <th className="px-4 py-3 text-left">Net Profit</th>
              <th className="px-4 py-3 text-left">Net Profit Margin</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span>Loading project profit &amp; loss...</span>
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-rose-600">
                  Failed to load project P&amp;L: {error instanceof Error ? error.message : "Unknown error"}
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                  No project profit &amp; loss data available.
                </td>
              </tr>
            ) : (
              projects.map((row) => (
                <tr
                  key={row.projectId}
                  className="border-b border-slate-200 bg-white hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {row.projectId}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {row.projectName || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatCurrency(row.revenue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatCurrency(row.totalExpenses)}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm font-medium ${row.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                  >
                    {formatCurrency(row.netProfit)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {row.netProfitMargin.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.status?.toLowerCase().includes("unprofitable") || row.netProfit < 0
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                        }`}
                    >
                      {row.status || (row.netProfit >= 0 ? "Profitable" : "Unprofitable")}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > limit && (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-5">
          <div className="text-xs text-slate-500">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="rounded border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="rounded border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
