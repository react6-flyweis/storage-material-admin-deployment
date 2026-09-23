import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Search,
  SlidersHorizontal,
  Download,
  MoreHorizontal,
  FileText,
  Truck,
  CalendarDays,
  CheckCircle2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useDeliveriesQuery,
  useDeliveriesStatsQuery,
  useExportDeliveriesMutation,
} from "@/modules/plant/deliveries.hooks";
import { type PlantDelivery } from "@/modules/plant/deliveries.api";
import { useDeliveryDetailQuery, useFreightFiltersQuery } from "@/modules/plant/freight.hooks";
import { usePlantVendorsQuery } from "@/modules/plant/vendor.hooks";
import { usePlantCarriersQuery } from "@/modules/plant/carrier.hooks";
import { useDeliveryStatusUpdate } from "./useDeliveryStatusUpdate";
import EditDeliveryModal from "@/plant/components/EditDeliveryModal";
import RescheduleDeliveryDialog from "@/plant/components/RescheduleDeliveryDialog";
import MarkDeliveredSuccessDialog from "@/plant/components/MarkDeliveredSuccessDialog";
import { RescheduleSuccessModal, StatusUpdatedSuccessModal } from "./DeliveryActionModals";
import StatusConfirmationModal from "./StatusConfirmationModal";
import {
  formatStatusLabel,
  isFinalStatus,
  type DeliveryStatusType,
} from "./deliveryStatusConstants";
import { convertTo24Hour } from "./delivery-details/utils";
import { Skeleton } from "@/components/ui/skeleton";

const toggleColumns = ["Project", "Customer", "Vendor", "Carrier", "POC", "Date"];

