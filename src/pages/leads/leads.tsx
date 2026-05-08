import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
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
} from "lucide-react";
import ImportLeadsDialog from "@/components/leads/import-leads-dialog";
import AssignSalesDialog from "@/components/leads/assign-sales-dialog";
import CreateQuotationDialog from "@/components/leads/create-quotation-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import LeadDetailDialog from "@/components/leads/lead-detail-dialog";
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

async function getLeadsStatsProvider() {
  const response = await apiClient.get<LeadsStatsResponse>(
    "/api/admin/leads/stats",
  );

  return response.data;
}

async function getAdminLeadsProvider(page = 1, limit = 20) {
  const response = await apiClient.get<AdminLeadsResponse>("/api/admin/leads", {
    params: { page, limit },
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
    case "proposal_sent":
      return { status: "Proposal sent", statusColor: "purple" };
    case "quotation_sent":
      return { status: "Quotation Sent", statusColor: "orange" };
    case "closed_won":
      return { status: "Closed", statusColor: "green" };
    case "negotiation":
      return { status: "Negotiation", statusColor: "orange" };
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
  const [period, setPeriod] = useState<Period>("Month");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);
  const page = 1;
  const limit = 20;
  const { data: leadsStatsResponse, isLoading: isLeadsStatsLoading } = useQuery(
    {
      queryKey: ["leads", "admin", "stats"],
      queryFn: getLeadsStatsProvider,
      staleTime: 60 * 1000,
    },
  );
  const { data: leadsResponse, isLoading: isLeadsLoading } = useQuery({
    queryKey: ["leads", "admin", "list", page, limit],
    queryFn: () => getAdminLeadsProvider(page, limit),
    staleTime: 60 * 1000,
  });

  const leadsStats = leadsStatsResponse?.data;
  const leads: LeadTableRow[] = (leadsResponse?.data.leads ?? []).map(
    (lead) => {
      const lifecycleUi = getLifecycleUi(lead.lifecycleStatus);
      const assignedToName = lead.assignedSales?.name ?? "";

      return {
        id: lead.customerId?.customerId ?? "",
        backendId: lead._id,
        name: lead.customerId?.firstName ?? "Unknown Customer",
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
  // const [searchQuery, setSearchQuery] = useState("");

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
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      return leadDate >= weekAgo && leadDate <= today;
    } else if (period === "Month") {
      const monthAgo = new Date(today);
      monthAgo.setDate(today.getDate() - 30);
      return leadDate >= monthAgo && leadDate <= today;
    }
    return true;
  };

  // Compute filtered leads based on search + filters
  const filteredLeads = leads.filter((lead) => {
    // Period filter
    if (!isInPeriod(lead.createdAt)) {
      return false;
    }

    // Search
    // const q = searchQuery.trim().toLowerCase();
    // if (q) {
    //   const hay =
    //     `${lead.name} ${lead.id} ${lead.workshop} ${lead.category} ${lead.assignedToName}`.toLowerCase();
    //   if (!hay.includes(q)) return false;
    // }

    // Building type filter (normalize)
    if (buildingType !== "all") {
      const normalized = buildingType.replace(/-/g, " ").replace(/s$/, "");
      if (
        !lead.workshop.toLowerCase().includes(normalized.toLowerCase().trim())
      ) {
        return false;
      }
    }

    // Project value filter
    if (projectValue !== "all") {
      const value = parseQuoteValue(lead.quoteValue);
      if (projectValue === "small" && !(value < 50000)) return false;
      if (projectValue === "medium" && !(value >= 50000 && value <= 200000))
        return false;
      if (projectValue === "large" && !(value > 200000)) return false;
    }

    // Assignments filter
    if (assignments !== "all") {
      if (assignments === "assigned" && !lead.assignedTo) return false;
      if (assignments === "unassigned" && lead.assignedTo) return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      const s = lead.status.toLowerCase();
      if (statusFilter === "proposal" && !s.includes("proposal")) return false;
      if (statusFilter === "quotation" && !s.includes("quotation"))
        return false;
      if (statusFilter === "closed" && !s.includes("closed")) return false;
    }

    return true;
  });

  return (
    <>
      <FilterTabs
        initialPeriod={period}
        onPeriodChange={(newPeriod) => setPeriod(newPeriod)}
      />
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-1">Assign and view leads</p>
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
              onClick={() => setSuccessOpen(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <Select value={buildingType} onValueChange={setBuildingType}>
              <SelectTrigger className="w-full sm:w-40 bg-white">
                <SelectValue placeholder="Building types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="garages">Garages</SelectItem>
                <SelectItem value="workshops">Workshops</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="sales-storage">Sales Storage</SelectItem>
                <SelectItem value="arch-buildings">Arch Buildings</SelectItem>
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
                <SelectItem value="proposal">Proposal sent</SelectItem>
                <SelectItem value="quotation">Quotation Sent</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
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
                    <TableHead className="px-4 py-3 text-left">
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
                    <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead Info
                    </TableHead>
                    <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </TableHead>
                    <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </TableHead>
                    <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote Value
                    </TableHead>
                    <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chat
                    </TableHead>
                    <TableHead className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <TableCell className="px-3 py-2 sm:px-4 sm:py-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={(e) =>
                            handleSelectLead(lead.id, e.target.checked)
                          }
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 text-nowrap whitespace-nowrap">
                            {lead.name}
                          </span>
                          <span className="text-sm text-gray-500 text-nowrap">
                            {lead.id}
                          </span>
                          <span className="text-sm text-gray-500 text-nowrap">
                            {lead.workshop} · {lead.category}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="">
                        <div className="flex items-center gap-2">
                          {lead.assignedTo ? (
                            <>
                              <Avatar className="h-6 w-6 bg-green-100">
                                <AvatarFallback className="text-xs text-green-700">
                                  {lead.assignedToName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 text-nowrap whitespace-nowrap">
                                  {lead.assignedToName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {lead.assignmentStatus}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <Avatar className="h-6 w-6 bg-gray-100">
                                <AvatarFallback className="text-xs text-gray-500">
                                  <UserPlus className="h-3 w-3" />
                                </AvatarFallback>
                              </Avatar>
                              <AssignSalesDialog
                                trigger={
                                  <span className="text-sm text-green-600 font-medium cursor-pointer">
                                    {lead.assignmentStatus}
                                  </span>
                                }
                              />
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="">
                        <div className="min-w-32">
                          <div className="relative h-4 w-full rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getScoreColorClass(
                                lead.score,
                              )}`}
                              style={{
                                width: `${Math.max(0, Math.min(100, lead.score))}%`,
                              }}
                            />
                            <span
                              className={`absolute inset-0 flex items-center justify-end pr-2 text-xs font-semibold ${getScoreTextColorClass(
                                lead.score,
                              )}`}
                            >
                              {lead.score}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="">
                        <Badge
                          className={getStatusBadgeColor(lead.statusColor)}
                          variant="secondary"
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="">
                        <span className="font-medium text-gray-900">
                          {lead.quoteValue}
                        </span>
                      </TableCell>
                      <TableCell className="">
                        <ChatDialog
                          lead={lead}
                          trigger={
                            <Button
                              size="sm"
                              className="relative rounded-full border-blue-200  text-blue-700 hover:bg-blue-100 text-xs h-6 bg-blue-50"
                            >
                              <MessageSquare className="size-3 text-blue-500" />
                              Chat
                              {lead.chatCount > 0 && (
                                <span className="absolute -top-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-[11px] font-semibold leading-none text-white shadow-sm">
                                  {lead.chatCount}
                                </span>
                              )}
                            </Button>
                          }
                        />
                      </TableCell>
                      <TableCell className="">
                        <div className="flex items-center gap-1">
                          <LeadDetailDialog
                            lead={lead}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 h-8 w-8"
                              >
                                <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                            }
                          />
                          <AssignSalesDialog
                            trigger={
                              <Button variant="ghost" size="icon">
                                <UserPlus className="text-green-600" />
                              </Button>
                            }
                          />
                          <CreateQuotationDialog
                            leadData={{ name: lead.name, id: lead.id }}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 h-8 w-8"
                              >
                                <Pen className="h-4 w-4 text-emerald-600" />
                              </Button>
                            }
                          />
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
