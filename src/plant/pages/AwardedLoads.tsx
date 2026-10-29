import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  Search,
  Ribbon,
  Truck,
  CheckCircle2,
  DollarSign,
  Phone,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAwardedStatsQuery,
  useAwardedLoadsQuery,
  useFreightFiltersQuery,
  useExportAwardedLoadsMutation,
} from "@/modules/plant/freight.hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { formatStatusLabel, getStatusBadgeStyle } from "./deliveryStatusConstants";

export default function AwardedLoads() {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [customerId, setCustomerId] = useState("all");
  const [carrierId, setCarrierId] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data: statsResponse } = useAwardedStatsQuery();
  const { data: filtersResponse } = useFreightFiltersQuery();

  const awardedLoadsParams: Record<string, string | number> = {
    page,
    limit,
  };
  if (search.trim()) awardedLoadsParams.search = search.trim();
  if (status && status !== "all") awardedLoadsParams.status = status;
  if (projectId && projectId !== "all")
    awardedLoadsParams.projectId = projectId;
  if (customerId && customerId !== "all")
    awardedLoadsParams.customerId = customerId;
  if (carrierId && carrierId !== "all")
    awardedLoadsParams.carrierId = carrierId;
  if (fromDate.trim()) awardedLoadsParams.fromDate = fromDate.trim();
  if (toDate.trim()) awardedLoadsParams.toDate = toDate.trim();

  const { data: loadsResponse, isLoading: isLoadsLoading } =
    useAwardedLoadsQuery(awardedLoadsParams);

  const stats = statsResponse?.data;
  const requests = loadsResponse?.data?.requests || [];
  const total = loadsResponse?.data?.total || 0;

  const bidStatusesList =
    filtersResponse?.data?.bidStatuses && filtersResponse.data.bidStatuses.length > 0
      ? filtersResponse.data.bidStatuses
      : filtersResponse?.data?.statuses || [];
  const deliveryStatusesList = filtersResponse?.data?.deliveryStatuses || [];
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
    search !== "" ||
    searchInput !== "";

  const exportMutation = useExportAwardedLoadsMutation();

  const handleExport = async () => {
    try {
      toast.info("Generating Awarded Loads export...");
      const exportParams: Record<string, string> = {};
      if (search.trim()) exportParams.search = search.trim();
      if (status && status !== "all") exportParams.status = status;
      if (projectId && projectId !== "all") exportParams.projectId = projectId;
      if (customerId && customerId !== "all") exportParams.customerId = customerId;
      if (carrierId && carrierId !== "all") exportParams.carrierId = carrierId;
      if (fromDate.trim()) exportParams.fromDate = fromDate.trim();
      if (toDate.trim()) exportParams.toDate = toDate.trim();

      const blob = await exportMutation.mutateAsync(exportParams);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `awarded-loads-export-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Awarded loads exported successfully!");
    } catch (err: any) {
      console.error("Failed to export awarded loads:", err);
      toast.error(err?.response?.data?.message || "Failed to export awarded loads");
    }
  };

  const getStatusBadge = (statusStr: string) => {
    const s = (statusStr || "").toLowerCase();
    switch (s) {
      case "awarded":
      case "selected":
        return (
          <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
            Selected
          </span>
        );
      case "sent":
        return (
          <span className="px-2.5 py-0.5 bg-sky-100 text-sky-700 text-xs font-semibold rounded-full border border-sky-200">
            Sent
          </span>
        );
      case "submitted":
      case "bids_received":
        return (
          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
            Submitted
          </span>
        );
      case "resubmit_requested":
        return (
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
            Resubmit Requested
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full border border-red-200">
            Rejected
          </span>
        );
      case "expired":
        return (
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
            Expired
          </span>
        );
      case "requested":
        return (
          <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">
            Requested
          </span>
        );
      case "bidding_sent":
      case "carrier_selected":
      case "scheduled":
      case "confirmed":
      case "material_prepared":
      case "loaded":
      case "picked_up":
      case "in_transit":
      case "staged":
      case "dispatched_to_site":
      case "delivered":
      case "partial_received":
      case "received":
      case "delayed":
      case "cancelled":
      case "rescheduled": {
        const style = getStatusBadgeStyle(s);
        return (
          <span
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${style.bg} ${style.text} ${style.border}`}
          >
            {formatStatusLabel(statusStr)}
          </span>
        );
      }
      default:
        return (
          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full uppercase">
            {(statusStr || "").replace(/_/g, " ")}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#f9fafb] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Awarded Loads
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track all awarded freight loads
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="bg-white gap-2 font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl"
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <Download className="w-4 h-4 text-slate-500" />
            )}
            {exportMutation.isPending ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Awarded */}
        <Card className="rounded-2xl border-[2px] border-green-500 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Awarded
              </p>
              <h2 className="text-4xl font-bold text-slate-900 mt-1">
                {stats?.totalAwarded ?? 0}
              </h2>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <Ribbon className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* In Transit */}
        <Card className="rounded-2xl border-[2px] border-orange-400 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">In Transit</p>
              <h2 className="text-4xl font-bold text-slate-900 mt-1">
                {stats?.inTransit ?? 0}
              </h2>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Delivered */}
        <Card className="rounded-2xl border-[2px] border-green-500 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Delivered</p>
              <h2 className="text-4xl font-bold text-slate-900 mt-1">
                {stats?.delivered ?? 0}
              </h2>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="rounded-2xl border-[2px] border-blue-500 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Spent</p>
              <h2 className="text-4xl font-bold text-slate-900 mt-1">
                {stats?.totalSpent
                  ? `$${stats.totalSpent.toLocaleString()}`
                  : "$0"}
              </h2>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table Area */}
      <div className="bg-white rounded-[14px] shadow-sm border border-gray-200 overflow-hidden flex flex-col font-inter">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200 flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search by client / project"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-10 h-11 bg-slate-50 border-0 rounded-xl text-sm"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 h-11 px-6 rounded-xl w-full sm:w-auto"
                  onClick={handleClearFilters}
                >
                  <X className="w-4 h-4 mr-2 text-slate-400" />
                  Clear
                </Button>
              )}
              <Button
                className="h-11 px-8 rounded-xl bg-[#3b59df] hover:bg-[#2b41b3] text-white font-medium w-full sm:w-auto"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </label>
                <Select
                  value={status}
                  onValueChange={(val) => {
                    setStatus(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="bg-white border-slate-200 rounded-xl">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="all">All Statuses</SelectItem>
                    {bidStatusesList.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-xs font-semibold text-slate-400 px-2 py-1">
                          Bid Statuses
                        </SelectLabel>
                        {bidStatusesList.map((st) => (
                          <SelectItem key={`bid_${st}`} value={st}>
                            {st
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {deliveryStatusesList.length > 0 && (
                      <>
                        {bidStatusesList.length > 0 && <SelectSeparator />}
                        <SelectGroup>
                          <SelectLabel className="text-xs font-semibold text-slate-400 px-2 py-1">
                            Delivery Statuses
                          </SelectLabel>
                          {deliveryStatusesList.map((st) => (
                            <SelectItem key={`delivery_${st}`} value={st}>
                              {formatStatusLabel(st)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Project
                </label>
                <Select
                  value={projectId}
                  onValueChange={(val) => {
                    setProjectId(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="bg-white border-slate-200 rounded-xl">
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
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Customer
                </label>
                <Select
                  value={customerId}
                  onValueChange={(val) => {
                    setCustomerId(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="bg-white border-slate-200 rounded-xl">
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
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Carrier
                </label>
                <Select
                  value={carrierId}
                  onValueChange={(val) => {
                    setCarrierId(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="bg-white border-slate-200 rounded-xl">
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
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  From Date
                </label>
                <Input
                  type="date"
                  className="bg-white border-slate-200 h-10 text-sm rounded-xl"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* To Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  To Date
                </label>
                <Input
                  type="date"
                  className="bg-white border-slate-200 h-10 text-sm rounded-xl"
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
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">
                  REQUEST ID
                </th>
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">
                  PROJECT
                </th>
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">
                  DESCRIPTION
                </th>
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">
                  PICKUP LOCATION
                </th>
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">
                  DELIVERY LOCATION
                </th>
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">
                  DATES
                </th>
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">
                  CARRIER
                </th>
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">
                  AWARDED AMOUNT
                </th>
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap text-center">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoadsLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
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
                      <Skeleton className="h-6 w-28" />
                    </td>
                    <td className="px-4 py-3 border border-gray-200">
                      <Skeleton className="h-6 w-28" />
                    </td>
                    <td className="px-4 py-3 border border-gray-200">
                      <Skeleton className="h-10 w-24" />
                    </td>
                    <td className="px-4 py-3 border border-gray-200">
                      <Skeleton className="h-8 w-32" />
                    </td>
                    <td className="px-4 py-3 border border-gray-200">
                      <Skeleton className="h-6 w-20" />
                    </td>
                    <td className="px-4 py-3 border border-gray-200 text-center">
                      <Skeleton className="h-6 w-16 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 border border-gray-200">
                    No awarded loads found
                  </td>
                </tr>
              ) : (
                requests.map((load, index) => (
                  <tr
                    key={load._id || index}
                    className="hover:bg-gray-50/60 transition-colors group cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/plant/freight-loads/details/${load._id || load.requestId}`,
                      )
                    }
                  >
                    <td className="px-4 py-3 border border-gray-200 align-top">
                      <p className="font-bold text-slate-900 mb-1">
                        {load.deliveryNumber}
                      </p>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Requested:{" "}
                        {load.createdAt
                          ? new Date(load.createdAt).toLocaleDateString()
                          : "-"}
                      </p>
                      <div className="mt-1">
                        {getStatusBadge(load.status)}
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-gray-200 align-top">
                      <p className="text-sm font-medium text-slate-700">
                        {load.project?.projectName ||
                          load.project?.jobId ||
                          "-"}
                      </p>
                      {load.project?.jobId && load.project?.projectName && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {load.project.jobId}
                        </p>
                      )}
                      {(load.customer as { name?: string } | undefined)?.name && (
                        <p className="text-xs text-slate-500 mt-0.5" title={(load.customer as { name?: string }).name}>
                          {(load.customer as { name?: string }).name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 border border-gray-200 align-top max-w-[200px] whitespace-normal">
                      <p
                        className="text-sm text-slate-600 break-words leading-snug line-clamp-2 whitespace-normal"
                        title={load.description || undefined}
                      >
                        {load.description || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3 border border-gray-200 align-top">
                      <p className="text-sm text-slate-600 max-w-[150px] truncate" title={load.pickupLocation || undefined}>
                        {load.pickupLocation || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3 border border-gray-200 align-top">
                      <p className="text-sm text-slate-600 max-w-[150px] truncate" title={load.deliveryLocation || undefined}>
                        {load.deliveryLocation || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3 border border-gray-200 align-top">
                      <div className="flex flex-col text-xs text-slate-500 space-y-1 max-w-[130px]">
                        <span>
                          Pickup:{" "}
                          <span className="font-medium text-slate-700">
                            {load.pickupDate
                              ? new Date(load.pickupDate).toLocaleDateString()
                              : "-"}
                          </span>
                        </span>
                        <span className="mt-0.5">
                          Delivery:{" "}
                          <span className="font-medium text-slate-700">
                            {load.deliveryDate
                              ? new Date(load.deliveryDate).toLocaleDateString()
                              : "-"}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-gray-200 align-top">
                      <p className="text-sm font-semibold text-slate-900 mb-1 max-w-[160px]">
                        {load.carrier?.carrierName || "-"}
                      </p>
                      {load.poc?.pickupContactPhone && (
                        <a
                          href={`tel:${load.poc.pickupContactPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-blue-600 flex items-center gap-1 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          {load.poc.pickupContactPhone}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 border border-gray-200 align-top font-semibold text-slate-900">
                      {load.awardedBidAmount !== undefined &&
                      load.awardedBidAmount !== null
                        ? `$${load.awardedBidAmount.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 border border-gray-200 align-top text-center">
                      <Badge
                        variant="outline"
                        className={`rounded-full px-3 py-1 font-semibold uppercase text-[10px] tracking-wider border ${
                          getStatusBadgeStyle(load.status || "awarded").bg
                        } ${getStatusBadgeStyle(load.status || "awarded").text} ${getStatusBadgeStyle(load.status || "awarded").border}`}
                      >
                        {formatStatusLabel(load.status || "awarded")}
                      </Badge>
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
