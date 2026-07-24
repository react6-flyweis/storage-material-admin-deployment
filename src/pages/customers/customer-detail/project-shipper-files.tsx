import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CheckCircle, Eye, Filter, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const statusClasses: Record<string, string> = {
  Pending: "bg-[#FEF9C3] text-[#CA8A04] border-[#FDE68A]",
  Approved: "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]",
  Compared: "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]",
  "File Received": "bg-[#FEF9C3] text-[#CA8A04] border-[#FDE68A]",
  "Order Sent": "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]",
  "Revision Sent": "bg-[#FEF9C3] text-[#CA8A04] border-[#FDE68A]",
};

const displayStatus = (fileStatus: string, comparisonStatus: string) => {
  const s = fileStatus?.toLowerCase();
  const c = comparisonStatus?.toLowerCase();
  if (s === "submitted") return "File Received";
  if (c === "completed") return "Compared";
  if (s === "approved") return "Approved";
  if (s === "rejected") return "Rejected";
  if (s === "order sent" || s === "ordersent") return "Order Sent";
  if (s === "revision sent" || s === "revisionsent") return "Revision Sent";
  return fileStatus || "Pending";
};

export default function ProjectShipperFilesPage() {
  const navigate = useNavigate();
  const { id, projectId } = useParams<{ id: string; projectId: string }>();
  const leadId = projectId || id || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
  const requests = requestsResponse?.data?.shipperRequests || [];
  const total = requestsResponse?.data?.total || 0;

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
      <div className="flex-1 min-h-screen flex items-center justify-center bg-slate-50/50">
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search"
            className="pl-9 bg-white border-slate-200"
          />
        </div>
        <Button
          variant="outline"
          className="bg-white border-slate-200 text-slate-700"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Card className="overflow-hidden">
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
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    No shipper requests found.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((row) => {
                  const statusVal = displayStatus(row.fileStatus, row.comparisonStatus);
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
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md py-0.5 text-xs font-medium px-2 border ",
                            statusClasses[statusVal] ?? "text-slate-600",
                          )}
                        >
                          {statusVal}
                          <CheckCircle className="ml-1 size-3" />
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          onClick={() => navigate(`/plant/shipper-quotation/${leadId}/file/${row.requestId}`)}
                          className="text-slate-500 hover:text-slate-900 p-2 rounded-full"
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

