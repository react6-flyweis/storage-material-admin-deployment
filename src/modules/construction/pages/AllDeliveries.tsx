import { useState, useMemo } from "react";
import SearchIcon from "../assets/searchIcon.svg";
import CustomSelect from "../components/common/CustomSelect";
import ProjectSelector from "../components/common/ProjectSelector";
import { Upload, CheckCircle2 } from "lucide-react";
import {
  useDeliveriesQuery,
  useExportDeliveriesMutation,
  useDeliveryFiltersQuery,
} from "../construction.hooks";
import type { ApiDeliveryItem } from "../construction.api";
import { Skeleton } from "@/components/ui/skeleton";
import { DeliveryDetailsDialog } from "../components/DeliveryDetailsDialog";
import SuccessModal from "../components/common/SuccessModal";

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border border-gray-200",
  carrier_selected: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  rescheduled: "bg-amber-50 text-amber-600 border border-amber-100",
  scheduled: "bg-cyan-50 text-cyan-600 border border-cyan-100",
  in_transit: "bg-blue-50 text-blue-600 border border-blue-100",
  bidding_sent: "bg-purple-50 text-purple-600 border border-purple-100",
  delivered: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  confirmed: "bg-teal-50 text-teal-600 border border-teal-100",
  delayed: "bg-rose-50 text-rose-600 border border-rose-100",
  cancelled: "bg-red-50 text-red-600 border border-red-100",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  carrier_selected: "Carrier Selected",
  rescheduled: "Rescheduled",
  scheduled: "Scheduled",
  in_transit: "In Transit",
  bidding_sent: "Bidding Sent",
  delivered: "Delivered",
  confirmed: "Confirmed",
  delayed: "Delayed",
  cancelled: "Cancelled",
  staged: "Staged",
  partial_received: "Partial Received",
  received: "Received",
};

