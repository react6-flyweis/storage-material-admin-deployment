import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import type { DateRange } from "react-day-picker";
import DateRangeFilter from "@/components/ui/date-range-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminEmployeesQuery } from "@/modules/employees/employees.hooks";
import { exportPlantOverview, type DashboardFilterParams } from "@/modules/plant/dashboard.api";
import { toast } from "sonner";

// Extracted Subcomponents
import OrderProgressOverview from "../components/dashboard/OrderProgressOverview";
import LoadPlanningStatus from "../components/dashboard/LoadPlanningStatus";
import MissingMismatchedItems from "../components/dashboard/MissingMismatchedItems";
import DashboardSummaryCards from "../components/dashboard/DashboardSummaryCards";
import UpcomingShipmentsTable from "../components/dashboard/UpcomingShipmentsTable";

export default function PlantOverview() {
  // State for global filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    // Default to the last 30 days
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from, to };
  });
  
  const [assignedTo, setAssignedTo] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch active plant employees to populate the filters
  const { data: employeesData } = useAdminEmployeesQuery({
    limit: 100,
    isActive: true,
    role: "plant",
  });

  // Format dates & employee params for backend API
  const formattedFilters: DashboardFilterParams = useMemo(() => {
    const formatDate = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const empId = assignedTo === "all" ? undefined : assignedTo;

    return {
      startDate: dateRange?.from ? formatDate(dateRange.from) : undefined,
      endDate: dateRange?.to ? formatDate(dateRange.to) : undefined,
      assignedTo: empId,
      employeeId: empId,
      plantEmployeeId: empId,
    };
  }, [dateRange, assignedTo]);

  // Selected employee's display name for subcomponents / report dialog
  const selectedEmployeeName = useMemo(() => {
    if (assignedTo === "all") return undefined;
    const emp = employeesData?.data?.employees?.find((e) => e._id === assignedTo);
    return emp ? emp.name : undefined;
  }, [assignedTo, employeesData]);

  // Handle Plant Overview export (plant-overview.xlsx)
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await exportPlantOverview(formattedFilters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "plant-overview.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Plant overview exported successfully");
    } catch (err: unknown) {
      console.error("Export error:", err);
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || "Failed to export plant overview");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#eff3f8] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            Plant Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time overview of plant operations from quotation to final delivery
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            className="bg-white"
          />

          {/* Assigned To (Employee) Selector */}
          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger className="w-[180px] bg-blue-600 text-white border-blue-600">
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employeesData?.data?.employees?.map((emp) => (
                <SelectItem key={emp._id} value={emp._id}>
                  {emp.name} ({emp.role || "User"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Export Action */}
          <Button
            variant="outline"
            className="bg-white gap-2"
            disabled={isExporting}
            onClick={handleExport}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      {/* Top Row: Charts & Missing Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OrderProgressOverview filters={formattedFilters} />
        <LoadPlanningStatus filters={formattedFilters} />
        <MissingMismatchedItems
          filters={formattedFilters}
          employeeName={selectedEmployeeName}
        />
      </div>

      {/* Middle Row: Summary Cards */}
      <DashboardSummaryCards filters={formattedFilters} />

      {/* Bottom Table: Upcoming Shipments */}
      <UpcomingShipmentsTable filters={formattedFilters} />
    </div>
  );
}
