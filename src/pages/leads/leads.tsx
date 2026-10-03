import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import type { DateRange } from "react-day-picker";
import {
  UserPlus,
  Download,
  Users,
  UserCheck,
  UserX,
  Mail,
  Search,
  Loader2,
  Archive,
} from "lucide-react";
import {
  useExportLeadsMutation,
  useAdminLeadsQuery,
  useAdminLeadsStatsQuery,
  useArchivedLeadsQuery,
  useLeadsSocketSync,
} from "@/modules/leads/leads.hooks";
import { type GetArchivedLeadsParams } from "@/modules/leads/leads.api";
import {
  LEAD_LIFECYCLE_STATUSES,
  LEAD_LIFECYCLE_STEPS,
  getLeadLifecycleStatusLabel,
  getLeadLifecycleStepId,
} from "@/modules/leads/lead-lifecycle";
import { toast } from "sonner";
import ImportLeadsDialog from "@/components/leads/import-leads-dialog";
import BuildingTypeSelector from "@/components/leads/building-type-selector";
import BusinessUnitSelector from "@/components/leads/business-unit-selector";
import { formatBusinessUnit } from "@/modules/leads/business-unit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/ui/stat-card";
import LeadsList, { type LeadTableRow } from "@/components/leads/leads-list";

import SuccessDialog from "@/components/success-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FilterTabs, { type Period } from "@/components/FilterTabs";
import DateRangeFilter from "@/components/ui/date-range-filter";
import { cn } from "@/lib/utils";

type StatCardSkeletonProps = {
  color: string;
};

