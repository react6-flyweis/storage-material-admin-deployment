import { useEmployeePerformanceQuery } from "@/modules/employees/employees.hooks";
import MetricCard from "@/components/employee-performance/MetricCard";
import PerformanceChart from "@/components/employee-performance/PerformanceChart";
import TopPerformerCard from "@/components/employee-performance/TopPerformerCard";
// import PerformanceTable from "@/components/employee-performance/PerformanceTable";
import { getApiErrorMessage } from "@/lib/api-error";

const CHART_COLORS = [
  "#16a34a",
  "#06b6d4",
  "#2563eb",
  "#8b5cf6",
  "#ef4444",
  "#06b6a4",
  "#f59e0b",
  "#10b981",
];

export default function EmployeePerformancePage() {
  const {
    data: performanceResponse,
    isLoading,
    error,
  } = useEmployeePerformanceQuery();

  const performanceData = (performanceResponse?.data.performance ?? []).map(
    (item, index) => ({
      id: item.employee._id,
      name: item.employee.name,
      value: item.totalLeads,
      color: CHART_COLORS[index % CHART_COLORS.length],
      department: "N/A",
      role: item.employee.email,
      deals: item.closedLeads,
      commission: `${Math.round(item.conversionRate)}%`,
      perf: item.conversionRate,
    }),
  );

  const totalLeads = performanceData.reduce((sum, item) => sum + item.value, 0);
  const totalClosedLeads = performanceData.reduce(
    (sum, item) => sum + item.deals,
    0,
  );
  const avgConversionRate = performanceData.length
    ? Math.round(
        performanceData.reduce((sum, item) => sum + item.perf, 0) /
          performanceData.length,
      )
    : 0;

  const topPerformer = performanceData.reduce(
    (top, current) => (current.value > top.value ? current : top),
    performanceData[0],
  ) ?? {
    id: "",
    name: "N/A",
    value: 0,
    color: CHART_COLORS[0],
    department: "N/A",
    role: "N/A",
    deals: 0,
    commission: "0%",
    perf: 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-5">
        <h1 className="text-3xl font-bold">Employee Performance</h1>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Loading employee performance...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-5">
        <h1 className="text-3xl font-bold">Employee Performance</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {getApiErrorMessage(
            error,
            "Unable to load employee performance right now.",
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sales Employee Performance</h1>
          <p className="text-gray-600 mt-1">
            Add, edit, and manage employees, teams, roles, and permissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Revenue Distribution</h2>
            <div className="text-sm text-gray-500">Total: {totalLeads}</div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <PerformanceChart data={performanceData} />

            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Performance Breakdown</h2>
              </div>

              <div className="space-y-3">
                {performanceData.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ background: d.color }}
                      />
                      <div className="text-sm font-medium">{d.name}</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="font-semibold">{d.value}</div>
                      <div className="text-xs text-gray-400">
                        {totalLeads
                          ? Math.round((d.value / totalLeads) * 100)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <TopPerformerCard top={topPerformer} total={totalLeads} />

          <MetricCard
            title="Total Deals"
            value={totalClosedLeads}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-indigo-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 11a1 1 0 011-1h3V5a1 1 0 112 0v5h3a1 1 0 110 2H8v3a1 1 0 11-2 0v-3H3a1 1 0 01-1-1z" />
              </svg>
            }
          />
          <MetricCard
            title="Avg Commission"
            value={`${avgConversionRate}%`}
            icon={<span className="text-orange-500 font-semibold">%</span>}
            accent={"orange"}
          />
        </div>
      </div>

      {/* Employee performance table */}
      {/* <PerformanceTable data={performanceData} /> */}
    </div>
  );
}
