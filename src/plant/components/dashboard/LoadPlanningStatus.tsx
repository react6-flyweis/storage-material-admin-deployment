import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Link } from "react-router";
import { useLoadPlanningStatusQuery } from "@/modules/plant/dashboard.hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadPlanningStatus() {
  const { data, isLoading, isError } = useLoadPlanningStatusQuery();

  const chartData = useMemo(() => {
    if (!data?.data) return [];
    const values = data.data;
    return [
      { name: "In Planning", value: values.loadsPlanning, color: "#003f5c" },
      { name: "Planned", value: values.plannedCount, color: "#2f4b7c" },
      { name: "Ready to Ship", value: values.readyToShip, color: "#f95d6a" },
      { name: "Dispatched", value: values.dispatch, color: "#ff7c43" },
    ];
  }, [data]);

  const totalOrders = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="flex flex-col shadow-sm h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Load Planning Status</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-row items-center justify-center p-4 min-h-[160px]">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <Skeleton className="w-32 h-32 rounded-full" />
          </div>
          <div className="ml-4 flex flex-col gap-2 justify-center w-full">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-4 w-28" />
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-2 border-t justify-center">
          <Skeleton className="h-6 w-24" />
        </CardFooter>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="flex flex-col shadow-sm h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Load Planning Status</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6 text-sm text-red-500">
          Failed to load load planning status.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">Load Planning Status</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-row items-center justify-center p-4">
        {totalOrders === 0 ? (
          <div className="flex flex-col items-center justify-center w-full min-h-[160px] text-gray-500 text-sm">
            No orders found
          </div>
        ) : (
          <>
            <div className="relative w-40 h-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    stroke="none"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-gray-900">{totalOrders}</span>
                <span className="text-xs text-gray-500">Total Orders</span>
              </div>
            </div>
            <div className="ml-4 flex flex-col gap-2 justify-center">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="font-semibold w-8 text-right">{item.value}</span>
                  <span className="text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="pt-2 border-t justify-center">
        <Button variant="link" className="text-blue-600 h-auto p-0 font-medium" asChild>
          <Link to="/plant/load-planning">Go to Load Planning</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
