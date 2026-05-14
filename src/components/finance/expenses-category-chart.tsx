const categoryChartData = [
  { label: "Vendor", value: 9965, color: "#10b981" },
  { label: "Operations", value: 996, color: "#8b5cf6" },
  { label: "Miscell", value: 6562, color: "#f59e0b" },
  { label: "Salaries", value: 478, color: "#ef4444" },
];

export function ExpensesCategoryChart() {
  const total = categoryChartData.reduce((sum, item) => sum + item.value, 0);
  const chartSlices = categoryChartData.reduce<
    Array<{ pathData: string; color: string }>
  >((slices, item) => {
    const startAngle = slices.reduce((angle, sliceItem, index) => {
      const value = categoryChartData[index].value;
      return angle + (value / total) * 360;
    }, 0);
    const percentage = (item.value / total) * 100;
    const sliceAngle = (percentage / 100) * 360;
    const endAngle = startAngle + sliceAngle;
    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
    const largeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
      `Z`,
    ].join(" ");

    slices.push({ pathData, color: item.color });
    return slices;
  }, []);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 font-semibold text-slate-900">
        Expenses by category
      </h3>
      <div className="flex flex-col items-center gap-6">
        {/* Simple Pie Chart Visualization */}
        <div className="relative h-48 w-48">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full transform -rotate-90"
          >
            {chartSlices.map((item, index) => (
              <path
                key={index}
                d={item.pathData}
                fill={item.color}
                stroke="white"
                strokeWidth="1"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-slate-600">Total</p>
            <p className="text-2xl font-bold text-slate-900">${total}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="grid w-full gap-2">
          {categoryChartData.map((item) => {
            // const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-slate-600">{item.label}</span>
                <span className="ml-auto font-medium text-slate-900">
                  ${item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
