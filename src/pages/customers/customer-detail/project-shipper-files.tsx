import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Eye, Filter, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import Pagination from "@/components/Pagination";
import { Card } from "@/components/ui/card";
import StatCard from "@/components/ui/stat-card";
import { cn } from "@/lib/utils";
import {
  useProjectShipperStatsQuery,
  useProjectShipperRequestsQuery,
} from "@/modules/plant/shipper.hooks";

const statusStyles: Record<string, string> = {
  "Approved": "border-emerald-200 bg-emerald-100 text-emerald-600",
  "Rejected": "border-rose-200 bg-rose-100 text-rose-500",
  "File Received": "border-amber-200 bg-amber-100 text-amber-600",
  "Compared": "border-green-200 bg-green-100 text-green-600",
  "Comparison Completed": "border-emerald-200 bg-emerald-100 text-emerald-600",
  "Comparison Processing": "border-amber-200 bg-amber-100 text-amber-600",
  "Comparison Failed": "border-rose-200 bg-rose-100 text-rose-500",
  "Order Sent": "border-indigo-200 bg-indigo-100 text-indigo-500",
  "Revision Sent": "border-blue-200 bg-blue-100 text-blue-500",
  "Sent": "border-indigo-200 bg-indigo-100 text-indigo-500",
  "Resubmit Requested": "border-cyan-200 bg-cyan-100 text-cyan-600",
};

const displayStatus = (fileStatus: string, comparisonStatus?: string) => {
  const s = fileStatus?.toLowerCase();
  const c = comparisonStatus?.toLowerCase();

  if (s === "approved") return "Approved";
  if (s === "rejected") return "Rejected";
  if (s === "resubmit_requested" || s === "resubmit requested") return "Resubmit Requested";
  if (s === "order sent" || s === "ordersent") return "Order Sent";
  if (s === "revision sent" || s === "revisionsent") return "Revision Sent";
  if (s === "sent") return "Sent";

  if (c === "completed" || s === "comparison_completed") return "Compared";
  if (c === "processing" || s === "comparison_processing") return "Comparison Processing";
  if (c === "failed" || s === "comparison_failed") return "Comparison Failed";

  if (s === "submitted") return "File Received";

  return fileStatus || "File Received";
};

