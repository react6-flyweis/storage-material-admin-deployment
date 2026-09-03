import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { StageWiseItem } from "@/modules/payments/payments.api";

interface StageWisePaymentProgressProps {
  className?: string;
  data?: StageWiseItem[];
  isLoading?: boolean;
}

const DEFAULT_STAGES = [
  {
    title: "Initial Payment",
    completed: 80,
    clients: 12,
    amount: 250000,
    color: "#22c55e",
  },
  {
    title: "Final Payment",
    completed: 25,
    clients: 4,
    amount: 250000,
    color: "#155EEF",
  },
];

const STAGE_CONFIG: Record<string, { title: string; color: string }> = {
  paid: { title: "Paid Stage", color: "#22c55e" },
  sent: { title: "Sent Stage", color: "#155EEF" },
  initial: { title: "Initial Payment", color: "#22c55e" },
  final: { title: "Final Payment", color: "#155EEF" },
};

function StageCircle({
  completed,
  title,
  clients,
  amount,
  color,
}: {
  completed: number;
  title: string;
  clients: number;
  amount: number;
  color: string;
}) {
  const data = [
    { value: completed, fill: color },
    { value: 100 - completed, fill: "#e5e7eb" },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={60}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{completed}%</span>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mt-4">{title}</h3>
      <div className="text-center">
        <p className="text-xs text-gray-600 mt-1">{clients} count</p>
        <p className="text-xs text-gray-600">${amount.toLocaleString()}</p>
      </div>
    </div>
  );
}

export default function StageWisePaymentProgress({
  className,
  data,
  isLoading,
}: StageWisePaymentProgressProps) {
  let displayStages = DEFAULT_STAGES;

  if (data && data.length > 0) {
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);

    displayStages = data.map((item) => {
      const config = STAGE_CONFIG[item._id.toLowerCase()] || {
        title: item._id.charAt(0).toUpperCase() + item._id.slice(1),
        color: "#8b5cf6",
      };
      const completed = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;

      return {
        title: config.title,
        completed,
        clients: item.count,
        amount: item.amount,
        color: config.color,
      };
    });
  }

  return (
    <Card className={cn("w-full p-6 rounded-sm", className)}>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Stage wise payment progress
      </h2>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-sm text-gray-500">
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-8">
          {displayStages.map((stage) => (
            <StageCircle
              key={stage.title}
              completed={stage.completed}
              title={stage.title}
              clients={stage.clients}
              amount={stage.amount}
              color={stage.color}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