const qrStatusOptions = [
  { label: "All", value: "all" },
  { label: "Scanned", value: "scanned" },
  { label: "Pending Scan", value: "pending" },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatStatus(status: string) {
  if (statusLabels[status]) return statusLabels[status];
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AllDeliveries() {
  const [projectFilter, setProjectFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [qrStatusFilter, setQrStatusFilter] = useState("all");
  const [transporterFilter, setTransporterFilter] = useState("all");
  const [driverFilter, setDriverFilter] = useState("all");

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");

  const [selectedDelivery, setSelectedDelivery] = useState<ApiDeliveryItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");

  const { data: filtersData } = useDeliveryFiltersQuery();

  const { data, isLoading } = useDeliveriesQuery({
    page: currentPage,
    limit: Number(pageSize),
    projectId: projectFilter === "all" ? undefined : projectFilter,
    deliveryStatus: statusFilter === "all" ? undefined : statusFilter,
    siteDestination: destinationFilter === "all" ? undefined : destinationFilter,
    transporter: transporterFilter === "all" ? undefined : transporterFilter,
    driver: driverFilter === "all" ? undefined : driverFilter,
    search: searchQuery.trim() || undefined,
  });

  const exportMutation = useExportDeliveriesMutation();

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({
        projectId: projectFilter === "all" ? undefined : projectFilter,
        deliveryStatus: statusFilter === "all" ? undefined : statusFilter,
        siteDestination: destinationFilter === "all" ? undefined : destinationFilter,
        transporter: transporterFilter === "all" ? undefined : transporterFilter,
        driver: driverFilter === "all" ? undefined : driverFilter,
        search: searchQuery.trim() || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `deliveries-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessTitle("Data Exported Successfully");
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Failed to export deliveries:", error);
    }
  };

  const apiDeliveries: ApiDeliveryItem[] = data?.data?.deliveries || [];
  const totalCount = data?.data?.total || 0;

  const statusOptions = useMemo(() => {
    const defaultOptions = [{ label: "All Status", value: "all" }];
    const apiStatuses = filtersData?.data?.deliveryStatuses || [];
    const dynamicOptions = apiStatuses.map((st) => ({
      label: formatStatus(st),
      value: st,
    }));
    return dynamicOptions.length > 0 ? [{ label: "All Status", value: "all" }, ...dynamicOptions] : defaultOptions;
  }, [filtersData]);

  const destinationOptions = useMemo(() => {
    const defaultOptions = [{ label: "All Sites", value: "all" }];
    const apiDestinations = filtersData?.data?.siteDestinations || [];
    const dynamicOptions = apiDestinations.map((dest) => ({
      label: dest,
      value: dest,
    }));
    return dynamicOptions.length > 0 ? [{ label: "All Sites", value: "all" }, ...dynamicOptions] : defaultOptions;
  }, [filtersData]);

  const transporterOptions = useMemo(() => {
    const defaultOptions = [{ label: "All Transporters", value: "all" }];
    const apiTransporters = filtersData?.data?.transporters || [];
    const dynamicOptions = apiTransporters.map((tr) => ({
      label: tr,
      value: tr,
    }));
    return dynamicOptions.length > 0 ? [{ label: "All Transporters", value: "all" }, ...dynamicOptions] : defaultOptions;
  }, [filtersData]);

  const driverOptions = useMemo(() => {
    const defaultOptions = [{ label: "All Drivers", value: "all" }];
    const apiDrivers = filtersData?.data?.drivers || [];
    const dynamicOptions = apiDrivers.map((dr) => ({
      label: dr,
      value: dr,
    }));
    return dynamicOptions.length > 0 ? [{ label: "All Drivers", value: "all" }, ...dynamicOptions] : defaultOptions;
  }, [filtersData]);

  const handleReset = () => {
    setProjectFilter("all");
    setDestinationFilter("all");
    setStatusFilter("all");
    setQrStatusFilter("all");
    setTransporterFilter("all");
    setDriverFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const filteredDeliveries = useMemo(() => {
    return apiDeliveries.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.deliveryId.toLowerCase().includes(q) ||
          item.deliveryNumber.toLowerCase().includes(q) ||
          (item.project?.projectName && item.project.projectName.toLowerCase().includes(q)) ||
          (item.project?.jobId && item.project.jobId.toLowerCase().includes(q)) ||
          (item.material && item.material.toLowerCase().includes(q)) ||
          (item.transporter && item.transporter.toLowerCase().includes(q)) ||
          (item.driver && item.driver.toLowerCase().includes(q)) ||
          (item.siteContact && item.siteContact.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [apiDeliveries, searchQuery]);

  const totalPages = Math.max(1, Math.ceil((totalCount || filteredDeliveries.length) / Number(pageSize)));

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[#111827] lg:text-[28px] text-[22px] font-bold leading-tight">
            All Deliveries
          </h1>
          <p className="text-[#6B7280] text-[14px] mt-1">
            View & Monitor all deliveries across projects and sites
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D1D5DB] rounded-lg text-sm font-medium text-[#374151] hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4 text-gray-500" />
          {exportMutation.isPending ? "Exporting..." : "Export"}
        </button>
      </div>

      {/* Filters Section */}
      <div className="space-y-4 bg-white p-5 rounded-xl">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <label className="text-xs font-medium text-[#4B5563]">Projects</label>
            <ProjectSelector
              value={projectFilter}
              onValueChange={setProjectFilter}
              placeholder="All Projects"
              includeAllOption
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#4B5563]">Site/Destination</label>
            <CustomSelect
              title="Site/Destination"
              options={destinationOptions}
              value={destinationFilter}
              onChange={setDestinationFilter}
              width="200px"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#4B5563]">Delivery Status</label>
            <CustomSelect
              title="Delivery Status"
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              width="200px"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#4B5563]">QR Scan Status</label>
            <CustomSelect
              title="QR Scan Status"
              options={qrStatusOptions}
              value={qrStatusFilter}
              onChange={setQrStatusFilter}
              width="200px"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#4B5563]">Date Range</label>
            <div className="flex items-center justify-between w-[200px] bg-white px-3 h-[40px] rounded-[8px] border border-gray-200 text-sm text-[#374151]">
              <span>Select Date</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-end justify-between">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#4B5563]">Transporter</label>
              <CustomSelect
                title="Transporter"
                options={transporterOptions}
                value={transporterFilter}
                onChange={setTransporterFilter}
                width="200px"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#4B5563]">Driver</label>
              <CustomSelect
                title="Driver"
                options={driverOptions}
                value={driverFilter}
                onChange={setDriverFilter}
                width="200px"
              />
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 h-[40px] bg-white border border-[#D1D5DB] rounded-lg text-sm font-medium text-[#374151] hover:bg-gray-50 shadow-sm transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      {/* Deliveries Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header / Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#111827]">Deliveries</h2>
            <span className="text-sm text-[#6B7280]">
              ({isLoading ? "..." : totalCount || filteredDeliveries.length})
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 border border-[#D1D5DB] rounded-lg h-[38px] bg-white w-full sm:w-[320px]">
            <img src={SearchIcon} alt="Search" className="w-4 h-4 opacity-50" />
            <input
              type="text"
              placeholder="Search by delivery ID, material, project, site.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs outline-none w-full bg-transparent text-[#111827] placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E5E7EB]/50 border-b border-gray-200 text-[13px] font-semibold text-[#374151]">
                <th className="py-3.5 px-4">Delivery ID</th>
                <th className="py-3.5 px-4">Project / Site</th>
                <th className="py-3.5 px-4">Material</th>
                <th className="py-3.5 px-4">Delivery Date & Time</th>
                <th className="py-3.5 px-4">Transporter / Driver</th>
                <th className="py-3.5 px-4">Site Contact</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Received</th>
                <th className="py-3.5 px-4">QR Scan</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="py-4 px-4 align-top">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </td>
                    <td className="py-4 px-4 align-top">
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </td>
                    <td className="py-4 px-4 align-top">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="py-4 px-4 align-top">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </td>
                    <td className="py-4 px-4 align-top">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </td>
                    <td className="py-4 px-4 align-top">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-4 px-4 align-top text-center">
                      <Skeleton className="h-6 w-24 mx-auto rounded-full" />
                    </td>
                    <td className="py-4 px-4 align-top">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="py-4 px-4 align-top">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="py-4 px-4 align-top text-center">
                      <Skeleton className="h-7 w-14 mx-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : filteredDeliveries.length > 0 ? (
                filteredDeliveries.map((item) => (
                  <tr key={item.deliveryId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 align-top">
                      <p className="font-bold text-[#111827] text-sm text-nowrap">{item.deliveryNumber}</p>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <p className="font-semibold text-[#111827] text-sm text-nowrap">
                        {item.project?.projectName || "—"}
                      </p>
                      <p className="text-[#6B7280] text-xs mt-0.5">
                        {item.project?.jobId || "—"}
                      </p>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <p className="font-medium text-[#111827] text-sm">{item.material || "—"}</p>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <p className="font-semibold text-[#111827] text-sm text-nowrap">
                        {formatDate(item.deliveryDate)}
                      </p>
                      {item.timings && (
                        <p className="text-[#6B7280] text-xs mt-0.5">{item.timings}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 align-top">
                      <p className="font-medium text-[#111827] text-sm text-nowrap">
                        {item.transporter || "—"}
                      </p>
                      {item.driver && (
                        <p className="text-[#6B7280] text-xs mt-0.5">
                          {item.driver} {item.driverPhone ? `(${item.driverPhone})` : ""}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4 align-top">
                      <p className="font-medium text-[#111827] text-sm">
                        {item.siteContact || "—"}
                      </p>
                    </td>
                    <td className="py-4 px-4 align-top text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyles[item.status] || "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                      >
                        {formatStatus(item.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-top">
                      {item.status === "delivered" ? (
                        <div className="flex items-start gap-1 text-[#16A34A]">
                          <CheckCircle2 className="w-4 h-4 min-w-[16px] mt-0.5" />
                          <div>
                            <p className="font-semibold text-xs text-[#16A34A]">Received</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-medium ml-2">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 align-top">
                      {item.status === "delivered" ? (
                        <div className="flex items-start gap-1 text-[#16A34A]">
                          <CheckCircle2 className="w-4 h-4 min-w-[16px] mt-0.5" />
                          <div>
                            <p className="font-semibold text-xs text-[#16A34A]">Scanned</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-medium ml-2">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 align-top text-center">
                      <button
                        onClick={() => {
                          setSelectedDelivery(item);
                          setIsDetailsOpen(true);
                        }}
                        className="px-3 py-1 bg-white border border-gray-300 rounded-md text-xs font-medium text-[#374151] hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-sm text-gray-500">
                    No deliveries found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-t border-gray-100 text-xs text-[#6B7280]">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <CustomSelect
              title={pageSize}
              options={[
                { label: "10", value: "10" },
                { label: "25", value: "25" },
                { label: "50", value: "50" },
              ]}
              value={pageSize}
              onChange={(val) => {
                setPageSize(val);
                setCurrentPage(1);
              }}
              width="70px"
              upperSide={true}
            />
            <span>Results</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg font-medium flex items-center justify-center shadow-xs transition-colors ${currentPage === pageNum
                  ? "bg-purple-600 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Delivery Details Modal */}
      <DeliveryDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedDelivery(null);
        }}
        deliveryId={selectedDelivery?.deliveryId}
        delivery={selectedDelivery}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successTitle}
      />
    </div>
  );
}
