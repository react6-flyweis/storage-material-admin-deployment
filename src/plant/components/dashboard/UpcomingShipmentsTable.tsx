import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Search } from "lucide-react";
import { Link } from "react-router";
import { useUpcomingShipmentsQuery } from "@/modules/plant/dashboard.hooks";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "../Pagination";

interface UpcomingShipmentsTableProps {
  filters: {
    startDate?: string;
    endDate?: string;
    assignedTo?: string;
  };
}

function formatDateString(dateStr?: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusBadgeClass(status?: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("ready") || s.includes("ship")) {
    return "bg-green-100 text-green-700";
  }
  if (s.includes("transit")) {
    return "bg-blue-100 text-blue-700";
  }
  return "bg-yellow-100 text-yellow-700";
}

export default function UpcomingShipmentsTable({ filters }: UpcomingShipmentsTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const limit = 5; // Using 5 per page for a compact dashboard layout

  const queryParams = {
    page,
    limit,
    search: search.trim() || undefined,
    status: status === "all" ? undefined : status,
    startDate: filters.startDate,
    endDate: filters.endDate,
    assignedTo: filters.assignedTo,
  };

  const { data, isLoading, isError } = useUpcomingShipmentsQuery(queryParams);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 on search
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1); // Reset to page 1 on status change
  };

  return (
    <Card className="shadow-sm overflow-hidden flex flex-col">
      <CardHeader className="bg-white pb-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
        <CardTitle className="text-base font-bold text-gray-900">Upcoming Shipments</CardTitle>
        
        {/* Table Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search project or ID..."
              value={search}
              onChange={handleSearchChange}
              className="pl-8 h-9"
            />
          </div>
          
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="ready to ship">Ready to Ship</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Project</th>
              <th className="px-6 py-3">Shipper</th>
              <th className="px-6 py-3 text-nowrap">Load Plan ID</th>
              <th className="px-6 py-3 text-nowrap">Ship Date</th>
              <th className="px-6 py-3 text-nowrap">Est Delivery</th>
              <th className="px-6 py-3 text-nowrap">Delivery Location</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: limit }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  {Array.from({ length: 9 }).map((_, cellIdx) => (
                    <td key={cellIdx} className="px-6 py-4">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-red-500 font-medium">
                  Failed to load upcoming shipments.
                </td>
              </tr>
            ) : !data?.data?.shipments || data.data.shipments.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500 font-medium">
                  No upcoming shipments found.
                </td>
              </tr>
            ) : (
              data.data.shipments.map((item) => (
                <tr key={item.deliveryId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{item.orderId}</td>
                  <td className="px-6 py-4 text-gray-500">{item.projectName}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {item.shipper?.vendorName || <span className="text-gray-400 italic">No approved shipper</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{item.loadPlanNumber || "-"}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDateString(item.shipDate)}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDateString(item.estDeliveryDate)}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate" title={item.deliveryLocation}>
                    {item.deliveryLocation}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded font-medium text-nowrap ${getStatusBadgeClass(item.status)}`}>
                      • {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium h-8 px-2 gap-1"
                      asChild
                    >
                      <Link to={`/plant/delivery-details/${item.deliveryId}`}>
                        <Eye className="w-4 h-4" /> View
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && !isError && data?.data && data.data.total > 0 && (
        <Pagination
          totalItems={data.data.total}
          itemsPerPage={limit}
          currentPage={page}
          onPageChange={setPage}
        />
      )}

      <CardFooter className="justify-center border-t py-4 bg-white">
        <Button variant="link" className="text-blue-600 font-medium" asChild>
          <Link to="/plant/all-deliveries">View All Shipments / Deliveries</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
