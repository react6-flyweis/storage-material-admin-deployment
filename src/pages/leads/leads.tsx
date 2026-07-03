import { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/utils/socketContextProvider";
import { Link } from "react-router";
import type { DateRange } from "react-day-picker";
import {
  UserPlus,
  Download,
  MessageSquare,
  Eye,
  Users,
  UserCheck,
  UserX,
  Mail,
  Pen,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useExportLeadsMutation } from "@/modules/leads/leads.hooks";
import { toast } from "sonner";
import ImportLeadsDialog from "@/components/leads/import-leads-dialog";
import AssignSalesDialog from "@/components/leads/assign-sales-dialog";
import CreateQuotationDialog from "@/components/leads/create-quotation-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatCard from "@/components/ui/stat-card";

import ChatDialog from "@/components/leads/chat-dialog";
import SuccessDialog from "@/components/success-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import FilterTabs, { type Period } from "@/components/FilterTabs";
import TitleSubtitle from "@/components/TitleSubtitle";
import DateRangeFilter from "@/components/ui/date-range-filter";
import { apiClient } from "@/modules/auth/auth.api";

type LeadsStatsData = {
  total: number;
  assigned: number;
  unassigned: number;
  unreadMessages: number;
};

type AdminLead = {
  _id: string;
  customerId?: {
    customerId?: string;
    firstName?: string;
  };
  buildingType?: string;
  location?: string;
  assignedSales?: {
    name?: string;
  } | null;
  quoteValue?: number;
  lifecycleStatus?: string;
  leadScoring?: {
    score?: number;
  };
  createdAt: string;
};

type AdminLeadsData = {
  leads: AdminLead[];
  total: number;
  page: number;
  limit: number;
};

type LeadsStatsResponse = {
  success: boolean;
  message: string;
  data: LeadsStatsData;
};

type AdminLeadsResponse = {
  success: boolean;
  message: string;
  data: AdminLeadsData;
};

type LeadTableRow = {
  id: string;
  backendId?: string;
  name: string;
  customerName: string;
  workshop: string;
  category: string;
  assignedTo: string | null;
  assignedToName: string;
  assignmentStatus: string;
  score: number;
  progress: number;
  progressStep: string;
  status: string;
  statusColor: string;
  quoteValue: string;
  chatCount: number;
  createdAt: Date;
};

type StatCardSkeletonProps = {
  color: string;
};

function StatCardSkeleton({ color }: StatCardSkeletonProps) {
  return (
    <div
      className={`sm:p-5 px-3 py-5 rounded-md border-none ${color} animate-pulse`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2 w-full">
          <div className="h-3 w-24 rounded bg-white/35" />
          <div className="h-6 w-20 rounded bg-white/45" />
        </div>

        <div className="bg-white/65 sm:p-2 p-1 rounded-md">
          <div className="size-7 rounded bg-white/80" />
        </div>
      </div>
    </div>
  );
}

async function getLeadsStatsProvider(startDate?: string, endDate?: string) {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await apiClient.get<LeadsStatsResponse>(
    "/api/admin/leads/stats",
    { params }
  );

  return response.data;
}

async function getAdminLeadsProvider(filters: Record<string, any>) {
  const response = await apiClient.get<AdminLeadsResponse>("/api/admin/leads", {
    params: filters,
  });

  return response.data;
}

const formatTitleCase = (value: string) =>
  value
    .replace(/[_-]/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

const getLifecycleUi = (lifecycleStatus?: string) => {
  switch (lifecycleStatus) {
    case "initial_contact":
      return { status: "Initial Contact", statusColor: "blue" };
    case "requirements_gathered":
      return { status: "Requirements Gathered", statusColor: "blue" };
    case "proposal_sent":
      return { status: "Proposal Sent", statusColor: "purple" };
    case "negotiation":
      return { status: "Negotiation", statusColor: "orange" };
    case "deal_closed":
      return { status: "Deal Closed", statusColor: "green" };
    case "payment_done":
      return { status: "Payment Done", statusColor: "green" };
    case "converted_to_po":
      return { status: "Converted to PO", statusColor: "green" };
    case "sent_to_admin":
      return { status: "Sent to Admin", statusColor: "purple" };
    default:
      return {
        status: lifecycleStatus
          ? formatTitleCase(lifecycleStatus)
          : "Initial Contact",
        statusColor: "blue",
      };
  }
};

export default function LeadsPage() {
  const [buildingType, setBuildingType] = useState("all");
  const [projectValue, setProjectValue] = useState("all");
  const [assignments, setAssignments] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [period, setPeriod] = useState<Period>("All Time");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const queryClient = useQueryClient();
  const exportMutation = useExportLeadsMutation();

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleUpsert = ({ lead }: { lead: any }) => {
      // Safely update all cached pages/filters for the admin list
      queryClient.setQueriesData({ queryKey: ["leads", "admin", "list"] }, (oldData: any) => {
        if (!oldData || !oldData.data || !oldData.data.leads) return oldData;
        const list = oldData.data.leads;
        const idx = list.findIndex((x: any) => String(x._id) === String(lead._id));
        
        let nextList = [...list];
        if (idx === -1) {
          nextList = [lead, ...nextList];
        } else {
          nextList[idx] = lead;
        }
        
        return {
          ...oldData,
          data: {
            ...oldData.data,
            leads: nextList
          }
        };
      });
    };

    socket.on('lead_list_created', handleUpsert);
    socket.on('lead_list_updated', handleUpsert);

    return () => {
      socket.off('lead_list_created', handleUpsert);
      socket.off('lead_list_updated', handleUpsert);
    };
  }, [socket, queryClient]);

  const handleExport = () => {
    exportMutation.mutate(undefined, {
      onSuccess: (res) => {
        if (res?.data?.fileUrl) {
          window.open(res.data.fileUrl, "_blank");
          toast.success("Export successful!");
        } else {
          toast.error("Export failed: No file URL returned");
        }
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to export leads");
      },
    });
  };

  const dateRangeObj = useMemo(() => {
    const formatDate = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    if (dateRange?.from && dateRange?.to) {
      return {
        startDate: formatDate(dateRange.from),
        endDate: formatDate(dateRange.to),
      };
    }

    if (period === "All Time") {
      return { startDate: undefined, endDate: undefined };
    }

    let start = new Date();
    let end = new Date();
    
    if (period === "Today") {
      // Keep start and end as today
    } else if (period === "Week") {
      const day = start.getDay() || 7; // Make Sunday 7
      start.setDate(start.getDate() - day + 1);
      end.setDate(end.getDate() - day + 7);
    } else if (period === "Month") {
      start = new Date(start.getFullYear(), start.getMonth(), 1);
      end = new Date(end.getFullYear(), end.getMonth() + 1, 0);
    }

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  }, [period, dateRange]);

  const { data: leadsStatsResponse, isLoading: isLeadsStatsLoading } = useQuery(
    {
      queryKey: ["leads", "admin", "stats", dateRangeObj.startDate, dateRangeObj.endDate],
      queryFn: () => getLeadsStatsProvider(dateRangeObj.startDate, dateRangeObj.endDate),
      staleTime: 60 * 1000,
    },
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, buildingType, projectValue, assignments, statusFilter, dateRangeObj]);

  const apiFilters = useMemo(() => {
    const f: Record<string, any> = {
      page,
      limit,
      startDate: dateRangeObj.startDate,
      endDate: dateRangeObj.endDate,
    };

    if (debouncedSearch) f.search = debouncedSearch;

    if (buildingType !== "all") {
      f.buildingType = buildingType;
    }

    if (projectValue !== "all") {
      if (projectValue === "small") {
        f.quoteValueMax = 50000;
      } else if (projectValue === "medium") {
        f.quoteValueMin = 50000;
        f.quoteValueMax = 200000;
      } else if (projectValue === "large") {
        f.quoteValueMin = 200000;
      }
    }

    if (assignments !== "all") {
      f.isHandedToSales = assignments === "assigned";
    }

    if (statusFilter !== "all") {
      f.lifecycleStatus = statusFilter;
    }

    return f;
  }, [page, limit, dateRangeObj, debouncedSearch, buildingType, projectValue, assignments, statusFilter]);

  const { data: leadsResponse, isLoading: isLeadsLoading } = useQuery({
    queryKey: ["leads", "admin", "list", apiFilters],
    queryFn: () => getAdminLeadsProvider(apiFilters),
    staleTime: 60 * 1000,
  });

  const leadsStats = leadsStatsResponse?.data;

  const leads: LeadTableRow[] = (leadsResponse?.data?.leads ?? []).map(
    (lead) => {
      const assignedToName = lead.assignedSales?.name ?? "";
      const lifecycleUi = getLifecycleUi(lead.lifecycleStatus);

      return {
        id: lead.jobId ?? lead._id,
        backendId: lead._id,
        customerName: lead.customerId ? `${lead.customerId.firstName || ''} ${lead.customerId.lastName || ''}`.trim() || 'Unknown Customer' : 'Unknown Customer',
        name: lead.projectName || "",
        workshop: lead.buildingType
          ? formatTitleCase(lead.buildingType)
          : "Not set",
        category: lead.location?.trim() ? lead.location : "Not set",
        assignedTo: assignedToName || null,
        assignedToName,
        assignmentStatus: assignedToName ? "1 person assigned" : "Assign",
        score: lead.leadScoring?.score ?? 0,
        progress: 0,
        progressStep: "Step 0/7",
        status: lifecycleUi.status,
        statusColor: lifecycleUi.statusColor,
        quoteValue: formatCurrency(lead.quoteValue ?? 0),
        chatCount: 0,
        createdAt: new Date(lead.createdAt),
      };
    },
  );

  const handleSelectAll = (checked: boolean, listToSelect: LeadTableRow[]) => {
    if (checked) {
      setSelectedLeads(listToSelect.map((lead) => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads((s) => [...s, id]);
    } else {
      setSelectedLeads((s) => s.filter((leadId) => leadId !== id));
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score < 30) return "bg-blue-500";
    if (score < 50) return "bg-green-500";
    if (score < 80) return "bg-amber-500";
    return "bg-red-500";
  };

  const getScoreTextColorClass = (score: number) => {
    if (score < 30) return "text-blue-600";
    if (score < 50) return "text-green-600";
    if (score < 80) return "text-amber-600";
    return "text-red-600";
  };

  const getStatusBadgeColor = (color: string) => {
    const colors: Record<string, string> = {
      purple: "bg-purple-100 text-purple-700",
      orange: "bg-orange-100 text-orange-700",
      green: "bg-green-100 text-green-700",
      blue: "bg-blue-100 text-blue-700",
    };
    return colors[color] || "bg-gray-100 text-gray-700";
  };

  // Helper to parse numeric quote value
  const parseQuoteValue = (q?: string) =>
    Number((q || "").replace(/[^\d]/g, "") || 0);

  // Helper to check if a date matches the selected period
  const isInPeriod = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const leadDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    if (period === "Today") {
      return leadDate.getTime() === today.getTime();
    } else if (period === "Week") {
      const day = today.getDay() || 7;
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - day + 1);
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() - day + 7);
      return leadDate >= startOfWeek && leadDate <= endOfWeek;
    } else if (period === "Month") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return leadDate >= startOfMonth && leadDate <= endOfMonth;
    }
    return true;
  };

  const isInDateRange = (date: Date) => {
    if (!dateRange?.from && !dateRange?.to) return true;

    const leadDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const from = dateRange.from
      ? new Date(
          dateRange.from.getFullYear(),
          dateRange.from.getMonth(),
          dateRange.from.getDate(),
        )
      : undefined;
    const to = dateRange.to
      ? new Date(
          dateRange.to.getFullYear(),
          dateRange.to.getMonth(),
          dateRange.to.getDate(),
        )
      : from;

    if (from && leadDate < from) return false;
    if (to && leadDate > to) return false;
    return true;
  };

  const filteredLeads = leads;

  return (
    <>
      <FilterTabs
        initialPeriod={period}
        onPeriodChange={(newPeriod) => setPeriod(newPeriod)}
      />
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <TitleSubtitle title="Leads" subtitle="Assign and view leads" />
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            className="max-w-xs bg-white"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLeadsStatsLoading ? (
            <>
              {[
                "bg-blue-600",
                "bg-green-600",
                "bg-yellow-500",
                "bg-orange-500",
              ].map((color, index) => (
                <StatCardSkeleton key={index} color={color} />
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Leads"
                value={String(leadsStats?.total ?? 0)}
                color="bg-blue-600"
                icon={<Users className="h-5 w-5 text-blue-600" />}
              />
              <StatCard
                title="Assigned"
                value={String(leadsStats?.assigned ?? 0)}
                color="bg-green-600"
                icon={<UserCheck className="h-5 w-5 text-green-600" />}
              />
              <StatCard
                title="Unassigned"
                value={String(leadsStats?.unassigned ?? 0)}
                color="bg-yellow-500"
                icon={<UserX className="h-5 w-5 text-yellow-600" />}
              />
              <StatCard
                title="Unopened Message"
                value={String(leadsStats?.unreadMessages ?? 0)}
                color="bg-orange-500"
                icon={<Mail className="h-5 w-5 text-orange-600" />}
              />
            </>
          )}
        </div>

        {/* Action Buttons and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <Link to="/leads/add" className="inline-block">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </Link>

            <ImportLeadsDialog />
            <Button
              variant="outline"
              className="bg-white"
              onClick={handleExport}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export Data
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full bg-white"
              />
            </div>
            <Select value={buildingType} onValueChange={setBuildingType}>
              <SelectTrigger className="w-full sm:w-40 bg-white">
                <SelectValue placeholder="Building types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="arch-buildings">Arch Buildings</SelectItem>
                <SelectItem value="aviation">Aviation</SelectItem>
                <SelectItem value="carports">Carports</SelectItem>
                <SelectItem value="workshops">Workshops</SelectItem>
                <SelectItem value="agricultural">Agricultural</SelectItem>
                <SelectItem value="warehouses">Warehouses</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="sales-storage">Sales Storage</SelectItem>
                <SelectItem value="barndominiums">Barndominiums</SelectItem>
                <SelectItem value="garages">Garages</SelectItem>
              </SelectContent>
            </Select>

            <Select value={projectValue} onValueChange={setProjectValue}>
              <SelectTrigger className="w-full sm:w-40 bg-white">
                <SelectValue placeholder="Project value" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="small">
                  Small projects (&lt;$50,000)
                </SelectItem>
                <SelectItem value="medium">
                  Medium ($50,000 - $200,000)
                </SelectItem>
                <SelectItem value="large">Large (&gt;$200,000)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={assignments} onValueChange={setAssignments}>
              <SelectTrigger className="w-full sm:w-40 bg-white">
                <SelectValue placeholder="All Assignments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="initial_contact">Initial Contact</SelectItem>
                <SelectItem value="requirements_gathered">Requirements Gathered</SelectItem>
                <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="deal_closed">Deal Closed</SelectItem>
                <SelectItem value="payment_done">Payment Done</SelectItem>
                <SelectItem value="converted_to_po">Converted to PO</SelectItem>
                <SelectItem value="sent_to_admin">Sent to Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Card className="p-0">
          <CardContent className="p-0">
            <div className="overflow-y-auto">
              <Table>
                <TableHeader className="bg-gray-50 border-b">
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="px-4 py-3 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredLeads.length > 0 &&
                          selectedLeads.length === filteredLeads.length
                        }
                        onChange={(e) =>
                          handleSelectAll(e.target.checked, filteredLeads)
                        }
                        className="rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Lead Info
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Score
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Quote Value
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Chat
                    </TableHead>
                    <TableHead className="px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {isLeadsLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="px-6 py-8 text-center text-sm text-gray-500"
                      >
                        Loading leads...
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredLeads.map((lead, index) => (
                    <TableRow
                      key={lead.id + index}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={(e) =>
                            handleSelectLead(lead.id, e.target.checked)
                          }
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-[13px] text-gray-900 text-nowrap whitespace-nowrap">
                            {lead.customerName}
                          </span>
                          {lead.name && (
                            <span className="text-[12px] text-gray-500 text-nowrap mt-0.5">
                              {lead.name}
                            </span>
                          )}
                          <span className="text-[12px] text-gray-500 text-nowrap mt-0.5">
                            {lead.id}
                          </span>
                          <span className="text-[12px] text-gray-500 text-nowrap mt-0.5">
                            {lead.workshop} · {lead.category}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {lead.assignedTo ? (
                            <>
                              <Avatar className="h-7 w-7 bg-green-50 border border-green-100">
                                <AvatarFallback className="text-[11px] font-semibold text-green-700">
                                  {lead.assignedToName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-[13px] font-medium text-gray-900 text-nowrap whitespace-nowrap">
                                  {lead.assignedToName}
                                </span>
                                <span className="text-[11px] text-gray-500">
                                  {lead.assignmentStatus}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <Avatar className="h-7 w-7 bg-green-50 border border-green-100">
                                <AvatarFallback className="text-[11px] text-green-600">
                                  <UserPlus className="h-3.5 w-3.5" />
                                </AvatarFallback>
                              </Avatar>
                              <AssignSalesDialog
                                leadId={lead.backendId!}
                                trigger={
                                  <span className="text-[13px] text-blue-600 font-medium cursor-pointer hover:underline">
                                    {lead.assignmentStatus}
                                  </span>
                                }
                              />
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-4 w-32 rounded-full bg-gray-200 overflow-hidden flex items-center">
                            <div
                              className={`absolute left-0 top-0 h-full rounded-full ${getScoreColorClass(
                                lead.score,
                              )}`}
                              style={{
                                width: `${Math.max(0, Math.min(100, lead.score))}%`,
                              }}
                            />
                            <span
                              className={`absolute right-3 text-[11px] font-bold ${getScoreTextColorClass(
                                lead.score,
                              )}`}
                            >
                              {lead.score}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge
                          className={`${getStatusBadgeColor(lead.statusColor)} border-none shadow-none px-3 py-1 font-medium`}
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-bold text-gray-900 text-[13px]">
                        {lead.quoteValue}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <ChatDialog
                          lead={lead}
                          trigger={
                            <div className="relative inline-flex items-center">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="rounded-full border border-blue-100 text-blue-600 hover:bg-blue-100 h-8 text-[12px] px-3 font-medium bg-blue-50/50"
                              >
                                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                Chat
                              </Button>
                              {lead.chatCount > 0 && (
                                <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                  {lead.chatCount}
                                </div>
                              )}
                            </div>
                          }
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-3 text-indigo-700">
                          <Link to={`/leads/${lead.backendId}`}>
                            <Eye className="w-4 h-4 cursor-pointer hover:text-indigo-900 transition-colors" />
                          </Link>
                          <AssignSalesDialog
                            leadId={lead.backendId!}
                            trigger={
                              <UserPlus className="w-4 h-4 cursor-pointer hover:text-indigo-900 transition-colors" />
                            }
                          />
                          {/* <CreateQuotationDialog
                            leadData={{ name: lead.name, id: lead.backendId! }}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 h-8 w-8"
                              >
                                <Pen className="h-4 w-4 text-emerald-600" />
                              </Button>
                            }
                          /> */}
                          {/* <CreateQuotationDialog
                            leadData={{ name: lead.name, id: lead.id }}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 h-8 w-8"
                              >
                                <FileText className="h-4 w-4 text-gray-600" />
                              </Button>
                            }
                          /> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLeadsLoading && filteredLeads.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="px-6 py-8 text-center text-sm text-gray-500"
                      >
                        No leads match your search or filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            {!isLeadsLoading && leadsResponse?.data?.total ? (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(page - 1) * limit + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(page * limit, leadsResponse.data.total)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {leadsResponse?.data?.total || 0}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page * limit >= (leadsResponse?.data?.total || 0)}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <SuccessDialog
          open={successOpen}
          onClose={() => setSuccessOpen(false)}
          title="Data exported successfully"
        />
      </div>
    </>
  );
}
