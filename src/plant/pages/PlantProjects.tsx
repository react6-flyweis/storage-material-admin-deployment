import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { DateRange } from "react-day-picker";
import {
  Search,
  Eye,
  Briefcase,
  Activity,
  Clock,
  Building2,
  FolderGit2,
  XCircle,
} from "lucide-react";
import {
  usePlantProjectsQuery,
  usePlantProjectsStatsQuery,
} from "@/modules/plant/projects.hooks";
import {
  getPlantLifecycleStatusConfig,
  getPlantLifecycleStageIndex,
  PLANT_LIFECYCLE_STATUS_OPTIONS,
  PLANT_LIFECYCLE_STAGES,
} from "@/modules/plant/projects.lifecycle";
import BuildingTypeSelector from "@/components/leads/building-type-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/ui/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FilterTabs, { type Period } from "@/components/FilterTabs";
import TitleSubtitle from "@/components/TitleSubtitle";
import DateRangeFilter from "@/components/ui/date-range-filter";
import Pagination from "@/components/Pagination";
import { cn } from "@/lib/utils";

type StatCardSkeletonProps = {
  color: string;
};

function StatCardSkeleton({ color }: StatCardSkeletonProps) {
  return (
    <div
      className={cn(
        "sm:p-5 px-3 py-5 rounded-md border-none animate-pulse",
        color,
      )}
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

export default function PlantProjects() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [buildingType, setBuildingType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [period, setPeriod] = useState<Period>("All Time");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const isFilterApplied =
    searchQuery !== "" ||
    buildingType !== "all" ||
    statusFilter !== "all" ||
    dateRange !== undefined;

  const handleClearFilters = () => {
    setSearchQuery("");
    setBuildingType("all");
    setStatusFilter("all");
    setPeriod("All Time");
    setDateRange(undefined);
    setPage(1);
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

    const start = new Date();
    const end = new Date();

    if (period === "Today") {
      // Keep start and end as today
    } else if (period === "Week") {
      const day = start.getDay() || 7;
      start.setDate(start.getDate() - day + 1);
      end.setDate(end.getDate() - day + 7);
    } else if (period === "Month") {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
    }

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  }, [period, dateRange]);

  const { data: statsResponse, isLoading: isStatsLoading } =
    usePlantProjectsStatsQuery(dateRangeObj.startDate, dateRangeObj.endDate);

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

    if (statusFilter !== "all") {
      f.lifecycleStatus = statusFilter;
    }

    return f;
  }, [
    page,
    limit,
    dateRangeObj,
    debouncedSearch,
    buildingType,
    statusFilter,
  ]);

  const { data: projectsResponse, isLoading: isProjectsLoading } =
    usePlantProjectsQuery(apiFilters);

  const stats = statsResponse?.data;
  const projectsData = projectsResponse?.data;
  const total = projectsData?.total || 0;

  const projects = useMemo(() => {
    const rawProjects = projectsData?.projects || projectsData?.leads || [];
    return rawProjects.map((item) => {
      const backendId = item._id || item.id || "";
      const displayId = item.jobId || item.projectId || backendId;

      let customerName = "Unknown Customer";
      if (item.customerName) {
        customerName = item.customerName;
      } else if (
        typeof item.customerId === "object" &&
        item.customerId !== null
      ) {
        const c = item.customerId;
        customerName =
          `${c.firstName || ""} ${c.lastName || ""}`.trim() ||
          c.company ||
          "Unknown Customer";
      }

      const assignedToName =
        item.assignedSales?.name ||
        item.assignedToName ||
        item.assignedTo ||
        "";
      const statusValue =
        item.lifecycleStatus || item.status || "released_to_plant";
      const statusConfig = getPlantLifecycleStatusConfig(statusValue);
      const stepId = getPlantLifecycleStageIndex(statusValue);
      const totalSteps = PLANT_LIFECYCLE_STAGES.length;
      const progressPercent = Math.round((stepId / totalSteps) * 100);
      const score = item.leadScoring?.score ?? item.score ?? 0;
      const budgetValue = item.quoteValue ?? item.budget ?? item.totalCost ?? 0;

      return {
        id: displayId,
        backendId,
        customerName,
        projectName: item.projectName || item.name || "Untitled Project",
        buildingType: item.buildingType
          ? formatTitleCase(item.buildingType)
          : "Not set",
        location: item.location?.trim() ? item.location : "Not set",
        assignedToName,
        score,
        progress: progressPercent,
        progressStep: `Step ${stepId}/${totalSteps}`,
        lifecycleStatus: statusValue,
        statusLabel: statusConfig.label,
        badgeClassName: statusConfig.badgeClassName,
        quoteValue: formatCurrency(budgetValue),
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      };
    });
  }, [projectsData]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjects(projects.map((p) => p.backendId));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects((prev) => [...prev, id]);
    } else {
      setSelectedProjects((prev) => prev.filter((pId) => pId !== id));
    }
  };

  const isAllSelected =
    projects.length > 0 && selectedProjects.length === projects.length;

  return (
    <>
      <FilterTabs
        initialPeriod={period}
        onPeriodChange={(newPeriod) => {
          setPeriod(newPeriod);
          setPage(1);
        }}
      />
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <TitleSubtitle
            title="Plant Projects"
            subtitle="Track and manage plant projects, drawings, BOM, and manufacturing status"
          />
          <DateRangeFilter
            value={dateRange}
            onChange={(range) => {
              setDateRange(range);
              setPage(1);
            }}
            className="max-w-xs bg-white"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isStatsLoading ? (
            <>
              {[
                "bg-blue-600",
                "bg-emerald-600",
                "bg-amber-500",
                "bg-red-500",
              ].map((color, index) => (
                <StatCardSkeleton key={index} color={color} />
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Projects"
                value={String(stats?.totalProjects ?? total ?? 0)}
                color="bg-blue-600"
                icon={<Briefcase className="h-5 w-5 text-blue-600" />}
              />
              <StatCard
                title="Active Projects"
                value={String(stats?.activeProjects ?? 0)}
                color="bg-emerald-600"
                icon={<Activity className="h-5 w-5 text-emerald-600" />}
              />
              <StatCard
                title="Pending Customer Approval"
                value={String(stats?.pendingCustomerApproval ?? 0)}
                color="bg-amber-500"
                icon={<Clock className="h-5 w-5 text-amber-600" />}
              />
              <StatCard
                title="Cancelled Projects"
                value={String(stats?.cancelledProjects ?? 0)}
                color="bg-red-500"
                icon={<XCircle className="h-5 w-5 text-red-600" />}
              />
            </>
          )}
        </div>

        {/* Filters and Search Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects, ID, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full bg-white"
              />
            </div>

            <BuildingTypeSelector
              value={buildingType}
              onChange={(val) => {
                setBuildingType(val);
                setPage(1);
              }}
              includeAll
              allLabel="All Buildings"
              triggerClassName="w-full sm:w-44 bg-white"
              placeholder="Building types"
            />

            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-44 bg-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {PLANT_LIFECYCLE_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

        {/* Projects Table */}
        <Card className="p-0 border border-gray-200 shadow-sm overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 border-b">
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="px-4 py-3 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Project Info
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Building Type
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Location
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Stage / Progress
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Project Value
                    </TableHead>
                    <TableHead className="px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {isProjectsLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="px-6 py-12 text-center text-sm text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="size-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span>Loading plant projects...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!isProjectsLoading && projects.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="px-6 py-12 text-center text-sm text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FolderGit2 className="size-8 text-gray-400" />
                          <p className="font-medium text-gray-700">
                            No plant projects found
                          </p>
                          <p className="text-xs text-gray-400">
                            Try adjusting your search or filters.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!isProjectsLoading &&
                    projects.map((project, index) => (
                      <TableRow
                        key={project.backendId || project.id || index}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <TableCell className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedProjects.includes(
                              project.backendId,
                            )}
                            onChange={(e) =>
                              handleSelectProject(
                                project.backendId,
                                e.target.checked,
                              )
                            }
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[13px] text-gray-900 whitespace-nowrap">
                              {project.projectName}
                            </span>
                            <span className="text-[12px] text-gray-500 whitespace-nowrap mt-0.5">
                              {project.customerName}
                            </span>
                            <span className="font-mono text-[11px] text-blue-600 font-medium mt-0.5">
                              {project.id}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="size-3.5 text-gray-400" />
                            {project.buildingType}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">
                          {project.location}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex flex-col gap-1 w-32">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-gray-500">
                                {project.progressStep}
                              </span>
                              <span
                                className={cn(
                                  "font-bold",
                                  getScoreTextColorClass(project.progress),
                                )}
                              >
                                {project.progress}%
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  getScoreColorClass(project.progress),
                                )}
                                style={{
                                  width: `${Math.max(5, Math.min(100, project.progress))}%`,
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            className={cn(
                              project.badgeClassName,
                              "border shadow-none px-2.5 py-1 text-[11px] font-medium whitespace-nowrap",
                            )}
                          >
                            {project.statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 font-semibold text-gray-900 text-[13px] whitespace-nowrap">
                          {project.quoteValue}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`/plant/projects/${project.backendId}`)
                              }
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                              title="View Project Details"
                              aria-label="View Project Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Component */}
            <Pagination
              totalItems={total}
              currentPage={page}
              rowsPerPage={limit}
              rowsPerPageOptions={[10, 20, 50]}
              onPageChange={(newPage) => setPage(newPage)}
              onRowsPerPageChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
