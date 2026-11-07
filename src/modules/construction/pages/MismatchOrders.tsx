import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "react-router";
import { ArrowLeft, Search, ChevronDown, Eye, X, Check } from "lucide-react";
import { useAppBack } from "@/modules/navigation";
import Pagination from "@/components/Pagination";
import ProjectSelector from "../components/common/ProjectSelector";
import {
  // useProjectMismatchOrdersQuery,
  useConstructionMismatchOrdersQuery,
} from "../construction.hooks";
import {
  MismatchOrderDetailsDialog,
  type MismatchOrderItem,
} from "../components/MismatchOrderDetailsDialog";

export default function MismatchOrders() {
  const { goBack } = useAppBack("/construction");
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected Lead / Project ID ("" or "all" means all projects)
  const leadIdFromUrl = searchParams.get("leadId") || "";
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leadIdFromUrl);

  // Synchronize state if URL query param changes externally
  useEffect(() => {
    setSelectedLeadId(searchParams.get("leadId") || "");
  }, [searchParams]);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("All Dates");
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Details dialog
  const [selectedOrder, setSelectedOrder] = useState<MismatchOrderItem | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Dropdown states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch mismatch orders
  // GET /api/admin/construction/mismatch-orders?page=1&limit=10&status=open&leadId=&search=&startDate=&endDate=
  const statusParam = statusFilter === "all" ? undefined : statusFilter;
  const leadIdParam =
    selectedLeadId && selectedLeadId !== "all" ? selectedLeadId : undefined;
  const trimmedSearch = searchQuery.trim() || undefined;

  const { data: mismatchResponse, isLoading: isOrdersLoading } =
    useConstructionMismatchOrdersQuery({
      page: currentPage,
      limit: rowsPerPage,
      status: statusParam,
      leadId: leadIdParam,
      search: trimmedSearch,
    });

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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

  // Format API data by expanding each mismatchOrders[] entry into items.length rows
  // FE note: To match the flat table (one row per material line), expand each mismatchOrders[] entry
  // into items.length rows; repeat mismatchOrderId, projectName, createdAt, and status on each line.
  const mappedApiOrders = useMemo<MismatchOrderItem[]>(() => {
    const apiData = mismatchResponse?.data;
    if (
      apiData &&
      Array.isArray(apiData.mismatchOrders) &&
      apiData.mismatchOrders.length > 0
    ) {
      const fallbackProjectName = apiData.projectName || "Project Site";
      const fallbackJobId = apiData.jobId || "PRO-023";

      return apiData.mismatchOrders.flatMap((m, orderIdx) => {
        let dateStr = "—";
        if (m.createdAt) {
          try {
            const d = new Date(m.createdAt);
            dateStr = d.toLocaleDateString("en-GB"); // DD/MM/YYYY
          } catch {
            dateStr = m.createdAt;
          }
        }

        const projectName = m.projectName || fallbackProjectName;
        const jobId = m.jobId || fallbackJobId;

        // If mismatch order has line items, expand each item into its own row
        if (Array.isArray(m.items) && m.items.length > 0) {
          return m.items.map((item, itemIdx) => {
            const materialName =
              item.description ||
              item.partCode ||
              item.materialName ||
              (m.bundleNo ? `Bundle ${m.bundleNo}` : m.reason || "Materials");

            const specification =
              [item.partCode, item.description].filter(Boolean).join(" - ") ||
              m.notes ||
              m.reason;

            return {
              id: `${m.mismatchId || m.mismatchOrderId || orderIdx}-${item.itemId || itemIdx}`,
              orderId: m.mismatchOrderId,
              project: projectName,
              jobId: jobId,
              materialName: materialName,
              partCode: item.partCode,
              description: item.description,
              specification: specification,
              quantity: item.expectedQty ?? 0,
              receivedQuantity: item.receivedQty ?? 0,
              unit: "Units",
              orderDate: dateStr,
              status: m.status, // Repeat status on each line
              itemStatus: item.status,
              reason: m.reason,
              notes: m.notes,
              actionNotes: m.actionNotes,
              bundleId: m.bundleId,
              bundleNo: m.bundleNo,
              items: m.items,
              photos: m.photos,
              reportedBy: m.reportedBy,
              createdAt: m.createdAt,
              updatedAt: m.updatedAt,
              resolvedAt: m.resolvedAt,
            };
          });
        }

        // Fallback for mismatch order with 0 items
        const materialName = m.bundleNo
          ? `Bundle ${m.bundleNo}`
          : m.reason || "Materials";

        return [
          {
            id: m.mismatchId || m.mismatchOrderId || String(orderIdx),
            orderId: m.mismatchOrderId,
            project: projectName,
            jobId: jobId,
            materialName: materialName,
            specification: m.notes || m.reason,
            quantity: 0,
            receivedQuantity: 0,
            unit: "Units",
            orderDate: dateStr,
            status: m.status,
            reason: m.reason,
            notes: m.notes,
            actionNotes: m.actionNotes,
            bundleId: m.bundleId,
            bundleNo: m.bundleNo,
            items: [],
            photos: m.photos,
            reportedBy: m.reportedBy,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
            resolvedAt: m.resolvedAt,
          },
        ];
      });
    }
    return [];
  }, [mismatchResponse]);

  // Sort orders for display
  const displayOrders = useMemo(() => {
    return [...mappedApiOrders].sort((a, b) => {
      return sortAsc
        ? a.orderId.localeCompare(b.orderId)
        : b.orderId.localeCompare(a.orderId);
    });
  }, [mappedApiOrders, sortAsc]);

  const totalCount = mismatchResponse?.data?.total ?? mappedApiOrders.length;

  const statusOptions = [
    { label: "All Statuses", value: "all" },
    { label: "Open (Mismatch)", value: "open" },
    { label: "In Review", value: "in_review" },
    { label: "Resolved", value: "resolved" },
    { label: "Closed", value: "closed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  // Dynamic date presets from current fetched orders
  const datePresets = useMemo(() => {
    const dates = new Set<string>();
    (mappedApiOrders || []).forEach((o) => {
      if (o.orderDate && o.orderDate !== "—") {
        dates.add(o.orderDate);
      }
    });
    return ["All Dates", ...Array.from(dates)];
  }, [mappedApiOrders]);

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

            {/* Project Selector */}
            <div className="w-[180px] sm:w-[210px]">
              <ProjectSelector
                value={selectedLeadId || "all"}
                onValueChange={(val) => {
                  setSelectedLeadId(val);
                  const newParams = new URLSearchParams(searchParams);
                  if (!val || val === "all") {
                    newParams.delete("leadId");
                  } else {
                    newParams.set("leadId", val);
                  }
                  setSearchParams(newParams);
                  setCurrentPage(1);
                }}
                placeholder="All Projects"
                includeAllOption
                width="100%"
              />
            </div>

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
                    : statusOptions.find((o) => o.value === statusFilter)
                        ?.label || "Select Order Status"}
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
                      {statusFilter === opt.value && (
                        <Check className="w-3.5 h-3.5" />
                      )}
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
                      {selectedDate === preset && (
                        <Check className="w-3.5 h-3.5" />
                      )}
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
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded w-24" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded w-32" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded w-28" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded w-12" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded w-12" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded w-20" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-6 bg-gray-200 rounded-full w-24" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="h-5 w-5 bg-gray-200 rounded-full mx-auto" />
                    </td>
                  </tr>
                ))
              ) : displayOrders.length > 0 ? (
                displayOrders.map((order) => {
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
                        <div className="font-medium text-[#111827]">
                          {order.materialName}
                        </div>
                        {order.partCode &&
                          order.partCode !== order.materialName && (
                            <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                              Part: {order.partCode}
                            </div>
                          )}
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
                            inline-block px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap
                            ${
                              isRedMismatch
                                ? "bg-[#FEE2E2] text-[#EF4444]"
                                : isGreen
                                  ? "bg-[#DCFCE7] text-[#16A34A]"
                                  : isAmber
                                    ? "bg-[#FEF9C3] text-[#CA8A04]"
                                    : "bg-gray-100 text-gray-700"
                            }
                          `}
                        >
                          {isRedMismatch
                            ? "Mismatch"
                            : s === "in_review"
                              ? "In Review"
                              : s === "resolved"
                                ? "Resolved"
                                : s === "closed"
                                  ? "Closed"
                                  : s === "cancelled"
                                    ? "Cancelled"
                                    : order.status}
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
                  <td
                    colSpan={8}
                    className="py-12 text-center text-sm text-gray-500"
                  >
                    <p className="font-medium text-gray-700">
                      No mismatch orders found
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      No mismatch tickets match your current filters.
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