const getStatusBadgeStyles = (status: string) => {
  const normStatus = (status || "").toLowerCase();
  switch (normStatus) {
    case "delivered":
      return "bg-[#E6FFEF] text-[#00C853] border-[#E6FFEF]";
    case "material_prepared":
      return "bg-[#EEF2FF] text-[#4F46E5] border-[#EEF2FF]";
    case "loaded":
      return "bg-[#FDF4FF] text-[#C026D3] border-[#FDF4FF]";
    case "picked_up":
      return "bg-[#FFF7ED] text-[#EA580C] border-[#FFF7ED]";
    case "in_transit":
      return "bg-[#EFF6FF] text-[#2563EB] border-[#EFF6FF]";
    case "staged":
      return "bg-[#FEFCE8] text-[#CA8A04] border-[#FEFCE8]";
    case "dispatched_to_site":
      return "bg-[#ECFDF5] text-[#059669] border-[#ECFDF5]";
    case "scheduled":
      return "bg-[#E6F0FF] text-[#155DFC] border-[#E6F0FF]";
    case "confirmed":
      return "bg-[#E6FFEF] text-[#00C853] border-[#E6FFEF]";
    case "bidding_sent":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "carrier_selected":
      return "bg-cyan-100 text-cyan-700 border-cyan-200";
    case "delay":
    case "delayed":
      return "bg-[#FFE9E9] text-[#FF4842] border-[#FFE9E9]";
    case "cancelled":
      return "bg-[#FFE9E9] text-[#FF4842] border-[#FFE9E9]";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export default function AllDeliveries() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Modal / Action States
  const [selectedDeliveryForEditId, setSelectedDeliveryForEditId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedDeliveryForReschedule, setSelectedDeliveryForReschedule] = useState<PlantDelivery | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isRescheduleSuccessOpen, setIsRescheduleSuccessOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<{ date: string; timeWindowStart: string; timeWindowEnd: string } | null>(null);

  const [selectedDeliveryForDelivered, setSelectedDeliveryForDelivered] = useState<PlantDelivery | null>(null);
  const [isMarkDeliveredOpen, setIsMarkDeliveredOpen] = useState(false);

  const [selectedDeliveryForStatus, setSelectedDeliveryForStatus] = useState<PlantDelivery | null>(null);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [isStatusSuccessOpen, setIsStatusSuccessOpen] = useState(false);
  const [lastUpdatedStatusLabel, setLastUpdatedStatusLabel] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { updateDeliveryStatus, toastMessage } = useDeliveryStatusUpdate();

  // Toggling columns
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    Project: true,
    Customer: true,
    Vendor: true,
    Carrier: true,
    POC: true,
    Date: true,
  });

  const toggleColumn = (col: string) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination & Filtering States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectIdFilter, setProjectIdFilter] = useState("");
  const [customerIdFilter, setCustomerIdFilter] = useState("");
  const [vendorIdFilter, setVendorIdFilter] = useState("");
  const [carrierIdFilter, setCarrierIdFilter] = useState("");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Query Hooks
  const { data: statsResponse, refetch: refetchStats } = useDeliveriesStatsQuery();
  const { data: deliveriesResponse, isLoading, refetch: refetchDeliveries } = useDeliveriesQuery({
    page,
    limit,
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    projectId: projectIdFilter || undefined,
    customerId: customerIdFilter || undefined,
    vendorId: vendorIdFilter || undefined,
    carrierId: carrierIdFilter || undefined,
    fromDate: fromDateFilter || undefined,
    toDate: toDateFilter || undefined,
  });

  const { data: editDeliveryDetailResponse } = useDeliveryDetailQuery(
    selectedDeliveryForEditId || "",
    { enabled: Boolean(selectedDeliveryForEditId) }
  );

  const stats = statsResponse?.data || {};
  const deliveries = deliveriesResponse?.data?.deliveries || [];
  const total = deliveriesResponse?.data?.total || 0;

  // Options queries
  const { data: filtersResponse } = useFreightFiltersQuery();
  const { data: vendorsResponse } = usePlantVendorsQuery({ limit: 100 });
  const { data: carriersResponse } = usePlantCarriersQuery({ limit: 100 });

  // Merge projects from filters API and deliveries data for resilience
  const projectOptions = useMemo(() => {
    const map = new Map<string, string>();
    filtersResponse?.data?.projects?.forEach((p) => {
      const label = p.projectName
        ? `${p.projectName}${p.jobId ? ` (${p.jobId})` : ""}`
        : p.jobId || p._id;
      map.set(p._id, label);
    });
    deliveries.forEach((d) => {
      if (d.project?._id && !map.has(d.project._id)) {
        const label = d.project.projectName
          ? `${d.project.projectName}${d.project.jobId ? ` (${d.project.jobId})` : ""}`
          : d.project.jobId || d.project._id;
        map.set(d.project._id, label);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [filtersResponse?.data?.projects, deliveries]);

  // Merge customers from filters API and deliveries data
  const customerOptions = useMemo(() => {
    const map = new Map<string, string>();
    filtersResponse?.data?.customers?.forEach((c) => {
      if (c._id) map.set(c._id, c.name || c._id);
    });
    deliveries.forEach((d) => {
      if (d.customer?._id && !map.has(d.customer._id)) {
        map.set(d.customer._id, d.customer.name || d.customer._id);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [filtersResponse?.data?.customers, deliveries]);

  // Merge carriers from carriers API, filters API, and deliveries data
  const carrierOptions = useMemo(() => {
    const map = new Map<string, string>();
    carriersResponse?.data?.carriers?.forEach((c) => {
      if (c._id) map.set(c._id, c.carrierName || c.carrierCode || c._id);
    });
    filtersResponse?.data?.carriers?.forEach((c) => {
      if (c._id && !map.has(c._id)) map.set(c._id, c.carrierName || c._id);
    });
    deliveries.forEach((d) => {
      if (d.carrier?._id && !map.has(d.carrier._id)) {
        map.set(d.carrier._id, d.carrier.carrierName || d.carrier._id);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [carriersResponse?.data?.carriers, filtersResponse?.data?.carriers, deliveries]);

  // Merge vendors from vendors API and deliveries data
  const vendorOptions = useMemo(() => {
    const map = new Map<string, string>();
    vendorsResponse?.data?.vendors?.forEach((v) => {
      if (v._id) {
        const label = v.vendorName
          ? `${v.vendorName}${v.vendorCode ? ` (${v.vendorCode})` : ""}`
          : v.vendorCode || v._id;
        map.set(v._id, label);
      }
    });
    deliveries.forEach((d) => {
      if (d.shipperVendor?._id && !map.has(d.shipperVendor._id)) {
        const label = d.shipperVendor.vendorName
          ? `${d.shipperVendor.vendorName}${d.shipperVendor.vendorCode ? ` (${d.shipperVendor.vendorCode})` : ""}`
          : d.shipperVendor.vendorCode || d.shipperVendor._id;
        map.set(d.shipperVendor._id, label);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [vendorsResponse?.data?.vendors, deliveries]);

  const activeAdvancedFilterCount = [
    fromDateFilter,
    toDateFilter,
    projectIdFilter,
    customerIdFilter,
    vendorIdFilter,
    carrierIdFilter,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setStatusFilter("all");
    setProjectIdFilter("");
    setCustomerIdFilter("");
    setVendorIdFilter("");
    setCarrierIdFilter("");
    setFromDateFilter("");
    setToDateFilter("");
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const exportMutation = useExportDeliveriesMutation();

  const handleExport = async () => {
    try {
      toast.info("Generating deliveries export...");
      const params = {
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        projectId: projectIdFilter || undefined,
        customerId: customerIdFilter || undefined,
        vendorId: vendorIdFilter || undefined,
        carrierId: carrierIdFilter || undefined,
        fromDate: fromDateFilter || undefined,
        toDate: toDateFilter || undefined,
      };

      const blob = await exportMutation.mutateAsync(params);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const today = new Date().toISOString().split("T")[0];
      link.setAttribute("download", `deliveries-export-${today}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Deliveries exported successfully!");
    } catch (error: unknown) {
      console.error("Failed to export deliveries:", error);
      toast.error("Failed to export deliveries. Please try again.");
    }
  };

  const handleEdit = (row: PlantDelivery) => {
    const deliveryId = row._id || row.requestId;
    setSelectedDeliveryForEditId(deliveryId);
    setIsEditOpen(true);
  };

  const handleReschedule = (row: PlantDelivery) => {
    setSelectedDeliveryForReschedule(row);
    setIsRescheduleOpen(true);
  };

  const handleMarkDelivered = (row: PlantDelivery) => {
    const deliveryId = row._id || row.requestId;
    setSelectedDeliveryForDelivered(row);
    updateDeliveryStatus(deliveryId, "delivered", () => {
      setIsMarkDeliveredOpen(true);
      refetchDeliveries();
      refetchStats();
    });
  };

  const [rawTimeStart = "", rawTimeEnd = ""] = (selectedDeliveryForReschedule?.deliveryTime || "").split(/\s*[-–]\s*/);
  const initialTimeStart = convertTo24Hour(rawTimeStart);
  const initialTimeEnd = convertTo24Hour(rawTimeEnd);

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#f8fafc] min-h-screen font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce ${toastMessage.includes("Error:") ? "bg-red-500" : "bg-[#10B981]"
          }`}>
          <AlertTriangle size={18} strokeWidth={3} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
          All Deliveries
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Comprehensive delivery management and tracking
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Draft</p>
              <h3 className="text-2xl font-bold text-[#eab308] mt-1">{stats.draft ?? 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#fef9c3] flex items-center justify-center text-[#eab308]">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total ?? total}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <Truck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Scheduled</p>
              <h3 className="text-2xl font-bold text-[#3b82f6] mt-1">{stats.scheduled ?? 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#dbeafe] flex items-center justify-center text-[#3b82f6]">
              <CalendarDays className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Confirmed</p>
              <h3 className="text-2xl font-bold text-[#22c55e] mt-1">{stats.confirmed ?? 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#22c55e]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">In Transit</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.inTransit ?? 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <Truck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Delivered</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.delivered ?? 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Delayed</p>
              <h3 className="text-2xl font-bold text-[#ef4444] mt-1">{stats.delayed ?? 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#fee2e2] flex items-center justify-center text-[#ef4444]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Cancelled</p>
              <h3 className="text-2xl font-bold text-[#ef4444] mt-1">{stats.cancelled ?? 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#fee2e2] flex items-center justify-center text-[#ef4444]">
              <XCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar & Filters */}
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by ID, description..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 bg-white border-gray-200 h-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                <SelectTrigger className="w-[180px] bg-white border-gray-200 h-10">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="material_prepared">Material Prepared</SelectItem>
                  <SelectItem value="loaded">Loaded</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="staged">Staged</SelectItem>
                  <SelectItem value="dispatched_to_site">Dispatched To Site</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="bidding_sent">Bidding Sent</SelectItem>
                  <SelectItem value="carrier_selected">Carrier Selected</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                className={`border-gray-200 h-10 transition-colors ${showAdvancedFilters ? "border-blue-600 text-blue-600 bg-blue-50" : "text-blue-600"}`}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Advanced Filters
                {activeAdvancedFilterCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs font-bold rounded-full bg-blue-600 text-white leading-none">
                    {activeAdvancedFilterCount}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                disabled={exportMutation.isPending}
                onClick={handleExport}
                className="bg-white border-green-600 text-green-600 hover:bg-green-50 h-10 disabled:opacity-50"
              >
                {exportMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {exportMutation.isPending ? "Exporting..." : "Export CSV"}
              </Button>
            </div>
          </div>

          {showAdvancedFilters && (
            <div className="pt-4 border-t mt-2 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                {/* Row 1 */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Date From</label>
                  <Input
                    type="date"
                    className="h-10 border-gray-200"
                    value={fromDateFilter}
                    onChange={(e) => { setFromDateFilter(e.target.value); setPage(1); }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Date To</label>
                  <Input
                    type="date"
                    className="h-10 border-gray-200"
                    value={toDateFilter}
                    onChange={(e) => { setToDateFilter(e.target.value); setPage(1); }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Project</label>
                  <Select
                    value={projectIdFilter || "all"}
                    onValueChange={(val) => {
                      setProjectIdFilter(val === "all" ? "" : val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-10 bg-white border-gray-200">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projectOptions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Customer</label>
                  <Select
                    value={customerIdFilter || "all"}
                    onValueChange={(val) => {
                      setCustomerIdFilter(val === "all" ? "" : val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-10 bg-white border-gray-200">
                      <SelectValue placeholder="All Customers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      {customerOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 2 */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Vendor</label>
                  <Select
                    value={vendorIdFilter || "all"}
                    onValueChange={(val) => {
                      setVendorIdFilter(val === "all" ? "" : val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-10 bg-white border-gray-200">
                      <SelectValue placeholder="All Vendors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vendors</SelectItem>
                      {vendorOptions.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Carrier</label>
                  <Select
                    value={carrierIdFilter || "all"}
                    onValueChange={(val) => {
                      setCarrierIdFilter(val === "all" ? "" : val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-10 bg-white border-gray-200">
                      <SelectValue placeholder="All Carriers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Carriers</SelectItem>
                      {carrierOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="hidden lg:block"></div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="w-full h-10 bg-white border-gray-200 text-gray-900 font-semibold gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21v-5h5" /></svg>
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination & Column Toggles */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{(page - 1) * limit + 1}</span> to{" "}
          <span className="font-semibold text-gray-900">{Math.min(page * limit, total)}</span> of{" "}
          <span className="font-semibold text-gray-900">{total}</span> deliveries
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            Items per page:
            <Select value={String(limit)} onValueChange={(val) => { setLimit(Number(val)); setPage(1); }}>
              <SelectTrigger className="w-20 bg-white border-gray-200 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            {toggleColumns.map((col) => (
              <label
                key={col}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={visibleColumns[col]}
                  onChange={() => toggleColumn(col)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                {col}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-[14px] overflow-hidden border border-gray-200 shadow-sm flex flex-col font-inter">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse border border-gray-200 text-nowrap font-inter text-sm">
            <thead className="bg-[linear-gradient(90deg,_#DBEAFE_0%,_#F3E8FF_100%)]">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">ID ⇅</th>
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">Status ⇅</th>
                {visibleColumns.Date && <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">Delivery Date</th>}
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap min-w-[180px]">Description ⇅</th>
                {visibleColumns.Project && <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">Project ⇅</th>}
                {visibleColumns.Customer && <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">Customer ⇅</th>}
                {visibleColumns.Vendor && <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">Vendor</th>}
                {visibleColumns.Carrier && <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">Carrier</th>}
                {visibleColumns.POC && <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap">POC</th>}
                <th className="px-4 py-3.5 border border-gray-200 text-[#212B36] font-semibold text-sm tracking-tight whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 border border-gray-200"><Skeleton className="h-6 w-24" /></td>
                    <td className="px-4 py-3 border border-gray-200"><Skeleton className="h-6 w-20" /></td>
                    {visibleColumns.Date && <td className="px-4 py-3 border border-gray-200"><Skeleton className="h-6 w-28" /></td>}
                    <td className="px-4 py-3 border border-gray-200"><Skeleton className="h-6 w-40" /></td>
                    {visibleColumns.Project && <td className="px-4 py-3 border border-gray-200"><Skeleton className="h-6 w-28" /></td>}
                    {visibleColumns.Customer && <td className="px-4 py-3 border border-gray-200"><Skeleton className="h-6 w-24" /></td>}
                    {visibleColumns.Vendor && <td className="px-4 py-3 border border-gray-200"><Skeleton className="h-6 w-24" /></td>}
                    {visibleColumns.Carrier && <td className="px-4 py-3 border border-gray-200"><Skeleton className="h-6 w-24" /></td>}
                    {visibleColumns.POC && <td className="px-4 py-3 border border-gray-200"><Skeleton className="h-10 w-28" /></td>}
                    <td className="px-4 py-3 border border-gray-200 text-center"><Skeleton className="h-8 w-8 mx-auto" /></td>
                  </tr>
                ))
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 4} className="px-4 py-8 text-center text-gray-500 border border-gray-200">
                    No deliveries found
                  </td>
                </tr>
              ) : (
                deliveries.map((row) => (
                  <tr
                    key={row._id}
                    className="hover:bg-gray-50/60 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/plant/delivery-details/${row._id || row.requestId}`)}
                  >
                    <td className="px-4 py-3 border border-gray-200 align-top">
                      <div className="font-bold text-blue-600">{row.deliveryNumber}</div>
                    </td>
                    <td
                      className="px-4 py-3 border border-gray-200 align-top"
                      onClick={(e) => {
                        if (!isFinalStatus(row.status)) {
                          e.stopPropagation();
                          setSelectedDeliveryForStatus(row);
                          setIsStatusConfirmOpen(true);
                        }
                      }}
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-semibold whitespace-nowrap border ${getStatusBadgeStyles(row.status)} ${!isFinalStatus(row.status) ? "cursor-pointer hover:opacity-80" : ""}`}
                        title={!isFinalStatus(row.status) ? "Click to advance status" : undefined}
                      >
                        {row.status === "delivered" || row.status === "dispatched_to_site" || row.status === "confirmed" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <CalendarDays className="w-3.5 h-3.5" />
                        )}
                        {formatStatusLabel(row.status)}
                      </span>
                    </td>
                    {visibleColumns.Date && (
                      <td className="px-4 py-3 border border-gray-200 align-top">
                        <div className="font-bold text-gray-900">
                          {row.deliveryDate ? new Date(row.deliveryDate).toLocaleDateString() : "-"}
                        </div>
                        {row.deliveryTime && (
                          <div className="text-gray-500 mt-0.5">{row.deliveryTime}</div>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 border border-gray-200 align-top max-w-[200px]">
                      <div className="text-gray-900 font-medium break-words leading-tight">
                        {row.description}
                      </div>
                    </td>
                    {visibleColumns.Project && (
                      <td className="px-4 py-3 border border-gray-200 align-top text-gray-600 max-w-[150px] truncate">
                        {row.project?.projectName || row.project?.jobId || "-"}
                      </td>
                    )}
                    {visibleColumns.Customer && (
                      <td className="px-4 py-3 border border-gray-200 align-top text-gray-600 max-w-[120px] truncate">
                        {row.customer?.name || "-"}
                      </td>
                    )}
                    {visibleColumns.Vendor && (
                      <td className="px-4 py-3 border border-gray-200 align-top text-gray-600 max-w-[120px] truncate">
                        {row.shipperVendor?.vendorName || "-"}
                      </td>
                    )}
                    {visibleColumns.Carrier && (
                      <td className="px-4 py-3 border border-gray-200 align-top text-gray-600 max-w-[120px] truncate">
                        {row.carrier?.carrierName || "-"}
                      </td>
                    )}
                    {visibleColumns.POC && (
                      <td className="px-4 py-3 border border-gray-200 align-top" onClick={(e) => e.stopPropagation()}>
                        {row.poc?.receivingPoc ? (
                          <>
                            <div className="font-medium text-gray-900">{row.poc.receivingPoc}</div>
                            {row.poc.pickupContactPhone && (
                              <div className="flex items-center gap-1.5 text-gray-500 mt-1 text-xs">
                                <Phone className="w-3 h-3 text-blue-500" />
                                {row.poc.pickupContactPhone}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                        {row.customer?.email && (
                          <div className="flex items-center gap-1.5 text-gray-500 mt-0.5 text-xs">
                            <Mail className="w-3 h-3 text-blue-500" />
                            {row.customer.email}
                          </div>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 border border-gray-200 align-top text-center relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveMenu(activeMenu === row._id ? null : row._id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>

                      {/* Custom Dropdown Menu positioned absolutely to avoid table cell clipping */}
                      {activeMenu === row._id && (
                        <div
                          className="absolute right-8 top-10 z-50 w-40 bg-white border border-gray-100 shadow-xl rounded-xl p-2 flex flex-col gap-1.5"
                          onMouseLeave={() => setActiveMenu(null)}
                        >
                          <Button
                            size="sm"
                            className="w-full bg-[#2563eb] hover:bg-blue-700 text-white rounded-md h-8 text-xs font-medium justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(null);
                              navigate(`/plant/delivery-details/${row._id || row.requestId}`);
                            }}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            disabled={row.status?.toLowerCase() === "delivered"}
                            className="w-full bg-[#f97316] hover:bg-orange-600 text-white rounded-md h-8 text-xs font-medium justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(null);
                              handleEdit(row);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            disabled={row.status?.toLowerCase() === "delivered"}
                            className="w-full bg-[#06b6d4] hover:bg-cyan-600 text-white rounded-md h-8 text-xs font-medium justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(null);
                              handleReschedule(row);
                            }}
                          >
                            Reschedule
                          </Button>
                          <Button
                            size="sm"
                            disabled={isFinalStatus(row.status)}
                            className="w-full bg-[#155DFC] hover:bg-blue-700 text-white rounded-md h-8 text-xs font-medium justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(null);
                              setSelectedDeliveryForStatus(row);
                              setIsStatusConfirmOpen(true);
                            }}
                          >
                            Update Status
                          </Button>
                          <Button
                            size="sm"
                            disabled={row.status?.toLowerCase() === "delivered"}
                            className="w-full bg-[#22c55e] hover:bg-green-600 text-white rounded-md h-8 text-xs font-medium justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(null);
                              handleMarkDelivered(row);
                            }}
                          >
                            Mark Delivered
                          </Button>
                          <Button
                            size="sm"
                            className="w-full bg-[#fef08a] hover:bg-yellow-300 text-yellow-800 rounded-md h-8 text-xs font-medium justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(null);
                            }}
                          >
                            Send Reminder
                          </Button>
                          {/* <Button
                            size="sm"
                            className="w-full bg-[#bfdbfe] hover:bg-blue-300 text-blue-800 rounded-md h-8 text-xs font-medium justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(null);
                            }}
                          >
                            Assign owner
                          </Button> */}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
          <div className="flex flex-1 items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-medium">{Math.min(page * limit, total)}</span> of{" "}
                <span className="font-medium">{total}</span> results
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

      {/* Edit Delivery Modal */}
      {selectedDeliveryForEditId && editDeliveryDetailResponse?.data?.delivery && (
        <EditDeliveryModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedDeliveryForEditId(null);
          }}
          deliveryId={selectedDeliveryForEditId}
          delivery={editDeliveryDetailResponse.data.delivery}
          onSaveSuccess={() => {
            refetchDeliveries();
            refetchStats();
            setIsEditOpen(false);
            setSelectedDeliveryForEditId(null);
          }}
        />
      )}

      {/* Reschedule Delivery Dialog */}
      <RescheduleDeliveryDialog
        open={isRescheduleOpen}
        onOpenChange={setIsRescheduleOpen}
        deliveryId={selectedDeliveryForReschedule?._id || selectedDeliveryForReschedule?.requestId || ""}
        initialDate={selectedDeliveryForReschedule?.deliveryDate || ""}
        initialTimeWindowStart={initialTimeStart}
        initialTimeWindowEnd={initialTimeEnd}
        initialAdditionalNotes={selectedDeliveryForReschedule?.description || ""}
        onSubmit={(data) => {
          setRescheduleData(data);
          setIsRescheduleOpen(false);
          setIsRescheduleSuccessOpen(true);
          refetchDeliveries();
          refetchStats();
        }}
      />

      {/* Reschedule Success Modal */}
      <RescheduleSuccessModal
        isOpen={isRescheduleSuccessOpen}
        onClose={() => setIsRescheduleSuccessOpen(false)}
        projectName={selectedDeliveryForReschedule?.description || selectedDeliveryForReschedule?.project?.projectName || "Delivery"}
        newDate={rescheduleData ? new Date(rescheduleData.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : undefined}
        timeWindow={rescheduleData ? `${rescheduleData.timeWindowStart} – ${rescheduleData.timeWindowEnd}` : undefined}
        contact={selectedDeliveryForReschedule?.poc?.receivingPoc || "Site Manager"}
      />

      {/* Mark Delivered Success Dialog */}
      <MarkDeliveredSuccessDialog
        open={isMarkDeliveredOpen}
        onOpenChange={setIsMarkDeliveredOpen}
        deliveryTime={new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        receiverName={selectedDeliveryForDelivered?.poc?.receivingPoc || "Receiver Name"}
        deliveryNotes="NA"
      />

      {/* Status Confirmation Modal */}
      <StatusConfirmationModal
        isOpen={isStatusConfirmOpen}
        onClose={() => setIsStatusConfirmOpen(false)}
        projectName={selectedDeliveryForStatus?.project?.projectName || selectedDeliveryForStatus?.description || "Delivery"}
        deliveryId={selectedDeliveryForStatus?._id || selectedDeliveryForStatus?.requestId || ""}
        currentStatus={selectedDeliveryForStatus?.status || "material_prepared"}
        isLoading={isUpdatingStatus}
        onConfirm={(targetStatus) => {
          const delId = selectedDeliveryForStatus?._id || selectedDeliveryForStatus?.requestId;
          if (!delId) return;
          setIsUpdatingStatus(true);
          const targetLabel = formatStatusLabel(targetStatus);
          setLastUpdatedStatusLabel(targetLabel);
          updateDeliveryStatus(delId, targetStatus, () => {
            setIsUpdatingStatus(false);
            setIsStatusConfirmOpen(false);
            setIsStatusSuccessOpen(true);
            refetchDeliveries();
            refetchStats();
          });
        }}
      />

      {/* Status Updated Success Modal */}
      <StatusUpdatedSuccessModal
        isOpen={isStatusSuccessOpen}
        onClose={() => setIsStatusSuccessOpen(false)}
        projectName={selectedDeliveryForStatus?.project?.projectName || selectedDeliveryForStatus?.description || "Delivery"}
        statusLabel={lastUpdatedStatusLabel}
      />
    </div>
  );
}


