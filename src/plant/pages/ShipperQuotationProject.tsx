import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Filter, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
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
  "Order Sent": "border-indigo-200 bg-indigo-100 text-indigo-500",
  "Revision Sent": "border-blue-200 bg-blue-100 text-blue-500",
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
  return fileStatus || "File Received";
};

export default function ShipperQuotationProject() {
  const { projectId } = useParams<{ projectId: string }>();
  const leadId = projectId || "";

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
  const totalPages = Math.ceil(total / rowsPerPage) || 1;

  // Filter requests based on status filter locally if needed
  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter((r) => {
      const statusVal = displayStatus(r.fileStatus, r.comparisonStatus);
      return statusVal.toLowerCase() === statusFilter.toLowerCase();
    });
  }, [requests, statusFilter]);

  if (isStatsLoading || isRequestsLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#eef2fa]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1D51A4]" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#eef2fa] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            {statsData?.projectName || "Project"} - Shipper Quotation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage vendor shipment files and prepare for validation
          </p>
        </div>
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
              className="pl-9 bg-white"
            />
          </div>
          <Button variant="outline" className="bg-white text-gray-600 gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
          <SelectTrigger className="w-[160px] bg-white text-gray-700">
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

      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-gray-700 font-semibold border-b">
              <tr>
                <th className="px-6 py-5 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-5">Shipper ⇅</th>
                <th className="px-6 py-5">File Name</th>
                <th className="px-6 py-5">Upload Date ⇅</th>
                <th className="px-6 py-5">Rates ⇅</th>
                <th className="px-6 py-5">Weight ⇅</th>
                <th className="px-6 py-5">File Status</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No shipper requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((row) => {
                  const statusVal = displayStatus(row.fileStatus, row.comparisonStatus);
                  return (
                    <tr key={row.requestId} className="hover:bg-gray-50">
                      <td className="px-6 py-5 text-center">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                            <img
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${row.vendorName || "V"}`}
                              alt="avatar"
                            />
                          </div>
                          <span className="font-medium text-gray-900">{row.vendorName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-gray-500">{row.fileName}</td>
                      <td className="px-6 py-5 text-gray-500">
                        {row.uploadedDate ? format(new Date(row.uploadedDate), "dd MMM yyyy") : "—"}
                      </td>
                      <td className="px-6 py-5 font-medium text-gray-900">
                        ${row.rates?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-5 text-gray-500">18,500 IBS</td>
                      <td className="px-6 py-5">
                        <Select defaultValue={statusVal}>
                          <SelectTrigger className={cn(
                            "h-8 border text-xs font-semibold w-[140px] focus:ring-0",
                            statusStyles[statusVal] || 'bg-gray-100 text-gray-700'
                          )}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 flex items-center gap-2">
                              <Filter className="w-3.5 h-3.5" /> Select Status
                            </div>
                            {Object.entries(statusStyles).map(([status, style]) => (
                              <SelectItem key={status} value={status} className="py-1.5">
                                <span className={cn(
                                  "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold w-[120px]",
                                  style
                                )}>
                                  {status}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100 text-gray-700">
                          <Link to={`/plant/shipper-quotation/${leadId}/file/${row.requestId}`}>
                            <Eye className="w-5 h-5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t bg-white flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            Row Per Page
            <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="w-16 h-8 bg-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            Entries
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="w-8 h-8 p-0 text-slate-400 hover:text-slate-900 disabled:opacity-50 flex items-center justify-center"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  className={`w-8 h-8 p-0 rounded-full ${currentPage === pageNum
                    ? "bg-[#f97316] text-white hover:bg-orange-600 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100"
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="ghost"
              className="w-8 h-8 p-0 text-slate-400 hover:text-slate-900 disabled:opacity-50 flex items-center justify-center"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}


