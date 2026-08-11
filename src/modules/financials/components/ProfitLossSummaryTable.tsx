import type { ProfitLossSummaryItem } from "../financials.api";

interface ProfitLossSummaryTableProps {
  summaryItems?: ProfitLossSummaryItem[];
  currencyLabel?: string;
}

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val);
};

const formatPct = (pct?: number) => {
  if (pct === undefined || pct === null) return "0.00%";
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
};

export default function ProfitLossSummaryTable({
  summaryItems = [],
  currencyLabel = "All Amounts are in USD",
}: ProfitLossSummaryTableProps) {
  const incomeItems = summaryItems.filter((item) => item.section === "income");
  const expenseItems = summaryItems.filter((item) => item.section === "expenses");
  const profitItems = summaryItems.filter((item) => item.section === "profit");

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
            {/* Income Section */}
            {incomeItems.length > 0 && (
              <>
                <tr className="bg-white">
                  <td className="px-4 py-2 text-sm font-semibold text-emerald-500">
                    Income
                  </td>
                  <td />
                  <td />
                  <td />
                  <td />
                </tr>

                {incomeItems.map((item) => (
                  <tr
                    key={item.particulars}
                    className={item.bold ? "bg-emerald-50" : "bg-white"}
                  >
                    <td
                      className={`px-4 py-2 text-sm ${
                        item.bold
                          ? "font-semibold text-slate-900"
                          : "text-slate-600"
                      } ${item.underline ? "underline" : ""}`}
                    >
                      {item.particulars}
                    </td>
                    <td
                      className={`px-4 py-2 text-sm ${
                        item.bold ? "font-semibold text-slate-900" : "text-slate-600"
                      }`}
                    >
                      {formatCurrency(item.thisPeriod)}
                    </td>
                    <td
                      className={`px-4 py-2 text-sm ${
                        item.bold ? "font-semibold text-slate-900" : "text-slate-600"
                      }`}
                    >
                      {formatCurrency(item.lastPeriod)}
                    </td>
                    <td
                      className={`px-4 py-2 text-sm ${
                        item.bold ? "font-semibold text-slate-900" : "text-slate-600"
                      }`}
                    >
                      {formatCurrency(item.variance.amount)}
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-emerald-500">
                      {formatPct(item.variance.pct)}
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Expense Section */}
            {expenseItems.length > 0 && (
              <>
                <tr className="bg-white">
                  <td className="px-4 py-2 text-sm font-semibold text-rose-500">
                    Expenses
                  </td>
                  <td />
                  <td />
                  <td />
                  <td />
                </tr>

                {expenseItems.map((item) => (
                  <tr
                    key={item.particulars}
                    className={item.bold ? "bg-rose-50/70" : "bg-white"}
                  >
                    <td
                      className={`px-4 py-2 text-sm ${
                        item.bold
                          ? "font-semibold text-slate-900"
                          : "text-slate-600"
                      } ${item.underline ? "underline" : ""}`}
                    >
                      {item.particulars}
                    </td>
                    <td
                      className={`px-4 py-2 text-sm ${
                        item.bold ? "font-semibold text-slate-900" : "text-slate-600"
                      }`}
                    >
                      {formatCurrency(item.thisPeriod)}
                    </td>
                    <td
                      className={`px-4 py-2 text-sm ${
                        item.bold ? "font-semibold text-slate-900" : "text-slate-600"
                      }`}
                    >
                      {formatCurrency(item.lastPeriod)}
                    </td>
                    <td
                      className={`px-4 py-2 text-sm ${
                        item.bold ? "font-semibold text-slate-900" : "text-slate-600"
                      }`}
                    >
                      {formatCurrency(item.variance.amount)}
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-rose-500">
                      {formatPct(item.variance.pct)}
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Profit Section */}
            {profitItems.map((item) => {
              const isNet = item.particulars.toLowerCase().includes("net profit");
              return (
                <tr
                  key={item.particulars}
                  className={isNet ? "bg-blue-50/80" : "bg-emerald-50/70"}
                >
                  <td
                    className={`px-4 py-2 text-sm font-semibold ${
                      isNet ? "text-blue-700" : "text-slate-900"
                    } ${item.underline ? "underline" : ""}`}
                  >
                    {item.particulars}
                  </td>
                  <td className="px-4 py-2 text-sm font-semibold text-slate-900">
                    {formatCurrency(item.thisPeriod)}
                  </td>
                  <td className="px-4 py-2 text-sm font-semibold text-slate-900">
                    {formatCurrency(item.lastPeriod)}
                  </td>
                  <td className="px-4 py-2 text-sm font-semibold text-slate-900">
                    {formatCurrency(item.variance.amount)}
                  </td>
                  <td className="px-4 py-2 text-sm font-semibold text-emerald-500">
                    {formatPct(item.variance.pct)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 text-xs text-slate-500 sm:px-5">
        {currencyLabel}
      </div>
    </div>
  );
}
