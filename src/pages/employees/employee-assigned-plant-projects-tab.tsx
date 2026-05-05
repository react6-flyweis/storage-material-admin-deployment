import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, User } from "lucide-react";
import DateRangeFilter from "@/components/ui/date-range-filter";
import type { DateRange as RDateRange } from "react-day-picker";

const ASSIGNED_PLANT_PROJECTS = [
  {
    id: "DEL-2001",
    title: "ABC Constructions",
    location: "Workshop . Texas",
    customer: "John Doe",
    buildings: 1,
    status: {
      text: "Approved",
      color: "bg-green-100 hover:bg-green-200 text-green-700",
    },
    value: 12500,
  },
  {
    id: "DEL-2002",
    title: "PQR Warehouse",
    location: "Warehouse . Texas",
    customer: "Roahan Sharma",
    buildings: 4,
    status: {
      text: "BOM Ready",
      color: "bg-orange-100 hover:bg-orange-200 text-orange-700",
    },
    value: 12500,
  },
  {
    id: "DEL-2003",
    title: "XYZ Mall Building",
    location: "Workshop . Texas",
    customer: "Riyaz Verma",
    buildings: 2,
    status: {
      text: "Shipper File Received",
      color: "bg-purple-100 hover:bg-purple-200 text-purple-700",
    },
    value: 12500,
  },
  {
    id: "DEL-2004",
    title: "MNP Warehouse",
    location: "Workshop . Texas",
    customer: "Riya Wellness",
    buildings: 1,
    status: {
      text: "Shipper File Received",
      color: "bg-purple-100 hover:bg-purple-200 text-purple-700",
    },
    value: 12500,
  },
];

export function EmployeeAssignedPlantProjectsTab({
  dateRange,
  onDateRangeChange,
}: {
  dateRange?: RDateRange;
  onDateRangeChange?: (range: RDateRange | undefined) => void;
}) {
  const formatCurrency = (amount?: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount ?? 0);

  return (
    <div className="space-y-6">
      <div className="w-full flex justify-end">
        <DateRangeFilter
          value={dateRange}
          onChange={onDateRangeChange!}
          className="bg-white max-w-60"
        />
      </div>

      <Card className="p-4 border-none shadow-sm pb-10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-transparent text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                <th className="w-12 py-3 pl-4 text-left">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="py-4 text-left font-semibold">Project Name</th>
                <th className="py-4 text-left font-semibold">Customer</th>
                <th className="py-4 text-center font-semibold">Buildings</th>
                <th className="py-4 text-left font-semibold">Status</th>
                <th className="py-4 text-left font-semibold">Project Value</th>
                <th className="py-4 text-center pr-6 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {ASSIGNED_PLANT_PROJECTS.map((project) => (
                <tr
                  key={project.id}
                  className="text-sm hover:bg-gray-50 transition-colors group"
                >
                  <td className="pl-4 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-4">
                    <div className="font-semibold text-gray-900">
                      {project.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {project.location}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="text-sm text-gray-600">
                        {project.customer}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-center font-bold text-gray-900">
                    {project.buildings}
                  </td>
                  <td className="py-4 whitespace-nowrap">
                    <Badge
                      className={`${project.status.color} border-none font-medium px-4 py-1 rounded-full shadow-none`}
                    >
                      {project.status.text}
                    </Badge>
                  </td>
                  <td className="py-4 text-left font-bold text-gray-900">
                    {formatCurrency(project.value)}
                  </td>
                  <td className="py-4 text-center pr-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-800 hover:text-blue-900 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
