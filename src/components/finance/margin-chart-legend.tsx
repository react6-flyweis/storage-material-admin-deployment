export type MarginLegendItem = {
  key: "gross" | "operating" | "net" | "contribution";
  label: string;
  color: string;
};

export const marginChartLegend: MarginLegendItem[] = [
  { key: "gross", label: "Gross Margin", color: "#3b82f6" },
  { key: "operating", label: "Operating Margin", color: "#10b981" },
  { key: "net", label: "Net Profit Margin", color: "#4f46e5" },
  { key: "contribution", label: "Contribution Margin", color: "#d4a917" },
];

interface MarginChartLegendProps {
  items?: MarginLegendItem[];
}

export default function MarginChartLegend({
  items = marginChartLegend,
}: MarginChartLegendProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-slate-700">
      {items.map((item) => (
        <div key={item.key} className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
