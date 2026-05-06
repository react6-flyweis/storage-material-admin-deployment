import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const stageData = [
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
      <div className="">
        <p className="text-xs text-gray-600 mt-1">{clients} clients</p>
        <p className="text-xs  text-gray-600 ">${amount.toLocaleString()}</p>
      </div>
    </div>
  );
}

export default function StageWisePaymentProgress({
  className,
}: {
  className?: string;
}) {
  return (
    <Card className={cn("w-full p-6 rounded-sm", className)}>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Stage wise payment progress
      </h2>

      <div className="grid grid-cols-2 gap-8">
        {stageData.map((stage) => (
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
    </Card>
  );
}