function StatCardSkeleton({ color }: StatCardSkeletonProps) {
  return (
    <div
      className={cn("sm:p-5 px-3 py-5 rounded-md border-none animate-pulse", color)}
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

export default function LeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "archived" ? "archived" : "active";
  const isArchived = activeTab === "archived";

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [buildingType, setBuildingType] = useState("all");
  const [businessUnit, setBusinessUnit] = useState("all");
  const [projectValue, setProjectValue] = useState("all");
  const [assignments, setAssignments] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [period, setPeriod] = useState<Period>("All Time");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const exportMutation = useExportLeadsMutation();

  // Mount extracted real-time socket sync
  useLeadsSocketSync();

  const handleTabChange = (tab: "active" | "archived") => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === "archived") {
        next.set("tab", "archived");
      } else {
        next.delete("tab");
      }
      return next;
    });
    setPage(1);
    setSelectedLeads([]);
  };

  const isFilterApplied = isArchived
    ? searchQuery !== ""
    : searchQuery !== "" ||
      buildingType !== "all" ||
      businessUnit !== "all" ||
      projectValue !== "all" ||
      assignments !== "all" ||
      statusFilter !== "all" ||
      dateRange !== undefined;

  const handleClearFilters = () => {
    setSearchQuery("");
    setBuildingType("all");
    setBusinessUnit("all");
    setProjectValue("all");
    setAssignments("all");
    setStatusFilter("all");
    setPeriod("All Time");
    setDateRange(undefined);
    setPage(1);
  };

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
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error?.response?.data?.message || "Failed to export leads");
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
      const day = start.getDay() || 7;
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

  const { data: leadsStatsResponse, isLoading: isLeadsStatsLoading } =
    useAdminLeadsStatsQuery(dateRangeObj.startDate, dateRangeObj.endDate);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const apiFilters = useMemo(() => {
    const f: Record<string, unknown> = {
      page,
      limit,
      startDate: dateRangeObj.startDate,
      endDate: dateRangeObj.endDate,
    };

    if (debouncedSearch) f.search = debouncedSearch;

    if (buildingType !== "all") {
      f.buildingType = buildingType;
    }

    if (businessUnit !== "all") {
      f.businessUnit = businessUnit;
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
  }, [page, limit, dateRangeObj, debouncedSearch, buildingType, businessUnit, projectValue, assignments, statusFilter]);

  const { data: leadsResponse, isLoading: isLeadsLoading } =
    useAdminLeadsQuery(apiFilters, { enabled: !isArchived });

  const archivedParams = useMemo(() => {
    const params: GetArchivedLeadsParams = {
      page,
      limit,
    };
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    if (businessUnit !== "all") {
      params.businessUnit = businessUnit;
    }
    return params;
  }, [page, limit, debouncedSearch, businessUnit]);

  const { data: archivedListResponse, isLoading: isArchivedLoading } =
    useArchivedLeadsQuery(archivedParams, { enabled: isArchived });

  const { data: archivedCountResponse } = useArchivedLeadsQuery(
    { page: 1, limit: 1 },
    { enabled: !isArchived }
  );

  const totalArchivedCount = isArchived
    ? archivedListResponse?.data?.total
    : archivedCountResponse?.data?.total;

  const leadsStats = leadsStatsResponse?.data;

  const currentLeadsData = isArchived
    ? archivedListResponse?.data?.leads ?? []
    : leadsResponse?.data?.leads ?? [];

  const leads: LeadTableRow[] = currentLeadsData.map(
    (lead) => {
      const assignedToName = lead.assignedSales?.name ?? "";

      const stepId = getLeadLifecycleStepId(lead.lifecycleStatus);
      const totalSteps = LEAD_LIFECYCLE_STEPS.length;
      const progressPercent = Math.round((stepId / totalSteps) * 100);

      return {
        id: lead.jobId ?? lead._id,
        backendId: lead._id,
        jobId: lead.jobId,
        customerName: lead.customerId
          ? `${lead.customerId.firstName || ""}`.trim() + (lead.customerId.lastName ? ` ${lead.customerId.lastName}` : "") || "Unknown Customer"
          : "Unknown Customer",
        name: lead.projectName || "",
        businessUnit: lead.businessUnit,
        businessUnitLabel: lead.businessUnitLabel || formatBusinessUnit(lead.businessUnit),
        workshop: lead.buildingType
          ? formatTitleCase(lead.buildingType)
          : "Not set",
        category: lead.location?.trim() ? lead.location : "Not set",
        assignedTo: assignedToName || null,
        assignedToName,
        assignmentStatus: assignedToName ? "1 person assigned" : "Assign",
        score: lead.leadScoring?.score ?? 0,
        progress: progressPercent,
        progressStep: `Step ${stepId}/${totalSteps}`,
        lifecycleStatus: lead.lifecycleStatus,
        status: getLeadLifecycleStatusLabel(lead.lifecycleStatus),
        quoteValue: formatCurrency(lead.quoteValue ?? 0),
        chatCount: 0,
        createdAt: new Date(lead.createdAt),
        isArchived: lead.isArchived,
        archiveReason: lead.archiveReason,
        archivedAt: lead.archivedAt,
      };
    },
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(leads.map((lead) => lead.id));
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

  return (
    <>
      {!isArchived && (
        <FilterTabs
          initialPeriod={period}
          onPeriodChange={(newPeriod) => {
            setPeriod(newPeriod);
            setPage(1);
          }}
        />
      )}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header with Top Tab List */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl text-gray-900 font-semibold">
              {isArchived ? "Archived Leads" : "Assigned Leads"}
            </h1>
            <p className="text-gray-500 mt-1">
              {isArchived
                ? "Review non-viable leads removed from the active pipeline and restore them if needed."
                : "Manage your assigned leads and track their progress."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {!isArchived && (
              <DateRangeFilter
                value={dateRange}
                onChange={(range) => {
                  setDateRange(range);
                  setPage(1);
                }}
                className="max-w-xs bg-white"
              />
            )}
            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg w-fit self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleTabChange("active")}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer",
                  !isArchived ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                )}
              >
                Active Leads
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("archived")}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer",
                  isArchived ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Archive className="h-4 w-4" />
                <span>Archived Leads</span>
                {totalArchivedCount !== undefined && totalArchivedCount > 0 && (
                  <span
                    className={cn(
                      "ml-1 px-1.5 py-0.5 text-xs rounded-full",
                      isArchived ? "bg-amber-100 text-amber-800 font-semibold" : "bg-gray-200 text-gray-700"
                    )}
                  >
                    {totalArchivedCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards (Active only) */}
        {!isArchived && (
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
        )}

        {/* Action Buttons and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {!isArchived && (
              <>
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
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={isArchived ? "Search archived leads..." : "Search leads..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full bg-white"
              />
            </div>
            {!isArchived && (
              <>
                <BuildingTypeSelector
                  value={buildingType}
                  onChange={(val) => {
                    setBuildingType(val);
                    setPage(1);
                  }}
                  includeAll
                  allLabel="All"
                  triggerClassName="w-full sm:w-40 bg-white"
                  placeholder="Building types"
                />

                <BusinessUnitSelector
                  value={businessUnit}
                  onChange={(val) => {
                    setBusinessUnit(val);
                    setPage(1);
                  }}
                  includeAll
                  allLabel="All Business Units"
                  includeNone
                  noneLabel="Not set"
                  placeholder="Business Unit"
                  triggerClassName="w-full sm:w-44 bg-white"
                />

                <Select
                  value={projectValue}
                  onValueChange={(val) => {
                    setProjectValue(val);
                    setPage(1);
                  }}
                >
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

                <Select
                  value={assignments}
                  onValueChange={(val) => {
                    setAssignments(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40 bg-white">
                    <SelectValue placeholder="All Assignments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignments</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40 bg-white">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {LEAD_LIFECYCLE_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {isFilterApplied && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Table & Pagination */}
        <LeadsList
          leads={leads}
          isLoading={isArchived ? isArchivedLoading : isLeadsLoading}
          selectedLeads={selectedLeads}
          onSelectLead={handleSelectLead}
          onSelectAll={handleSelectAll}
          page={page}
          limit={limit}
          total={isArchived ? (archivedListResponse?.data?.total || 0) : (leadsResponse?.data?.total || 0)}
          onPageChange={setPage}
          isArchived={isArchived}
        />

        <SuccessDialog
          open={successOpen}
          onClose={() => setSuccessOpen(false)}
          title="Data exported successfully"
        />
      </div>
    </>
  );
}

