export type ProjectWisePLItem = {
  id: string;
  name: string;
  revenue: string;
  expenses: string;
  netProfit: string;
  margin: string;
  status: string;
};

interface ProjectWiseProfitLossProps {
  data?: ProjectWisePLItem[];
}

export default function ProjectWiseProfitLoss({
  data = [],
}: ProjectWiseProfitLossProps) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
          Project-wise Profit &amp; Loss
        </h2>
        <select className="text-xs px-2 py-1 rounded border border-slate-200 bg-white text-slate-700">
          <option>All Projects</option>
        </select>
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
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                  No project profit &amp; loss data available.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-200 bg-white hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {row.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {row.revenue}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {row.expenses}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-emerald-600">
                    {row.netProfit}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {row.margin}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
