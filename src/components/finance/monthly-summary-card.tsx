const monthlySummaryData = {
  month: "Jan 2026",
  expenses: [
    { label: "Total Expenses", value: "$1,793.12" },
    { label: "Vendor/Freight", value: "$1,793.12" },
    { label: "Operations", value: "$1,793.12" },
    { label: "Miscellaneous", value: "$1,793.12" },
    { label: "Salaries", value: "$1,793.12" },
    { label: "Marketing", value: "$18$1,793.12" },
  ],
};

export function MonthlySummaryCard() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900">Monthly Summary</h3>
        <p className="mt-1 text-sm font-medium text-slate-600">
          {monthlySummaryData.month}
        </p>
      </div>
      <div className="space-y-3">
        {monthlySummaryData.expenses.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between border-b border-slate-100 pb-2"
          >
            <span className="text-sm text-slate-600">{item.label}</span>
            <span className="font-semibold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
