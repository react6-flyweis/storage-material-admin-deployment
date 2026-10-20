import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  Eye,
  X,
  Check,
  Building2,
  RefreshCw,
} from "lucide-react";
import { useAppBack } from "@/modules/navigation";
import Pagination from "@/components/Pagination";
import { getProjectsApi } from "@/api/projects.api";
import { useProjectMismatchOrdersQuery } from "../construction.hooks";
import {
  MismatchOrderDetailsDialog,
  type MismatchOrderItem,
} from "../components/MismatchOrderDetailsDialog";
import type { Project } from "@/types/projects.types";

// Fallback demo data matching the user's design reference
const fallbackOrders: MismatchOrderItem[] = [
  {
    id: "67c0abc1234567890abcdef",
    orderId: "CO-ORD-876",
    project: "Steel building",
    jobId: "PRO-023",
    siteLocation: "North Zone, Plot 14",
    materialName: "Steel Panels",
    specification: "Standard Galvanized Wall Panel 24ga",
    quantity: 12,
    receivedQuantity: 10,
    unit: "Panels",
    orderDate: "21/01/2024",
    deliveryDate: "24/01/2024",
    status: "open",
    reason: "Short shipment",
    notes: "Two purlin lines missing",
    actionNotes: "",
    bundleId: "67a1b2c3d4e5f6789012345a",
    bundleNo: "B-12",
    items: [
      {
        itemId: "67a1b2c3d4e5f6789012345b",
        expectedQty: 12,
        receivedQty: 10,
        status: "Partially Received",
        materialName: "Steel Panels",
      },
    ],
    photos: [{ name: "dock-photo.jpg", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd" }],
    reportedBy: { _id: "u-1", name: "Site Lead", email: "site@example.com" },
    createdAt: "2024-01-21T06:30:00.000Z",
  },
  {
    id: "67c0abc1234567890abcdeg",
    orderId: "CO-ORD-876",
    project: "Riverside Building",
    jobId: "PRO-024",
    siteLocation: "Riverside Commercial Park",
    materialName: "Steel Panels",
    specification: "Standard Galvanized Wall Panel 24ga",
    quantity: 11,
    receivedQuantity: 10,
    unit: "Panels",
    orderDate: "21/01/2024",
    deliveryDate: "25/01/2024",
    status: "open",
    reason: "Short shipment",
    notes: "1 panel short on delivery pallet",
    actionNotes: "",
    bundleId: "67a1b2c3d4e5f6789012345c",
    bundleNo: "B-14",
    items: [
      {
        itemId: "67a1b2c3d4e5f6789012345d",
        expectedQty: 11,
        receivedQty: 10,
        status: "Partially Received",
        materialName: "Steel Panels",
      },
    ],
    reportedBy: { _id: "u-2", name: "Site Lead", email: "site@example.com" },
    createdAt: "2024-01-21T07:15:00.000Z",
  },
  {
    id: "67c0abc1234567890abcdeh",
    orderId: "MMO-0007",
    project: "ABC Warehouse",
    jobId: "PRO-023",
    siteLocation: "Dock 4, Industrial Bay",
    materialName: "Bundle B-12",
    specification: "Two purlin lines missing",
    quantity: 24,
    receivedQuantity: 18,
    unit: "Units",
    orderDate: "14/10/2026",
    status: "open",
    reason: "Short shipment",
    notes: "Two purlin lines missing from delivery package",
    actionNotes: "Checking warehouse dispatch log",
    bundleId: "67a1b2c3d4e5f6789012345a",
    bundleNo: "B-12",
    items: [
      {
        itemId: "67a1b2c3d4e5f6789012345b",
        expectedQty: 24,
        receivedQty: 18,
        status: "Partially Received",
        materialName: "Purlin Lines",
      },
    ],
    photos: [{ name: "dock-photo.jpg", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd" }],
    reportedBy: { _id: "u-3", name: "Site Lead", email: "site@example.com" },
    createdAt: "2026-10-14T06:30:00.000Z",
  },
];

export default function MismatchOrders() {
  const { goBack } = useAppBack("/construction");
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected Lead / Project ID
  const leadIdFromUrl = searchParams.get("leadId") || "";
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leadIdFromUrl);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("7 April 2026");
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Details dialog
  const [selectedOrder, setSelectedOrder] = useState<MismatchOrderItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Dropdown states
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch available projects for selector
  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects-selector-list"],
    queryFn: () => getProjectsApi({ page: 1, limit: 100 }),
  });

  const projects: Project[] = useMemo(() => {
    return projectsData?.data?.data?.projects || [];
  }, [projectsData]);

  // Set default project if none selected yet
  useEffect(() => {
    if (!selectedLeadId && projects.length > 0) {
      const defaultId = projects[0]._id || projects[0].leadId || "";
      setSelectedLeadId(defaultId);
    }
  }, [projects, selectedLeadId]);

  // 2. Fetch Mismatch Orders using API
  // GET /api/admin/plant/projects/{leadId}/mismatch-orders?page=1&limit=20&status=open
  const activeLeadId = selectedLeadId || projects[0]?._id || "6ac4e5e6570533c2c601ed40";

  const {
    data: mismatchResponse,
    isLoading: isOrdersLoading,
    isRefetching,
    refetch,
  } = useProjectMismatchOrdersQuery(
    activeLeadId,
    {
      page: currentPage,
      limit: rowsPerPage,
      status: statusFilter === "all" ? undefined : statusFilter,
    },
    { enabled: Boolean(activeLeadId) }
  );

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(e.target as Node)
      ) {
        setProjectDropdownOpen(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(e.target as Node)
      ) {
        setDateDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format API data or use fallback
  const mappedApiOrders = useMemo<MismatchOrderItem[]>(() => {
    const apiData = mismatchResponse?.data;
    if (apiData && Array.isArray(apiData.mismatchOrders) && apiData.mismatchOrders.length > 0) {
      return apiData.mismatchOrders.map((m) => {
        const totalExpected = (m.items || []).reduce(
          (sum, it) => sum + (it.expectedQty || 0),
          0
        );
        const totalReceived = (m.items || []).reduce(
          (sum, it) => sum + (it.receivedQty || 0),
          0
        );
        const materialName = m.bundleNo
          ? `Bundle ${m.bundleNo}`
          : m.items?.[0]?.materialName || m.reason || "Materials";

        let dateStr = "—";
        if (m.createdAt) {
          try {
            const d = new Date(m.createdAt);
            dateStr = d.toLocaleDateString("en-GB"); // DD/MM/YYYY
          } catch {
            dateStr = m.createdAt;
          }
        }

        return {
          id: m.mismatchId || m.mismatchOrderId,
          orderId: m.mismatchOrderId,
          project: apiData.projectName || "Project Site",
          jobId: apiData.jobId || "PRO-023",
          materialName: materialName,
          specification: m.notes || m.reason,
          quantity: totalExpected,
          receivedQuantity: totalReceived,
          unit: "Units",
          orderDate: dateStr,
          status: m.status,
          reason: m.reason,
          notes: m.notes,
          actionNotes: m.actionNotes,
          bundleId: m.bundleId,
          bundleNo: m.bundleNo,
          items: m.items,
          photos: m.photos,
          reportedBy: m.reportedBy,
          createdAt: m.createdAt,
        };
      });
    }

    // Fallback to reference demo data if no records returned from backend
    return fallbackOrders;
  }, [mismatchResponse]);

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    return mappedApiOrders
      .filter((order) => {
        // Status filter
        if (statusFilter !== "all") {
          const s = order.status.toLowerCase();
          const target = statusFilter.toLowerCase();
          if (target === "open" && s !== "open" && s !== "mismatch") return false;
          if (target !== "open" && s !== target) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchId = order.orderId.toLowerCase().includes(q);
          const matchProject = order.project.toLowerCase().includes(q);
          const matchMaterial = order.materialName.toLowerCase().includes(q);
          if (!matchId && !matchProject && !matchMaterial) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        return sortAsc
          ? a.orderId.localeCompare(b.orderId)
          : b.orderId.localeCompare(a.orderId);
      });
  }, [mappedApiOrders, statusFilter, searchQuery, sortAsc]);

  // Paginated items
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredOrders.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredOrders, currentPage, rowsPerPage]);

  const totalCount = mismatchResponse?.data?.total || filteredOrders.length;

  const currentProjectName = useMemo(() => {
    const found = projects.find((p) => p._id === selectedLeadId || p.leadId === selectedLeadId);
    return found?.projectName || mismatchResponse?.data?.projectName || "Select Project";
  }, [projects, selectedLeadId, mismatchResponse]);

  const statusOptions = [
    { label: "Select Order Status", value: "all" },
    { label: "Open (Mismatch)", value: "open" },
    { label: "In Review", value: "in_review" },
    { label: "Resolved", value: "resolved" },
    { label: "Closed", value: "closed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const datePresets = [
    "7 April 2026",
    "21 January 2024",
    "15 January 2024",
    "All Dates",
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header with Back button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => goBack()}
            className="
              flex items-center gap-2
              bg-[#3F63E1] hover:bg-[#3253c8] text-white
              px-4 h-[40px]
              rounded-[8px]
              text-[14px] font-medium
              shadow-xs
              transition-colors
              cursor-pointer
            "
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back</span>
          </button>

          <div>
            <h1 className="text-[#111827] text-[24px] lg:text-[28px] font-bold leading-tight">
              Mismatch Orders
            </h1>
            <p className="text-[#6B7280] text-[13px] mt-0.5">
              Track and manage all orders in one place
            </p>
          </div>
        </div>

        {/* Refetch / Refresh Button */}
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isOrdersLoading || isRefetching}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition shadow-xs cursor-pointer disabled:opacity-50"
          title="Reload Mismatch Orders"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin text-blue-600" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Card Container */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Card Toolbar / Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-[#111827] text-[16px] font-semibold tracking-tight">
              Mismatch Orders List
            </h2>
            {mismatchResponse?.data?.jobId && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Job: {mismatchResponse.data.jobId}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="
                  pl-9 pr-4 h-[38px] w-[180px] sm:w-[200px]
                  text-[13px] text-gray-800
                  bg-white border border-gray-200 rounded-[8px]
                  placeholder:text-gray-400
                  focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                  transition
                "
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Project Selector Dropdown */}
            {projects.length > 0 && (
              <div ref={projectDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                  className="
                    h-[38px] px-3.5 max-w-[200px]
                    flex items-center justify-between gap-2
                    text-[13px] text-gray-700 font-normal
                    bg-white border border-gray-200 rounded-[8px]
                    hover:bg-gray-50/80
                    focus:outline-none focus:ring-1 focus:ring-blue-500
                    transition cursor-pointer truncate
                  "
                >
                  <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{currentProjectName}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform shrink-0 ${
                      projectDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {projectDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white border border-gray-100 rounded-[8px] shadow-lg py-1 z-30 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      Select Project
                    </div>
                    {projects.map((proj) => {
                      const id = proj._id || proj.leadId || "";
                      const isSelected = selectedLeadId === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            setSelectedLeadId(id);
                            setSearchParams({ leadId: id });
                            setProjectDropdownOpen(false);
                            setCurrentPage(1);
                          }}
                          className={`
                            w-full px-3.5 py-2 text-left text-xs flex items-center justify-between
                            hover:bg-gray-50 transition-colors
                            ${isSelected ? "text-blue-600 font-semibold bg-blue-50/50" : "text-gray-700"}
                          `}
                        >
                          <span className="truncate">{proj.projectName || "Unnamed Project"}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Select Order Status Dropdown */}
            <div ref={statusDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="
                  h-[38px] px-3.5
                  flex items-center justify-between gap-2.5
                  text-[13px] text-gray-700 font-normal
                  bg-white border border-gray-200 rounded-[8px]
                  hover:bg-gray-50/80
                  focus:outline-none focus:ring-1 focus:ring-blue-500
                  transition cursor-pointer
                "
              >
                <span>
                  {statusFilter === "all"
                    ? "Select Order Status"
                    : statusOptions.find((o) => o.value === statusFilter)?.label ||
                      "Select Order Status"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    statusDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {statusDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-100 rounded-[8px] shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setStatusDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`
                        w-full px-3.5 py-2 text-left text-xs flex items-center justify-between
                        hover:bg-gray-50 transition-colors
                        ${statusFilter === opt.value ? "text-blue-600 font-semibold bg-blue-50/50" : "text-gray-700"}
                      `}
                    >
                      <span>{opt.label}</span>
                      {statusFilter === opt.value && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Selector Dropdown */}
            <div ref={dateDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                className="
                  h-[38px] px-3.5
                  flex items-center justify-between gap-2
                  text-[13px] text-gray-700 font-normal
                  bg-white border border-gray-200 rounded-[8px]
                  hover:bg-gray-50/80
                  focus:outline-none focus:ring-1 focus:ring-blue-500
                  transition cursor-pointer
                "
              >
                <span>Date : {selectedDate}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    dateDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dateDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-100 rounded-[8px] shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    Filter by Date
                  </div>
                  {datePresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setSelectedDate(preset);
                        setDateDropdownOpen(false);
                      }}
                      className={`
                        w-full px-3.5 py-2 text-left text-xs flex items-center justify-between
                        hover:bg-gray-50 transition-colors
                        ${selectedDate === preset ? "text-blue-600 font-semibold bg-blue-50/50" : "text-gray-700"}
                      `}
                    >
                      <span>{preset}</span>
                      {selectedDate === preset && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E5E7EB]/70 border-b border-gray-200 text-[13px] font-semibold text-[#374151]">
                <th className="py-3.5 px-6 font-semibold">Order ID</th>
                <th className="py-3.5 px-6 font-semibold">Project</th>
                <th className="py-3.5 px-6 font-semibold">Material Name</th>
                <th className="py-3.5 px-6 font-semibold">Quantity</th>
                <th className="py-3.5 px-6 font-semibold">Received Quantity</th>
                <th
                  className="py-3.5 px-6 font-semibold cursor-pointer select-none hover:text-gray-900"
                  onClick={() => setSortAsc(!sortAsc)}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>Order Date</span>
                    <span className="text-gray-500 text-xs">▾</span>
                  </div>
                </th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 text-center font-semibold w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {isOrdersLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    <td className="py-4 px-6"><div className="h-6 bg-gray-200 rounded-full w-24" /></td>
                    <td className="py-4 px-6 text-center"><div className="h-5 w-5 bg-gray-200 rounded-full mx-auto" /></td>
                  </tr>
                ))
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => {
                  const s = order.status.toLowerCase();
                  const isRedMismatch = s === "open" || s === "mismatch";
                  const isGreen = s === "resolved";
                  const isAmber = s === "in_review";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Order ID */}
                      <td className="py-4 px-6 text-[#111827] font-medium whitespace-nowrap">
                        {order.orderId}
                      </td>

                      {/* Project */}
                      <td className="py-4 px-6 text-[#111827] font-medium whitespace-nowrap">
                        {order.project}
                      </td>

                      {/* Material Name */}
                      <td className="py-4 px-6 text-[#111827] whitespace-nowrap">
                        {order.materialName}
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-6 text-[#111827] font-medium whitespace-nowrap">
                        {order.quantity}
                      </td>

                      {/* Received Quantity */}
                      <td className="py-4 px-6 text-[#111827] font-medium whitespace-nowrap">
                        {order.receivedQuantity}
                      </td>

                      {/* Order Date */}
                      <td className="py-4 px-6 text-[#6B7280] whitespace-nowrap">
                        {order.orderDate}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`
                            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-xs
                            ${
                              isRedMismatch
                                ? "bg-[#EF4444]"
                                : isGreen
                                ? "bg-emerald-500"
                                : isAmber
                                ? "bg-amber-500"
                                : "bg-gray-600"
                            }
                          `}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          {isRedMismatch ? "Mismatch" : order.status}
                        </span>
                      </td>

                      {/* Action Eye Icon */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailsOpen(true);
                          }}
                          className="
                            p-1.5 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-full
                            transition-colors cursor-pointer inline-flex items-center justify-center
                          "
                          title="View Order Discrepancy Details"
                        >
                          <Eye className="w-5 h-5 stroke-[1.6]" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-500">
                    <p className="font-medium text-gray-700">No mismatch orders found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      No mismatch tickets reported for this project.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching reference layout */}
        <div className="border-t border-gray-100">
          <Pagination
            totalItems={totalCount}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 20, 50]}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Mismatch Order Details Modal */}
      <MismatchOrderDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </div>
  );
}
