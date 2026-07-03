import { useState } from "react";

export type Period = "Today" | "Week" | "Month" | "All Time";

type Props = {
  initialPeriod?: Period;
  onPeriodChange?: (period: Period) => void;
};

export default function FilterTabs({
  initialPeriod = "All Time",
  onPeriodChange,
}: Props) {
  const [period, setPeriod] = useState<Period>(initialPeriod);

  const handleChange = (p: Period) => {
    setPeriod(p);
    if (onPeriodChange) onPeriodChange(p);
  };

  const button = (p: Period, bg: string, z: string) => (
    <button
      onClick={() => handleChange(p)}
      className={`relative w-64 px-8 font-medium -ml-7.5 ${z} ${bg} ${
        period === p
          ? "ring-2 ring-white/40 text-black"
          : "text-white opacity-60"
      }`}
      style={{
        clipPath: "polygon(0 0, calc(100% - 30px) 0, 100% 100%, 30px 100%)",
      }}
    >
      {p}
    </button>
  );

  return (
    <div className="relative flex h-10 bg-[#89D5DC] overflow-hidden">
      <button
        onClick={() => handleChange("Today")}
        className={`relative w-64 px-8 font-medium z-30 bg-[#89D5DC] ${
          period === "Today"
            ? "ring-2 ring-white/40 text-black"
            : "text-white opacity-60"
        }`}
        style={{
          clipPath: "polygon(0 0, calc(100% - 30px) 0, 100% 100%, 0 100%)",
        }}
      >
        Today
      </button>

      {button("Week", "bg-[#6B93CE]", "z-20")}

      {button("Month", "bg-[#4A72B7]", "z-10")}

      {button("All Time", "bg-[#2C4875]", "z-0")}
    </div>
  );
}
