import { useState, useMemo } from "react";
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
import DateRangeFilter from "@/components/ui/date-range-filter";
import { useLeadScoringQuery, useUpdateLeadTemperatureMutation } from "@/modules/leads/leads.hooks";
import { Loader2 } from "lucide-react";
import Pagination from "@/components/Pagination";
import { format } from "date-fns";
import { toast } from "sonner";

interface LeadScore {
  id: string;
  name: string;
  leadId: string;
  location: string;
  progress: number;
  status: "Proposal sent" | "Quotation Sent";
  quoteValue: number;
  score: "Hot" | "Warm" | "Cold";
  lastActivity: string;
  lastActivityDate?: string; // ISO date string for filtering
}

const initialLeads: LeadScore[] = [
  {
    id: "1",
    name: "John Doe",
    leadId: "O-2025-1047",
    location: "Workshop - Texas",
    progress: 4,
    status: "Proposal sent",
    quoteValue: 12500,
    score: "Hot",
    lastActivity: "2 Days Ago",
    lastActivityDate: "2026-01-11",
  },
  {
    id: "2",
    name: "John Doe",
    leadId: "O-2025-1047",
    location: "Workshop - Texas",
    progress: 3,
    status: "Quotation Sent",
    quoteValue: 12500,
    score: "Warm",
    lastActivity: "2 Days Ago",
    lastActivityDate: "2026-01-11",
  },
  {
    id: "3",
    name: "John Doe",
    leadId: "O-2025-1047",
    location: "Workshop - Texas",
    progress: 3,
    status: "Proposal sent",
    quoteValue: 12500,
    score: "Cold",
    lastActivity: "2 Days Ago",
    lastActivityDate: "2026-01-09",
  },
  {
    id: "4",
    name: "John Doe",
    leadId: "O-2025-1047",
    location: "Workshop - Texas",
    progress: 3,
    status: "Proposal sent",
    quoteValue: 12500,
    score: "Hot",
    lastActivity: "2 Days Ago",
    lastActivityDate: "2025-12-20",
  },
];

export default function LeadScoring() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("all");
  const [client, setClient] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data: scoringData, isLoading } = useLeadScoringQuery(page, limit, {
    startDate: dateFrom,
    endDate: dateTo,
    status,
    client,
  });
  const leads = scoringData?.data?.leads || [];

  const updateTemperatureMutation = useUpdateLeadTemperatureMutation();

  const updateLeadScore = (id: string, newScore: string) => {
    updateTemperatureMutation.mutate(
      { leadId: id, temperature: newScore.toLowerCase() },
      {
        onSuccess: () => toast.success("Lead status updated successfully!"),
        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update lead status"),
      }
    );
  };

  const getScoreBadgeClass = (score: string) => {
    switch (score) {
      case "Hot":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "Warm":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "Cold":
        return "bg-green-500 hover:bg-green-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Proposal sent":
        return "bg-purple-100 text-purple-700 hover:bg-purple-200";
      case "Quotation Sent":
        return "bg-orange-100 text-orange-700 hover:bg-orange-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const renderProgressDots = (progress: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < progress ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="">
      {/* Header */}
      <div className="bg-teal-400  px-6 py-4 text-white">
        <h1 className="text-xl font-semibold">Lead Scoring</h1>
      </div>

      <div className="p-6 space-y-6">
        <h2 className="text-lg font-semibold mb-4">Lead Scoring</h2>
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg space-y-4 ">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Date Range
              </label>
              <DateRangeFilter
                onChange={(d) => {
                  setDateFrom(d?.from ? d.from.toISOString().slice(0, 10) : "");
                  setDateTo(d?.to ? d.to.toISOString().slice(0, 10) : "");
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-white min-w-40">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Client
              </label>
              <Input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Search client..."
                className="bg-white"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                  Lead Info
                </TableHead>
                <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                  Progress
                </TableHead>
                <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                  Quote Value
                </TableHead>
                <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                  Score
                </TableHead>
                <TableHead className="font-semibold text-gray-600 uppercase text-xs">
                  Last Activity
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-sm text-gray-500">Loading lead scoring...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                    No leads found.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => {
                  // Determine progress (mock based on status or some logic)
                  const progress = lead.status === "hot" ? 4 : lead.status === "warm" ? 3 : 2;
                  
                  // Use temperature if available, otherwise map API score (number) to Hot/Warm/Cold for display/dropdown
                  let displayScore = "Cold";
                  if (lead.temperature) {
                    displayScore = lead.temperature.charAt(0).toUpperCase() + lead.temperature.slice(1).toLowerCase();
                  } else {
                    displayScore = lead.score >= 80 ? "Hot" : lead.score >= 50 ? "Warm" : "Cold";
                  }

                  return (
                    <TableRow key={lead.leadId} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-[13px] text-gray-900">
                            {lead.customerName || "N/A"}
                          </div>
                          {lead.projectName && (
                            <div className="text-[12px] text-gray-500 mt-0.5">
                              {lead.projectName}
                            </div>
                          )}
                          <div className="text-[12px] text-gray-500 mt-0.5">
                            {lead.projectId || lead.leadId}
                          </div>
                          <div className="text-[12px] text-gray-400 mt-0.5">
                            {lead.location || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {renderProgressDots(progress)}
                          <span className="text-sm text-gray-600">
                            Step {progress}/7
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(lead.lifecycleStatus || lead.status)}>
                          {lead.lifecycleStatus || lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${lead.quoteValue?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={displayScore}
                          onValueChange={(val) => updateLeadScore(lead.leadId, val as any)}
                        >
                          <SelectTrigger
                            className={`${getScoreBadgeClass(
                              displayScore,
                            )} rounded-full px-4`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hot">Hot</SelectItem>
                            <SelectItem value="Warm">Warm</SelectItem>
                            <SelectItem value="Cold">Cold</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {lead.updatedAt ? format(new Date(lead.updatedAt), "MM/dd/yyyy hh:mm a") : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {scoringData?.data?.total ? (
            <Pagination
              totalItems={scoringData.data.total}
              currentPage={page}
              rowsPerPage={limit}
              onPageChange={setPage}
              onRowsPerPageChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
