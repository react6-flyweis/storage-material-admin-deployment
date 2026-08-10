export type SummaryRow = {
  label: string;
  thisPeriod: string;
  lastPeriod: string;
  varianceAmount: string;
  variancePercent: string;
  tone?: "income" | "expense" | "total";
};

export type SummaryTotalsRow = {
  label: string;
  thisPeriod: string;
  lastPeriod: string;
  varianceAmount: string;
  variancePercent: string;
  rowTone: "expense-total" | "gross-profit" | "net-profit";
};

interface ProfitLossSummaryTableProps {
  incomeRows: SummaryRow[];
  expenseRows: SummaryRow[];
  totalExpensesRow: SummaryTotalsRow;
  grossProfitRow: SummaryTotalsRow;
  netProfitRow: SummaryTotalsRow;
  currencyLabel?: string;
}

export default function ProfitLossSummaryTable({
  incomeRows,
  expenseRows,
  totalExpensesRow,
  grossProfitRow,
  netProfitRow,
  currencyLabel = "All Amounts are in USD",
}: ProfitLossSummaryTableProps) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
          Profit &amp; Loss Summary
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-245 w-full border-collapse">
          <thead>
            <tr className="bg-slate-200 text-[12px] font-semibold text-slate-700">
              <th className="px-4 py-3 text-left">Particulars</th>
              <th className="px-4 py-3 text-left">
                This Period
                <br />
                <span className="font-normal text-slate-600">
                  (This Month)
                </span>
              </th>
              <th className="px-4 py-3 text-left">
                Last Period
                <br />
                <span className="font-normal text-slate-600">
                  (Last Month)
                </span>
              </th>
              <th className="px-4 py-3 text-left">Variance</th>
              <th className="px-4 py-3 text-left">%</th>
            </tr>
          </thead>

          <tbody>
            <tr className="bg-white">
              <td className="px-4 py-2 text-sm font-semibold text-emerald-500">
                Income
              </td>
              <td />
              <td />
              <td />
              <td />
            </tr>

            {incomeRows.map((row) => (
              <tr
                key={row.label}
                className={
                  row.tone === "total" ? "bg-emerald-50" : "bg-white"
                }
              >
                <td
                  className={`px-4 py-2 text-sm ${
                    row.tone === "total"
                      ? "font-semibold text-slate-900"
                      : "text-slate-600"
                  }`}
                >
                  {row.label}
                </td>
                <td className="px-4 py-2 text-sm text-slate-600">
                  {row.thisPeriod}
                </td>
                <td className="px-4 py-2 text-sm text-slate-600">
                  {row.lastPeriod}
                </td>
                <td className="px-4 py-2 text-sm text-slate-600">
                  {row.varianceAmount}
                </td>
                <td className="px-4 py-2 text-sm font-semibold text-emerald-500">
                  {row.variancePercent}
                </td>
              </tr>
            ))}

            <tr className="bg-white">
              <td className="px-4 py-2 text-sm font-semibold text-rose-500">
                Expenses
              </td>
              <td />
              <td />
              <td />
              <td />
            </tr>

            {expenseRows.map((row) => (
              <tr key={row.label} className="bg-white">
                <td className="px-4 py-2 text-sm text-slate-600">
                  {row.label}
                </td>
                <td className="px-4 py-2 text-sm text-slate-600">
                  {row.thisPeriod}
                </td>
                <td className="px-4 py-2 text-sm text-slate-600">
                  {row.lastPeriod}
                </td>
                <td className="px-4 py-2 text-sm text-slate-600">
                  {row.varianceAmount}
                </td>
                <td className="px-4 py-2 text-sm font-semibold text-rose-500">
                  {row.variancePercent}
                </td>
              </tr>
            ))}

            <tr className="bg-rose-50/70">
              <td className="px-4 py-2 text-sm font-semibold text-slate-900">
                {totalExpensesRow.label}
              </td>
              <td className="px-4 py-2 text-sm font-semibold text-slate-900">
                {totalExpensesRow.thisPeriod}
              </td>
              <td className="px-4 py-2 text-sm font-semibold text-slate-900">
                {totalExpensesRow.lastPeriod}
              </td>
              <td className="px-4 py-2 text-sm font-semibold text-slate-900">
                {totalExpensesRow.varianceAmount}
              </td>
              <td className="px-4 py-2 text-sm font-semibold text-rose-500">
                {totalExpensesRow.variancePercent}
              </td>
            </tr>

            <tr className="bg-emerald-50/70">
              <td className="px-4 py-2 text-sm font-semibold text-slate-900">
                {grossProfitRow.label}
              </td>
              <td className="px-4 py-2 text-sm font-semibold text-slate-900">
                {grossProfitRow.thisPeriod}
              </td>
              <td className="px-4 py-2 text-sm font-semibold text-slate-900">
                {grossProfitRow.lastPeriod}
              </td>
              <td className="px-4 py-2 text-sm font-semibold text-slate-900">
                {grossProfitRow.varianceAmount}
              </td>
              <td className="px-4 py-2 text-sm font-semibold text-emerald-500">
                {grossProfitRow.variancePercent}
              </td>
            </tr>

            <tr className="bg-blue-50/80">
              <td className="px-4 py-2 text-sm font-semibold text-blue-700">
                {netProfitRow.label}
              </td>
              <td className="px-4 py-2 text-sm font-semibold text-slate-900">
                {netProfitRow.thisPeriod}
              </td>
              <td className="px-4 py-2 text-sm font-semibold text-slate-900">
                {netProfitRow.lastPeriod}
              </td>
              <td className="px-4 py-2 text-sm font-semibold text-slate-900">
                {netProfitRow.varianceAmount}
              </td>
              <td className="px-4 py-2 text-sm font-semibold text-emerald-500">
                {netProfitRow.variancePercent}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 text-xs text-slate-500 sm:px-5">
        {currencyLabel}
      </div>
    </div>
  );
}
