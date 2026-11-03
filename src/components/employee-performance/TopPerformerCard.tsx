import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { EmployeePerformanceApiItem } from "@/modules/employees/employees.api";

export function formatCurrency(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function getInitials(name?: string) {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export type PerformanceDatum = {
  id: string;
  name: string;
  value: number;
  color: string;
  department?: string;
  role?: string;
  deals?: number;
  commission?: string;
  perf?: number;
  revenue?: number;
  revenueSharePercent?: number;
  leads?: number;
};

type Props = {
  topPerformer: EmployeePerformanceApiItem | null | undefined;
};

export default function TopPerformerCard({ topPerformer }: Props) {
  if (!topPerformer) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center text-sm text-gray-500">
        No top performer data available
      </div>
    );
  }

  const { employee, revenue, revenueSharePercent } = topPerformer;

  return (
    <div className="relative bg-green-50 rounded-lg p-4 shadow-sm overflow-hidden">
      <div className="absolute top-3 right-3 text-yellow-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l2.39 4.85L19 8.18l-3.25 2.81L16.78 16 12 13.77 7.22 16l1.03-4.99L5 8.18l4.61-.33L12 2z" />
        </svg>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="w-12 h-12 border-2 border-white shadow">
            <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-sm">
              {getInitials(employee?.name)}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
            <span className="block w-3 h-3 rounded-full bg-green-500 border-2 border-white"></span>
          </span>
        </div>

        <div>
          <div className="text-sm font-semibold">{employee?.name}</div>
          <div className="text-xs text-gray-600">{employee?.email}</div>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-md p-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Top Earner of the Month</div>
          <div className="text-2xl font-bold mt-2 text-green-600">
            {formatCurrency(revenue)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {revenueSharePercent}% of total revenue
          </div>
        </div>
        <div className="ml-4 shrink-0">
          <div className="px-3 py-2 bg-green-100 text-green-700 rounded-md font-medium text-right">
            {formatCurrency(revenue)}
          </div>
        </div>
      </div>

      <div className="mt-3 text-sm text-green-700">🎉 Congratulations!</div>
    </div>
  );
}