export default function ProjectShipperFilesPage() {
  const navigate = useNavigate();
  const { id, projectId } = useParams<{ id: string; projectId: string }>();
  const leadId = projectId || id || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: statsResponse, isLoading: isStatsLoading } = useProjectShipperStatsQuery(leadId, {
    enabled: !!leadId,
  });

  const { data: requestsResponse, isLoading: isRequestsLoading } = useProjectShipperRequestsQuery(
    leadId,
    currentPage,
    rowsPerPage,
    searchTerm.trim() || undefined,
    {
      enabled: !!leadId,
    }
  );

  const statsData = statsResponse?.data;
  const requests = useMemo(() => requestsResponse?.data?.shipperRequests || [], [requestsResponse]);
  const total = requestsResponse?.data?.total || 0;

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter((r) => {
      const statusVal = displayStatus(r.fileStatus, r.comparisonStatus);
      return statusVal.toLowerCase() === statusFilter.toLowerCase();
    });
  }, [requests, statusFilter]);

  const shipperStats = useMemo(() => {
    return [
      {
        title: "Total Shipper Files",
        value: statsData ? `${statsData.totalFiles} Files` : "0 Files",
        bg: "bg-[#1D51A4]",
        icon: <Search className="h-5 w-5 text-[#1D51A4]" />,
      },
      {
        title: "Pending Upload",
        value: statsData ? `${statsData.totalFiles - statsData.filesReceived} Files` : "0 Files",
        bg: "bg-[#22C55E]",
        icon: <Search className="h-5 w-5 text-[#22C55E]" />,
      },
      {
        title: "Ready for Validation",
        value: statsData ? `${statsData.filesReceived} Files` : "0 Files",
        bg: "bg-[#FACC15]",
        icon: <Search className="h-5 w-5 text-[#EAB308]" />,
      },
      {
        title: "Issues Detected",
        value: statsData ? `${statsData.revisionsSent} Files` : "0 Files",
        bg: "bg-[#FB923C]",
        icon: <Search className="h-5 w-5 text-[#F97316]" />,
      },
    ];
  }, [statsData]);

  if (isStatsLoading || isRequestsLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center ">
        <Loader2 className="w-8 h-8 animate-spin text-[#1D51A4]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="default"
            onClick={() => navigate(-1)}
            className="px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-[#0F172A]">
            {statsData?.projectName || "Project"} - Shipper Files
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {shipperStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            color={stat.bg}
            icon={stat.icon}
            valueClassName="text-3xl font-semibold"
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search"
              className="pl-9 bg-white border-slate-200"
            />
          </div>
          <Button variant="outline" className="bg-white border-slate-200 text-slate-700 gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
          <SelectTrigger className="w-[160px] bg-white text-slate-700 border-slate-200">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="File Received">File Received</SelectItem>
            <SelectItem value="Order Sent">Order Sent</SelectItem>
            <SelectItem value="Revision Sent">Revision Sent</SelectItem>
            <SelectItem value="Compared">Compared</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC]">
                <TableHead className="w-12 text-center py-4">
                  <Checkbox className="border-slate-300" />
                </TableHead>
                <TableHead className="font-semibold text-slate-800">
                  Shipper
                </TableHead>
                <TableHead className="font-semibold text-slate-800">
                  File Name
                </TableHead>
                <TableHead className="font-semibold text-slate-800">
                  Upload Date
                </TableHead>
                <TableHead className="font-semibold text-slate-800">
                  Items
                </TableHead>
                <TableHead className="font-semibold text-slate-800">
                  Weight
                </TableHead>
                <TableHead className="font-semibold text-slate-800">
                  File Status
                </TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    No shipper requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((row) => {
                  const statusVal = displayStatus(row.fileStatus, row.comparisonStatus);
                  const isNotReceived =
                    !row.uploadedDate ||
                    row.fileStatus?.toLowerCase() === "sent" ||
                    row.fileStatus?.toLowerCase() === "order sent" ||
                    row.fileStatus?.toLowerCase() === "ordersent" ||
                    row.fileStatus?.toLowerCase() === "pending" ||
                    statusVal === "Order Sent" ||
                    statusVal === "Sent";

                  const isResubmitRequested =
                    row.fileStatus?.toLowerCase() === "resubmit_requested" ||
                    row.fileStatus?.toLowerCase() === "resubmit requested" ||
                    statusVal === "Resubmit Requested";

                  const isEyeDisabled = isNotReceived || isResubmitRequested;

                  return (
                    <TableRow key={row.requestId} className="hover:bg-slate-50/80">
                      <TableCell className="text-center py-4">
                        <Checkbox className="border-slate-300" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#1D51A4] text-white flex items-center justify-center text-sm font-semibold">
                            {row.vendorName
                              ? row.vendorName
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()
                              : "V"}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {row.vendorName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {row.fileName}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {row.uploadedDate ? format(new Date(row.uploadedDate), "dd MMM yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {row.resubmitCount || 120}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        18,500 IBS
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold border",
                            statusStyles[statusVal] || "border-gray-200 bg-gray-100 text-gray-700"
                          )}
                        >
                          {statusVal}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          onClick={() => navigate(`/plant/shipper-quotation/${leadId}/file/${row.requestId}`)}
                          disabled={isEyeDisabled}
                          className="text-slate-500 hover:text-slate-900 p-2 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>


      <div className="flex items-center justify-between bg-white">
        <Pagination
          totalItems={total}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setCurrentPage(1);
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </div>
    </div>
  );
}

