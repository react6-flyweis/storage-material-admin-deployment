import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import Pagination from "@/components/Pagination";
import { ActivityDetailsDialog } from "@/components/activity-details-dialog";
import DateRangeFilter from "@/components/ui/date-range-filter";
import type { DateRange } from "react-day-picker";
import { Loader2 } from "lucide-react";
import { useGetActivityLogQuery } from "@/modules/leads/leads.hooks";
import { useAdminEmployeesQuery } from "@/modules/employees/employees.hooks";

export default function ActivityLogPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [employee, setEmployee] = useState("all");
  const [department, setDepartment] = useState("all");
  const [followUpType, setFollowUpType] = useState("all");
  const [status, setStatus] = useState("all");
  const [outcome, setOutcome] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: employeesData } = useAdminEmployeesQuery({ page: 1, limit: 100, role: "sales" });
  const employees = employeesData?.data?.employees || [];

  const apiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: rowsPerPage,
    };
    if (employee !== "all") params.employeeId = employee;
    if (followUpType !== "all") params.type = followUpType;
    if (status !== "all") params.status = status;
    if (dateRange?.from) params.startDate = dateRange.from.toISOString();
    if (dateRange?.to) params.endDate = dateRange.to.toISOString();
    return params;
  }, [currentPage, rowsPerPage, employee, followUpType, status, dateRange]);

  const { data: activityLogResponse, isLoading } = useGetActivityLogQuery(apiParams);

  const activities = activityLogResponse?.data?.activities || [];
  const totalItems = activityLogResponse?.data?.total || 0;

  // Formatting helpers
  const cleanName = (name: string | null | undefined) => {
    if (!name) return "-";
    // Removes timestamp suffix like " 2026-05-18T22-25-15-035Z"
    return name.replace(/\s*\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\s*$/, "").trim();
  };

  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return { date: "-", time: "-" };
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const getFollowUpTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "phone call":
      case "call":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "email":
        return "bg-[#2563eb] hover:bg-[#2563eb]/90 text-white";
      case "meeting":
        return "bg-purple-600 hover:bg-purple-700 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome?.toLowerCase()) {
      case "positive":
        return "text-green-600 font-medium";
      case "neutral":
        return "text-yellow-500 font-medium";
      case "negative":
        return "text-red-500 font-medium";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 ">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
            Follow-up Activity Log
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track all follow-up activities and communication across leads
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Employee</label>
            <Select
              value={employee}
              onValueChange={(value) => {
                setEmployee(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employee</SelectItem>
                {employees.map((emp: any) => (
                  <SelectItem key={emp._id} value={emp._id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Follow-up Type</label>
            <Select
              value={followUpType}
              onValueChange={(value) => {
                setFollowUpType(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="phone call">Phone call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Date Range</label>
            <DateRangeFilter
              value={dateRange}
              onChange={(value) => {
                setDateRange(value);
                setCurrentPage(1);
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Lead Follow up Activity</h3>
          <div className="w-75">
            <Input
              placeholder="Search by Lead, Client or Project"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead/Project</TableHead>
              <TableHead>Client/Contact</TableHead>
              <TableHead>Follow up Date</TableHead>
              <TableHead>Follow up Type</TableHead>
              <TableHead>Followed up by</TableHead>
              <TableHead>Status</TableHead>
              {/* <TableHead>Outcome</TableHead> */}
              <TableHead>Next Follow up</TableHead>
              {/* <TableHead>Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-sm text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading activities...
                  </div>
                </TableCell>
              </TableRow>
            ) : activities.map((row: any) => {
              const followUpDt = formatDateTime(row.followUpDate);
              const nextFollowUpDt = formatDateTime(row.nextFollowUpdate);
              
              return (
              <TableRow 
                key={row._id} 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedActivity(row)}
              >
                <TableCell>
                  <div className="font-medium text-sm text-[#111827]">
                    {cleanName(row.projectName)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {row.jobId || "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm text-[#111827]">
                    {cleanName(row.clientName)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {row.clientPhone || "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm text-[#111827]">
                    {followUpDt.date}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {followUpDt.time}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getFollowUpTypeColor(row.type || "")}>
                    {row.type || "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm text-[#111827]">
                    {row.followedBy?.name || "-"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    <span className="capitalize">{row.followedBy?.role || "-"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 capitalize"
                  >
                    {row.status || "-"}
                  </Badge>
                </TableCell>
                {/* <TableCell>
                  <span className={getOutcomeColor(row.outcome || "")}>
                    {row.outcome || "-"}
                  </span>
                </TableCell> */}
                <TableCell>
                  <div className="font-medium text-sm text-[#111827]">
                    {nextFollowUpDt.date}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {nextFollowUpDt.time}
                  </div>
                </TableCell>
                {/* <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => setSelectedActivity(row)}
                  >
                    View
                  </Button>
                </TableCell> */}
              </TableRow>
            )})}
            {!isLoading && activities.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-8 text-center text-sm text-gray-500"
                >
                  No activity found for selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Showing</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(value) => {
                setRowsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>Results</span>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <ActivityDetailsDialog
        open={!!selectedActivity}
        onOpenChange={(open) => {
          if (!open) setSelectedActivity(null);
        }}
        activity={selectedActivity}
      />
    </div>
  );
}
