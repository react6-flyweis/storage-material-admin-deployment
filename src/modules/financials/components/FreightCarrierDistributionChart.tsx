import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CostDistributionByCarrierItem } from "../financials.api";

type Props = {
  data?: CostDistributionByCarrierItem[];
  isLoading?: boolean;
};

export default function FreightCarrierDistributionChart({ data = [], isLoading }: Props) {
  const chartData = data.map((item) => ({
    name: item.carrierName || "Unknown Carrier",
    value: item.total ?? 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          Cost Distribution by Carrier
        </CardTitle>
        <CardDescription className="text-sm text-slate-400">
          Breakdown of freight costs by carrier
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-72 flex items-center justify-center">
          {isLoading ? (
            <div className="text-sm text-slate-500">Loading carrier distribution...</div>
          ) : chartData.length === 0 ? (
            <div className="text-sm text-slate-400">No carrier distribution data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ left: 32, right: 12 }}
              >
                <CartesianGrid
                  strokeDasharray="6 8"
                  stroke="#E2E8F0"
                  vertical={false}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#A0AEC0", fontSize: 12 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={140}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#4B5563", fontSize: 13, fontWeight: 600 }}
                />
                <Tooltip />
                <Bar dataKey="value" barSize={18} fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


