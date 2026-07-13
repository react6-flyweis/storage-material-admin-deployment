import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Download, Search, Ribbon, Truck, CheckCircle2, DollarSign, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import AwardedLoadsFiltersDialog from "@/plant/components/AwardedLoadsFiltersDialog";
import { useAwardedStatsQuery, useAwardedLoadsQuery } from "@/modules/plant/freight.hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function AwardedLoads() {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data: statsResponse } = useAwardedStatsQuery();
  const { data: loadsResponse, isLoading: isLoadsLoading } = useAwardedLoadsQuery({
    page,
    limit,
    search: search || undefined,
  });

  const stats = statsResponse?.data;
  const requests = loadsResponse?.data?.requests || [];
  const total = loadsResponse?.data?.total || 0;

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#f9fafb] min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Awarded Loads</h1>
          <p className="text-sm text-slate-500 mt-1">Track all awarded freight loads</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="bg-white gap-2 font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button 
            variant="outline" 
            className="bg-white gap-2 font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Awarded */}
        <Card className="rounded-2xl border-[2px] border-green-500 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Awarded</p>
              <h2 className="text-4xl font-bold text-slate-900 mt-1">{stats?.totalAwarded ?? 0}</h2>
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
              <h2 className="text-4xl font-bold text-slate-900 mt-1">{stats?.inTransit ?? 0}</h2>
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
              <h2 className="text-4xl font-bold text-slate-900 mt-1">{stats?.delivered ?? 0}</h2>
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
                {stats?.totalSpent ? `$${stats.totalSpent.toLocaleString()}` : "$0"}
              </h2>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table Area */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        
        {/* Search Bar & Filter Button */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search awarded loads..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 h-12 bg-slate-50 border-0 rounded-xl"
            />
          </div>
          <Button 
            className="h-12 px-8 rounded-xl bg-[#3b59df] hover:bg-[#2b41b3] text-white font-medium"
            onClick={() => setIsFilterOpen(true)}
          >
            Filter
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Request ID</th>
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Project</th>
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pickup Location</th>
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Delivery Location</th>
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dates</th>
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Carrier</th>
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Awarded Amount</th>
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadsLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="py-5"><Skeleton className="h-6 w-24" /></td>
                    <td className="py-5"><Skeleton className="h-6 w-32" /></td>
                    <td className="py-5"><Skeleton className="h-6 w-40" /></td>
                    <td className="py-5"><Skeleton className="h-6 w-28" /></td>
                    <td className="py-5"><Skeleton className="h-6 w-28" /></td>
                    <td className="py-5"><Skeleton className="h-10 w-24" /></td>
                    <td className="py-5"><Skeleton className="h-8 w-32" /></td>
                    <td className="py-5"><Skeleton className="h-6 w-20" /></td>
                    <td className="py-5"><Skeleton className="h-6 w-16" /></td>
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No awarded loads found
                  </td>
                </tr>
              ) : (
                requests.map((load, index) => (
                  <tr 
                    key={load._id || index} 
                    className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/plant/freight-request-details/${load._id || load.requestId}`)}
                  >
                    <td className="py-5 align-top">
                      <p className="font-bold text-slate-900 mb-1">{load.deliveryNumber}</p>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Requested: {load.createdAt ? new Date(load.createdAt).toLocaleDateString() : "-"}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] rounded-full px-2 py-0.5 font-medium border
                          ${load.status === "delivered" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-blue-600 bg-blue-50 border-blue-200"}
                        `}
                      >
                        {load.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-5 align-top">
                      <p className="text-sm font-medium text-slate-700">
                        {load.project?.projectName || load.project?.jobId || "-"}
                      </p>
                    </td>
                    <td className="py-5 align-top">
                      <p className="text-sm text-slate-600 max-w-[150px]">{load.description}</p>
                    </td>
                    <td className="py-5 align-top">
                      <p className="text-sm text-slate-600 w-20">{load.pickupLocation || "-"}</p>
                    </td>
                    <td className="py-5 align-top">
                      <p className="text-sm text-slate-600 w-20">{load.deliveryLocation || "-"}</p>
                    </td>
                    <td className="py-5 align-top">
                      <p className="text-[12px] text-slate-500 w-24">
                        Pickup:<br />{load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : "-"}
                      </p>
                      <p className="text-[12px] text-slate-500 w-24 mt-1">
                        Delivery:<br />{load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : "-"}
                      </p>
                    </td>
                    <td className="py-5 align-top">
                      <p className="text-sm font-semibold text-slate-900 mb-1 w-28">
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
                    <td className="py-5 align-top">
                      <p className="text-sm font-bold text-slate-900 mb-1">
                        {load.awardedBidAmount !== undefined && load.awardedBidAmount !== null
                          ? `$${load.awardedBidAmount.toLocaleString()}`
                          : "-"}
                      </p>
                    </td>
                    <td className="py-5 align-top">
                      <Badge className="bg-green-100 hover:bg-green-100 text-green-700 border border-green-200 rounded-full px-3 font-medium uppercase text-[10px]">
                        {load.status === "delivered" ? "Delivered" : "Awarded"}
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

      {/* Filter Modal */}
      <AwardedLoadsFiltersDialog 
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
      />

    </div>
  );
}

