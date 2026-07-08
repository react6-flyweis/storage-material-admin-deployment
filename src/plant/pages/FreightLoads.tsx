import React from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Filter,
  Download,
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
  useFreightLoadsQuery,
} from "@/modules/plant/freight.hooks";
import { useLeadsQuery } from "@/modules/leads/leads.hooks";
import { useCustomersQuery } from "@/modules/customers/customers.hooks";
import { usePlantCarriersQuery } from "@/modules/plant/carrier.hooks";
import { Skeleton } from "@/components/ui/skeleton";
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

  // Fetch stats and lists for filter dropdowns
  const { data: statsResponse, isLoading: isStatsLoading } = useFreightStatsQuery();
  const { data: leadsResponse } = useLeadsQuery(1, 100);
  const { data: customersResponse } = useCustomersQuery(1, 100);
  const { data: carriersResponse } = usePlantCarriersQuery({ limit: 100 });

  // Fetch main freight loads data
  const { data: loadsResponse, isLoading: isLoadsLoading } = useFreightLoadsQuery({
    page,
    limit,
    search: search || undefined,
    status: status !== "all" ? status : undefined,
    projectId: projectId !== "all" ? projectId : undefined,
    customerId: customerId !== "all" ? customerId : undefined,
    carrierId: carrierId !== "all" ? carrierId : undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const stats = statsResponse?.data;
  const loads = loadsResponse?.data?.requests || [];
  const total = loadsResponse?.data?.total || 0;

  const projectsList = leadsResponse?.data?.leads || [];
  const customersList = customersResponse?.data?.customers || [];
  const carriersList = carriersResponse?.data?.carriers || [];

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
    switch (statusStr) {
      case "awarded":
      case "Awarded":
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">Awarded</span>;
      case "requested":
      case "Requested":
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">Requested</span>;
      case "bids_received":
      case "Bids Received":
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">Bids Received</span>;
      case "in_transit":
      case "In Transit":
        return <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200">In Transit</span>;
      case "delivered":
      case "Delivered":
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">Delivered</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full uppercase">{statusStr.replace("_", " ")}</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Freight Loads</h1>
          <p className="text-gray-500 mt-1">Track and manage freight loads and logistics status</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className={`bg-white border-gray-200 shadow-sm h-10 px-4 transition-colors ${isFilterOpen || hasActiveFilters ? "border-[#4F46E5] text-[#4F46E5] bg-indigo-50/30" : ""}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter {hasActiveFilters && "•"}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={handleClearFilters} className="text-gray-500 hover:text-gray-700 h-10 px-3">
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Awarded */}
        <div className="bg-white rounded-xl p-5 border-2 border-green-500 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-gray-500 text-sm font-medium z-10">Total Awarded</p>
          <div className="flex justify-between items-end z-10">
            {isStatsLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <h2 className="text-3xl font-bold text-slate-900">{stats?.totalLoads ?? 0}</h2>
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
              <h2 className="text-3xl font-bold text-slate-900">{stats?.inTransit ?? 0}</h2>
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
              <h2 className="text-3xl font-bold text-slate-900">{stats?.delivered ?? 0}</h2>
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
          <p className="text-gray-500 text-sm font-medium z-10">Requested Loads</p>
          <div className="flex justify-between items-end z-10">
            {isStatsLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <h2 className="text-3xl font-bold text-slate-900">{stats?.requestedLoads ?? 0}</h2>
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
              <h2 className="text-3xl font-bold text-slate-900">{stats?.bidsPending ?? 0}</h2>
            )}
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -z-0 opacity-50" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col space-y-4">
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
            <Button 
              className="bg-[#4F46E5] hover:bg-indigo-700 text-white h-11 px-8 rounded-lg w-full sm:w-auto"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="requested">Requested</SelectItem>
                    <SelectItem value="bids_received">Bids Received</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="awarded">Awarded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Project Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</label>
                <Select value={projectId} onValueChange={(val) => { setProjectId(val); setPage(1); }}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projectsList.map((p: any) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.projectName || p.jobId || p._id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</label>
                <Select value={customerId} onValueChange={(val) => { setCustomerId(val); setPage(1); }}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {customersList.map((c: any) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name || c.email || c._id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Carrier Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Carrier</label>
                <Select value={carrierId} onValueChange={(val) => { setCarrierId(val); setPage(1); }}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="All Carriers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Carriers</SelectItem>
                    {carriersList.map((c: any) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.carrierName || c._id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* From Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From Date</label>
                <Input
                  type="date"
                  className="bg-white border-gray-200 h-10 text-sm"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                />
              </div>

              {/* To Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To Date</label>
                <Input
                  type="date"
                  className="bg-white border-gray-200 h-10 text-sm"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">REQUEST ID</th>
                <th className="px-6 py-4">PROJECT</th>
                <th className="px-6 py-4">DESCRIPTION</th>
                <th className="px-6 py-4">ROUTE</th>
                <th className="px-6 py-4">DATES</th>
                <th className="px-6 py-4">AWARDED BID</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoadsLoading ? (
                // Table Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-6"><Skeleton className="h-6 w-24" /></td>
                    <td className="px-6 py-6"><Skeleton className="h-6 w-32" /></td>
                    <td className="px-6 py-6"><Skeleton className="h-6 w-40" /></td>
                    <td className="px-6 py-6"><Skeleton className="h-10 w-24" /></td>
                    <td className="px-6 py-6"><Skeleton className="h-10 w-24" /></td>
                    <td className="px-6 py-6"><Skeleton className="h-6 w-16" /></td>
                    <td className="px-6 py-6"><Skeleton className="h-6 w-20" /></td>
                    <td className="px-6 py-6"><Skeleton className="h-8 w-20" /></td>
                  </tr>
                ))
              ) : loads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-medium">
                    No freight loads found matching filters.
                  </td>
                </tr>
              ) : (
                loads.map((load) => (
                  <tr key={load._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-6 align-top">
                      <p className="font-bold text-slate-900 text-sm mb-1">{load.deliveryNumber || "N/A"}</p>
                      <p className="text-xs text-gray-400">
                        Requested:<br />
                        {load.createdAt ? new Date(load.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-6 align-top text-slate-900 font-medium">
                      <div className="max-w-[120px] leading-tight">
                        {load.project?.projectName || "N/A"}
                        {load.project?.jobId && (
                          <span className="block text-xs text-gray-400 font-normal mt-0.5">
                            {load.project.jobId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 align-top text-gray-500">
                      <div className="max-w-[150px] line-clamp-2" title={load.description}>
                        {load.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-6 align-top">
                      <div className="flex flex-col text-xs text-gray-500 space-y-1 max-w-[120px]">
                        <span className="truncate font-medium text-slate-700" title={load.pickupLocation}>
                          {load.pickupLocation || "N/A"}
                        </span>
                        <span className="text-gray-300">↓</span>
                        <span className="truncate font-medium text-slate-700" title={load.deliveryLocation}>
                          {load.deliveryLocation || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 align-top">
                      <div className="flex flex-col text-xs text-gray-500 space-y-1 max-w-[120px]">
                        <span>
                          Pickup:<br />
                          <span className="font-medium text-slate-700">
                            {load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : "N/A"}
                          </span>
                        </span>
                        <span className="mt-1">
                          Delivery:<br />
                          <span className="font-medium text-slate-700">
                            {load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : "N/A"}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 align-top font-semibold text-slate-900">
                      {load.awardedBidAmount !== undefined && load.awardedBidAmount !== null
                        ? `$${load.awardedBidAmount.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="px-6 py-6 align-top">
                      {getStatusBadge(load.status)}
                    </td>
                    <td className="px-6 py-6 align-top">
                      <Button
                        variant="outline"
                        className="bg-white border-gray-200 text-gray-700 h-9 px-4 rounded-md font-medium text-xs shadow-sm hover:bg-gray-50"
                        onClick={() => navigate(`/plant/freight-request-details/${load._id || load.requestId}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
            <div className="flex flex-1 items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(page - 1) * limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * limit, total)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {total}
                  </span>{" "}
                  results
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
