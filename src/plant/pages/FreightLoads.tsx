import React from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Filter,
  Award,
  Truck,
  CheckCircle2,
  DollarSign,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useFreightStatsQuery,
  useFreightFiltersQuery,
  useFreightLoadsQuery,
} from "@/modules/plant/freight.hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { formatStatusLabel, getStatusBadgeStyle } from "./deliveryStatusConstants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FreightLoads() {
  const navigate = useNavigate();

  // Query state parameters
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [projectId, setProjectId] = React.useState("all");
  const [customerId, setCustomerId] = React.useState("all");
  const [carrierId, setCarrierId] = React.useState("all");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch stats and filters dropdown data
  const { data: statsResponse, isLoading: isStatsLoading } =
    useFreightStatsQuery();
  const { data: filtersResponse } = useFreightFiltersQuery();

  // Fetch main freight loads data
  const freightLoadsParams: Record<string, string | number> = {
    page,
    limit,
  };
  if (search.trim()) freightLoadsParams.search = search.trim();
  if (status && status !== "all") freightLoadsParams.status = status;
  if (projectId && projectId !== "all")
    freightLoadsParams.projectId = projectId;
  if (customerId && customerId !== "all")
    freightLoadsParams.customerId = customerId;
  if (carrierId && carrierId !== "all")
    freightLoadsParams.carrierId = carrierId;
  if (fromDate.trim()) freightLoadsParams.fromDate = fromDate.trim();
  if (toDate.trim()) freightLoadsParams.toDate = toDate.trim();

  const { data: loadsResponse, isLoading: isLoadsLoading } =
    useFreightLoadsQuery(freightLoadsParams);

  const stats = statsResponse?.data;
  const loads = loadsResponse?.data?.requests || [];
  const total = loadsResponse?.data?.total || 0;

  const fallbackFreightStatuses = [
    "requested",
    "bids_received",
    "awarded",
    "in_transit",
    "delivered",
    "resubmit_requested",
    "rejected",
    "expired",
  ];
  const statusesList =
    filtersResponse?.data?.statuses && filtersResponse.data.statuses.length > 0
      ? filtersResponse.data.statuses
      : fallbackFreightStatuses;
  const projectsList = filtersResponse?.data?.projects || [];
  const customersList = filtersResponse?.data?.customers || [];
  const carriersList = filtersResponse?.data?.carriers || [];

  const handleClearFilters = () => {
    setStatus("all");
    setProjectId("all");
    setCustomerId("all");
    setCarrierId("all");
    setFromDate("");
    setToDate("");
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const hasActiveFilters =
    status !== "all" ||
    projectId !== "all" ||
    customerId !== "all" ||
    carrierId !== "all" ||
    fromDate !== "" ||
    toDate !== "" ||
    search !== "";

  const getStatusBadge = (statusStr: string) => {
    const s = (statusStr || "").toLowerCase();
    switch (s) {
      case "awarded":
      case "selected":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
            Selected
          </span>
        );
      case "sent":
        return (
          <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-semibold rounded-full border border-sky-200">
            Sent
          </span>
        );
      case "submitted":
      case "bids_received":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
            Submitted
          </span>
        );
      case "resubmit_requested":
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
            Resubmit Requested
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full border border-red-200">
            Rejected
          </span>
        );
      case "expired":
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
            Expired
          </span>
        );
      case "requested":
        return (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">
            Requested
          </span>
        );
      case "material_prepared":
      case "loaded":
      case "picked_up":
      case "in_transit":
      case "staged":
      case "dispatched_to_site":
      case "delivered": {
        const style = getStatusBadgeStyle(s);
        return (
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${style.bg} ${style.text} ${style.border}`}
          >
            {formatStatusLabel(statusStr)}
          </span>
        );
      }
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full uppercase">
            {(statusStr || "").replace(/_/g, " ")}
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Freight Loads</h1>
          <p className="text-gray-500 mt-1">
            Track and manage freight loads and logistics status
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Awarded */}
        <div className="bg-white rounded-xl p-5 border-2 border-green-500 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-gray-500 text-sm font-medium z-10">
            Total Awarded
          </p>
          <div className="flex justify-between items-end z-10">
            {isStatsLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <h2 className="text-3xl font-bold text-slate-900">
                {stats?.totalLoads ?? 0}
              </h2>
            )}
            <Award className="w-8 h-8 text-green-500" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full -z-0 opacity-50" />
        </div>

        {/* In Transit */}
        <div className="bg-white rounded-xl p-5 border-2 border-orange-500 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-gray-500 text-sm font-medium z-10">In Transit</p>
          <div className="flex justify-between items-end z-10">
            {isStatsLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <h2 className="text-3xl font-bold text-slate-900">
                {stats?.inTransit ?? 0}
              </h2>
            )}
            <Truck className="w-8 h-8 text-orange-500" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-bl-full -z-0 opacity-50" />
        </div>

        {/* Delivered */}
        <div className="bg-white rounded-xl p-5 border-2 border-emerald-400 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-gray-500 text-sm font-medium z-10">Delivered</p>
          <div className="flex justify-between items-end z-10">
            {isStatsLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <h2 className="text-3xl font-bold text-slate-900">
                {stats?.delivered ?? 0}
              </h2>
            )}
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full -z-0 opacity-50" />
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-xl p-5 border-2 border-blue-800 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-gray-500 text-sm font-medium z-10">Total Spent</p>
          <div className="flex justify-between items-end z-10">
            {isStatsLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <h2 className="text-3xl font-bold text-slate-900">
                {stats ? `$${stats.totalSpent.toLocaleString()}` : "$0"}
              </h2>
            )}
            <DollarSign className="w-8 h-8 text-blue-800" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -z-0 opacity-50" />
        </div>

        {/* Requested Loads */}
        <div className="bg-white rounded-xl p-5 border-2 border-pink-500 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-gray-500 text-sm font-medium z-10">
            Requested Loads
          </p>
          <div className="flex justify-between items-end z-10">
            {isStatsLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <h2 className="text-3xl font-bold text-slate-900">
                {stats?.requestedLoads ?? 0}
              </h2>
            )}
            <Truck className="w-8 h-8 text-pink-500" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-pink-50 rounded-bl-full -z-0 opacity-50" />
        </div>

        {/* Bids Pending */}
        <div className="bg-white rounded-xl p-5 border-2 border-blue-400 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-gray-500 text-sm font-medium z-10">Bids Pending</p>
          <div className="flex justify-between items-end z-10">
            {isStatsLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <h2 className="text-3xl font-bold text-slate-900">
                {stats?.bidsPending ?? 0}
              </h2>
            )}
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -z-0 opacity-50" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[14px] shadow-sm border border-gray-200 overflow-hidden flex flex-col font-inter">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200 flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search requests, locations, equipment, POC..."
                className="pl-9 bg-[#F8FAFC] border-none h-11 w-full text-sm"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 h-11 px-6 rounded-lg w-full sm:w-auto"
                  onClick={handleClearFilters}
                >
                  <X className="w-4 h-4 mr-2 text-gray-400" />
                  Clear
                </Button>
              )}
              <Button
                className="bg-[#4F46E5] hover:bg-indigo-700 text-white h-11 px-8 rounded-lg w-full sm:w-auto"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </label>
                <Select
                  value={status}
                  onValueChange={(val) => {
                    setStatus(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusesList.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Project
                </label>
                <Select
                  value={projectId}
                  onValueChange={(val) => {
                    setProjectId(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projectsList.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.projectName
                          ? `${p.projectName}${p.jobId ? ` (${p.jobId})` : ""}`
                          : p.jobId || p._id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </label>
                <Select
                  value={customerId}
                  onValueChange={(val) => {
                    setCustomerId(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {customersList.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name || c._id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Carrier Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Carrier
                </label>
                <Select
                  value={carrierId}
                  onValueChange={(val) => {
                    setCarrierId(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="All Carriers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Carriers</SelectItem>
                    {carriersList.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.carrierName || c._id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* From Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  From Date
                </label>
                <Input
                  type="date"
                  className="bg-white border-gray-200 h-10 text-sm"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* To Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  To Date
                </label>
                <Input
                  type="date"
                  className="bg-white border-gray-200 h-10 text-sm"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse border border-gray-200 text-nowrap font-inter text-sm">
            <thead className="bg-[linear-gradient(90deg,_#DBEAFE_0%,_#F3E8FF_100%)]">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">REQUEST ID</th>
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">PROJECT</th>
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">DESCRIPTION</th>
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap text-center">ROUTE</th>
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">DATES</th>
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">AWARDED BID</th>
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap text-center">STATUS</th>
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoadsLoading ? (
                // Table Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 border border-gray-200">
                      <Skeleton className="h-6 w-24" />
                    </td>
                    <td className="px-4 py-3 border border-gray-200">
                      <Skeleton className="h-6 w-32" />
                    </td>
                    <td className="px-4 py-3 border border-gray-200">
                      <Skeleton className="h-6 w-40" />
                    </td>
                    <td className="px-4 py-3 border border-gray-200">
                      <Skeleton className="h-10 w-24" />
                    </td>
                    <td className="px-4 py-3 border border-gray-200">
                      <Skeleton className="h-10 w-24" />
                    </td>
                    <td className="px-4 py-3 border border-gray-200">
                      <Skeleton className="h-6 w-16" />
                    </td>
                    <td className="px-4 py-3 border border-gray-200 text-center">
                      <Skeleton className="h-6 w-20 mx-auto" />
                    </td>
                    <td className="px-4 py-3 border border-gray-200 text-center">
                      <Skeleton className="h-8 w-20 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : loads.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500 font-medium border border-gray-200"
                  >
                    No freight loads found matching filters.
                  </td>
                </tr>
              ) : (
                loads.map((load) => (
                  <tr
                    key={load._id}
                    className="hover:bg-gray-50/60 transition-colors group cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/plant/freight-loads/details/${load._id || load.requestId}`,
                      )
                    }
                  >
                    <td className="px-4 py-3 border border-gray-200 align-top">
                      <p className="font-bold text-slate-900 text-sm mb-1">
                        {load.deliveryNumber || "N/A"}
                      </p>
                      <p className="text-xs text-gray-400">
                        Requested:{" "}
                        {load.createdAt
                          ? new Date(load.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 py-3 border border-gray-200 align-top text-slate-900 font-medium">
                      <div className="max-w-[160px] leading-tight">
                        {load.project?.projectName || "N/A"}
                        {load.project?.jobId && (
                          <span className="block text-xs text-gray-400 font-normal mt-0.5">
                            {load.project.jobId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-gray-200 align-top text-gray-500">
                      <div
                        className="max-w-[200px] line-clamp-2"
                        title={load.description}
                      >
                        {load.description || "No description"}
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-gray-200 align-top text-center">
                      <div className="flex flex-col text-xs text-gray-500 space-y-1 max-w-[150px] mx-auto">
                        <span
                          className="truncate font-medium text-slate-700"
                          title={load.pickupLocation}
                        >
                          {load.pickupLocation || "N/A"}
                        </span>
                        <span className="text-gray-400">↓</span>
                        <span
                          className="truncate font-medium text-slate-700"
                          title={load.deliveryLocation}
                        >
                          {load.deliveryLocation || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-gray-200 align-top">
                      <div className="flex flex-col text-xs text-gray-500 space-y-1 max-w-[130px]">
                        <span>
                          Pickup:{" "}
                          <span className="font-medium text-slate-700">
                            {load.pickupDate
                              ? new Date(load.pickupDate).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </span>
                        <span className="mt-0.5">
                          Delivery:{" "}
                          <span className="font-medium text-slate-700">
                            {load.deliveryDate
                              ? new Date(load.deliveryDate).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-gray-200 align-top font-semibold text-slate-900">
                      {load.awardedBidAmount !== undefined &&
                      load.awardedBidAmount !== null
                        ? `$${load.awardedBidAmount.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 border border-gray-200 align-top text-center">
                      {getStatusBadge(load.status)}
                    </td>
                    <td
                      className="px-4 py-3 border border-gray-200 align-top text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        className="bg-white border-gray-200 text-gray-700 h-8 px-3 rounded-md font-medium text-xs shadow-sm hover:bg-gray-50"
                        onClick={() =>
                          navigate(
                            `/plant/freight-loads/details/${load._id || load.requestId}`,
                          )
                        }
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoadsLoading && total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
            <div className="flex flex-1 items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{(page - 1) * limit + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * limit, total)}
                  </span>{" "}
                  of <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-9 px-3 border-gray-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * limit >= total}
                  className="h-9 px-3 border-gray-200"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
