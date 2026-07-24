import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  ShoppingBag,
  FileText,
  Search,
  MapPin,
  Link as LinkIcon,
  PencilLine,
  CircleCheck,
  Hourglass,
  ArrowUpDown,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/Pagination";
import { usePlantVendorQuery } from "@/modules/plant/vendor.hooks";
import pdfIcon from "@/modules/construction/assets/pdficon.svg";

interface PurchaseHistoryRow {
  id: string;
  material: string;
  quantity: string;
  value: string;
  status: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const formatAddress = (
  address?: {
    placeNumber?: string;
    streetAddress?: string;
    landmark?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  }
) => {
  if (!address) {
    return "";
  }

  return [
    address.placeNumber,
    address.streetAddress,
    address.landmark,
    `${address.city ?? ""}, ${address.state ?? ""} ${address.postalCode ?? ""}`.trim(),
  ]
    .filter((part) => part && part.trim())
    .join(", ");
};

const formatSize = (bytes?: number) => {
  if (!bytes) return "-";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const VerifyIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-[#34C759] shrink-0"
  >
    <path
      d="M8 14A6 6 0 108 2a6 6 0 000 12z"
      fill="#34C759"
      fillOpacity="0.15"
    />
    <path
      d="M8 15A7 7 0 108 1a7 7 0 000 14zm0-1A6 6 0 118 2a6 6 0 010 12z"
      fill="#34C759"
    />
    <path
      d="M10.8 5.8L7.2 9.4 5.2 7.4"
      stroke="#34C759"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 bg-[#f4f7fb] min-h-screen font-sans max-w-7xl mx-auto w-full">
      {children}
    </div>
  );
};

const SubHeading: React.FC<{ text: string }> = ({ text }) => {
  return (
    <h3 className="text-lg font-bold text-[#051321] tracking-tight">
      {text}
    </h3>
  );
};

interface FilterDropdownProps {
  label: string;
  activeTab: string;
  onTabChange: (val: string) => void;
  options: { label: string; value: string }[];
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  activeTab,
  onTabChange,
  options,
}) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 font-medium whitespace-nowrap">{label}</span>
      <select
        value={activeTab}
        onChange={(e) => onTabChange(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-[#051321] font-medium bg-white focus:border-blue-400 transition-all cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface CommonStatusBadgeProps {
  text: string;
  variant?: "green" | "blue" | "gray";
  icon?: React.ReactNode;
}

const CommonStatusBadge: React.FC<CommonStatusBadgeProps> = ({
  text,
  variant = "blue",
  icon,
}) => {
  const variantStyles = {
    green: "bg-green-50 text-green-700 border-green-200/50",
    blue: "bg-blue-50 text-blue-700 border-blue-200/50",
    gray: "bg-gray-50 text-gray-700 border-gray-200/50",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${variantStyles[variant]}`}
    >
      {icon}
      {text}
    </span>
  );
};

const ShipperDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [docSort, setDocSort] = useState("Docs Type");
  const [docSearch, setDocSearch] = useState("");

  // Sorting and Pagination State
  const [sortField, setSortField] = useState<keyof PurchaseHistoryRow>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { data: response, isLoading: isVendorLoading } = usePlantVendorQuery(id ?? "", {
    enabled: !!id,
  });

  const purchaseHistory = useMemo(() => {
    const orderHistory = response?.data?.orderHistory ?? [];
    return orderHistory.map((order) => ({
      id: order.jobId || "-",
      material: order.projectName || "-",
      quantity: "-",
      value: order.quoteValue !== undefined ? formatCurrency(order.quoteValue) : "-",
      status: order.status || "-",
    }));
  }, [response]);

  const complianceDocs = useMemo(() => {
    const vendor = response?.data?.vendor;
    return (vendor?.documents ?? []).map((document) => {
      const isPdf =
        document.name?.toLowerCase().endsWith(".pdf") ||
        document.url?.toLowerCase().includes(".pdf");

      return {
        name: document.name || "-",
        size: formatSize(document.size),
        type: isPdf ? "PDF" : "Document",
        expiry: "-",
      };
    });
  }, [response]);

  const contactRoles = useMemo(() => {
    const vendor = response?.data?.vendor;
    return [
      {
        role: "Primary Contact",
        name: vendor?.contactName || "-",
        phone: vendor?.phone || "-",
      },
      {
        role: "Pickup Location",
        name: vendor?.pickupLocation || "-",
        phone: "",
      },
    ].filter((contact) => contact.name !== "-" || contact.phone !== "");
  }, [response]);

  const handleSort = (field: keyof PurchaseHistoryRow) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedHistory = useMemo(() => {
    const data = [...purchaseHistory];
    return data.sort((a: PurchaseHistoryRow, b: PurchaseHistoryRow) => {
      let valA: string | number = a[sortField];
      let valB: string | number = b[sortField];

      // Handle currency/numeric values
      if (sortField === "value") {
        valA = Number.parseFloat(String(valA).replace(/[$,]/g, "")) || 0;
        valB = Number.parseFloat(String(valB).replace(/[$,]/g, "")) || 0;
      } else if (sortField === "quantity") {
        const quantityA = String(valA).match(/\d+(\.\d+)?/);
        const quantityB = String(valB).match(/\d+(\.\d+)?/);
        valA = quantityA ? Number.parseFloat(quantityA[0]) : 0;
        valB = quantityB ? Number.parseFloat(quantityB[0]) : 0;
      } else {
        valA = String(valA ?? "").toLowerCase();
        valB = String(valB ?? "").toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortField, sortOrder, purchaseHistory]);

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedHistory.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, rowsPerPage, sortedHistory]);

  const sortedDocs = useMemo(() => {
    let data = [...complianceDocs];
    if (docSearch.trim()) {
      const query = docSearch.toLowerCase();
      data = data.filter((doc) => doc.name.toLowerCase().includes(query));
    }
    if (docSort === "Name") {
      return data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (docSort === "Size") {
      return data.sort((a, b) => {
        const sizeA = Number.parseFloat(a.size) || 0;
        const sizeB = Number.parseFloat(b.size) || 0;
        return sizeA - sizeB;
      });
    } else if (docSort === "Docs Type") {
      return data.sort((a, b) => a.type.localeCompare(b.type));
    }
    return data;
  }, [docSort, complianceDocs, docSearch]);

  if (isVendorLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center gap-3 mb-2">
          <button
            disabled
            className="p-1.5 rounded-full transition-colors shrink-0 bg-gray-100 animate-pulse"
            aria-label="Loading back button"
          >
            <ArrowLeft size={20} className="text-transparent" />
          </button>
          <div className="h-7 w-28 rounded-full bg-gray-200 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#F7F8F9] rounded-[14px] p-3 md:p-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap gap-6 items-start justify-between mb-8">
                <div className="flex flex-wrap items-center sm:items-start gap-2 md:gap-4 w-full">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gray-200 animate-pulse shrink-0" />
                  <div className="space-y-3 text-center sm:text-left flex-1 min-w-[250px]">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-sm">
                      <div className="h-4 w-24 rounded-full bg-gray-200 animate-pulse" />
                      <div className="h-4 w-20 rounded-full bg-gray-200 animate-pulse" />
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <div className="h-8 w-56 rounded-full bg-gray-200 animate-pulse" />
                      <div className="ml-4 h-5 w-20 rounded-full bg-gray-200 animate-pulse" />
                    </div>
                    <div className="h-4 w-full max-w-md rounded-full bg-gray-200 animate-pulse" />
                  </div>
                  <div className="h-10 w-32 rounded-xl bg-gray-200 animate-pulse" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 bg-white p-4 rounded-xl border border-gray-100">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse shrink-0" />
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="h-4 w-28 rounded-full bg-gray-200 animate-pulse" />
                      <div className="h-3 w-full rounded-full bg-gray-200 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 pt-8 border-t border-gray-100">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-4 w-40 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-3 w-32 rounded-full bg-gray-200 animate-pulse" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-6 gap-x-4 p-4 md:p-6 mt-8 bg-[#F8F9FA] rounded-[14px]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-3 w-24 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-3 w-12 rounded-full bg-gray-200 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-[14px] p-3 md:p-5 shadow-sm border border-gray-100"
              >
                <div className="h-6 w-28 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-full h-px bg-gray-100 my-6" />
                <div className="space-y-4">
                  {Array.from({ length: index === 0 ? 1 : 3 }).map(
                    (__, itemIndex) => (
                      <div key={itemIndex} className="space-y-2">
                        <div className="h-4 w-32 rounded-full bg-gray-200 animate-pulse" />
                        <div className="h-3 w-40 rounded-full bg-gray-200 animate-pulse" />
                        <div className="h-3 w-24 rounded-full bg-gray-200 animate-pulse" />
                      </div>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  }

  const vendor = response?.data?.vendor;
  const stats = response?.data?.stats;

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate("/plant/shippers")}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0"
        >
          <ArrowLeft size={20} className="text-[#051321]" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-[#051321]">
          Vendors
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-[#F7F8F9] rounded-[14px] p-3 md:p-6 shadow-sm border border-gray-100">
            <div className="flex flex-wrap gap-6 items-start justify-between mb-8">
              <div className="flex flex-wrap items-center sm:items-start gap-2 md:gap-4 w-full">
                <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-[250px]">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-sm">
                    <span className="text-[#7539FF] font-normal">
                      {vendor?.vendorCode || "-"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-[#051321] truncate">
                      {vendor?.vendorName || "-"}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 ml-4">
                      <VerifyIcon />
                      <p className="text-[#34C759] font-medium text-sm">
                        {vendor?.status ? toTitleCase(vendor.status) : "-"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-[#5D6772] flex items-center justify-center sm:justify-start gap-1">
                    <MapPin size={14} className="shrink-0" />{" "}
                    <span className="truncate">{formatAddress(vendor?.address) || "-"}</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/plant/shippers/${id}/edit`)}
                  className="flex items-center gap-2 border-gray-200 shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PencilLine size={16} /> Edit Profile
                </Button>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 bg-white p-4 rounded-xl border border-gray-100">
              <InfoTile
                icon={<Mail size={18} />}
                label="Email Address"
                value={vendor?.email || "-"}
              />
              <InfoTile
                icon={<Phone size={18} />}
                label="Phone"
                value={vendor?.phone || "-"}
              />
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 pt-8 border-t border-gray-100">
              <DetailItem label="Vendor Type" value={vendor?.vendorType || "-"} />
              <DetailItem
                label="Service Category"
                value={vendor?.serviceCategory || "-"}
              />
              <DetailItem
                label="Years Working With Company"
                value={vendor?.yearsWithCompany ? `${vendor.yearsWithCompany} Years` : "-"}
              />
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-6 gap-x-4 p-4 md:p-6 mt-8 bg-[#F8F9FA] rounded-[14px]">
              <MetricItem
                label="Total Orders"
                value={stats?.totalOrders ?? "-"}
              />
              <MetricItem
                label="Completed Deliveries"
                value={stats?.completedDeliveries ?? "-"}
              />
              <MetricItem
                label="Active Orders"
                value={stats?.activeOrders ?? "-"}
              />
              <MetricItem
                label="Average Delivery Time"
                value="-"
              />
              <MetricItem
                label="On-time Delivery Rate"
                value="-"
              />
            </div>
          </div>

          {/* Order / Purchase History */}
          <div className="bg-white rounded-[14px] p-3 md:p-5 shadow-sm border border-gray-100">
            <SubHeading text="Order / Purchase History" />
            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left border-separate border-spacing-0 border border-[#E2E4E6] rounded-lg">
                <thead className="bg-[#F4F6F8]">
                  <tr>
                    <th className="p-3 text-xs font-semibold text-[#5D6772] uppercase tracking-wider border-b border-r border-[#E2E4E6]">
                      Order ID
                    </th>
                    <th
                      className="p-3 text-xs font-semibold text-[#5D6772] uppercase tracking-wider border-b border-r border-[#E2E4E6] cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("material")}
                    >
                      <div className="flex items-center gap-1">
                        Project{" "}
                        <ArrowUpDown
                          size={14}
                          className={
                            sortField === "material"
                              ? "text-[#7539FF]"
                              : "text-gray-400"
                          }
                        />
                      </div>
                    </th>
                    <th
                      className="p-3 text-xs font-semibold text-[#5D6772] uppercase tracking-wider border-b border-r border-[#E2E4E6] cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("value")}
                    >
                      <div className="flex items-center gap-1">
                        Order Value{" "}
                        <ArrowUpDown
                          size={14}
                          className={
                            sortField === "value"
                              ? "text-[#7539FF]"
                              : "text-gray-400"
                          }
                        />
                      </div>
                    </th>
                    <th className="p-3 text-xs font-semibold text-[#5D6772] uppercase tracking-wider border-b border-[#E2E4E6]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E4E6]">
                  {paginatedHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center bg-white rounded-b-lg">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-xs mb-3 text-gray-400">
                            <ShoppingBag size={22} />
                          </div>
                          <h3 className="text-sm font-semibold text-[#051321]">
                            No purchase history
                          </h3>
                          <p className="text-xs text-[#5D6772] mt-1 max-w-[280px]">
                            This vendor doesn't have any recorded orders or purchase transactions yet.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedHistory.map((order, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-[#2563EB] whitespace-nowrap border-r border-[#E2E4E6]">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#051321] font-medium whitespace-nowrap border-r border-[#E2E4E6]">
                          {order.material}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#051321] font-medium whitespace-nowrap border-r border-[#E2E4E6]">
                          {order.value}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <CommonStatusBadge
                            text={order.status}
                            variant={
                              order.status.toLowerCase() === "approved" ||
                              order.status.toLowerCase() === "delivered"
                                ? "green"
                                : "blue"
                            }
                            icon={
                              order.status.toLowerCase() === "approved" ||
                              order.status.toLowerCase() === "delivered" ? (
                                <CircleCheck size={14} />
                              ) : (
                                <Hourglass size={14} />
                              )
                            }
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalItems={purchaseHistory.length}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </div>

          {/* Compliance & Certifications */}
          <div className="bg-white rounded-[14px] shadow-sm p-3 md:p-5 border border-gray-100 overflow-hidden">
            <SubHeading text="Compliance & Certifications" />
            <div className="pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <p className="text-sm font-semibold text-[#051321]">
                  Total No of Documents : {complianceDocs.length}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <FilterDropdown
                    label="Sort By :"
                    activeTab={docSort}
                    onTabChange={setDocSort}
                    options={[
                      { label: "Docs Type", value: "Docs Type" },
                      { label: "Name", value: "Name" },
                      { label: "Size", value: "Size" },
                    ]}
                  />
                  <div className="relative flex-1 sm:flex-none">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search"
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm outline-none w-full sm:w-48 focus:border-blue-400 transition-all text-[#051321]"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto border border-[#E2E4E6] rounded-lg">
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead className="bg-[#F4F6F8]">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-black border-b border-[#E2E4E6]">
                        Name
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-black border-b border-[#E2E4E6]">
                        Size
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-black border-b border-[#E2E4E6]">
                        Type
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-black border-b border-[#E2E4E6]">
                        Expiry Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E4E6] bg-white">
                    {sortedDocs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center bg-white rounded-b-lg">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-xs mb-3 text-gray-400">
                              <FileText size={22} />
                            </div>
                            <h3 className="text-sm font-semibold text-[#051321]">
                              No compliance documents
                            </h3>
                            <p className="text-xs text-[#5D6772] mt-1 max-w-[280px]">
                              There are no compliance documents or certifications uploaded for this vendor.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sortedDocs.map((doc, i) => (
                        <tr
                          key={i}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#F8F9FA] rounded-md shrink-0 border border-gray-100">
                                <img src={pdfIcon} alt="PDF" className="size-5" />
                              </div>
                              {doc.name.toLowerCase().endsWith(".pdf") || doc.name.toLowerCase().startsWith("http") ? (
                                <a
                                  href={vendor?.documents?.[i]?.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-blue-600 hover:underline truncate"
                                >
                                  {doc.name}
                                </a>
                              ) : (
                                <span className="text-sm font-medium text-[#111827] truncate">
                                  {doc.name}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#5D6772]">
                            {doc.size}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#5D6772]">
                            {doc.type}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#051321] font-medium">
                            {doc.expiry}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (Right 1/3) */}
        <div className="space-y-6">
          {/* Notes Card */}
          <div className="bg-white rounded-[14px] p-3 md:p-5 shadow-sm border border-gray-100">
            <SubHeading text="Notes" />
            <div className="w-full h-px bg-gray-100 my-4" />
            {vendor?.internalNotes && vendor.internalNotes.trim() ? (
              <p className="text-sm text-[#637381] leading-relaxed font-inter">
                {vendor.internalNotes}
              </p>
            ) : (
              <p className="text-sm text-[#919EAB] italic font-inter">
                No notes available for this vendor.
              </p>
            )}
          </div>

          {/* Contact Roles Card */}
          <div className="bg-white rounded-[14px] p-3 md:p-5 shadow-sm border border-gray-100">
            <SubHeading text="Vendor Contact Roles" />
            <div className="w-full h-px bg-gray-100 my-4" />
            <div className="space-y-8">
              {contactRoles.map((contact, i) => (
                <div key={i} className="space-y-1.5">
                  <h4 className="text-sm font-semibold text-[#051321]">
                    {contact.role}
                  </h4>
                  <p className="text-sm text-[#5D6772]">{contact.name}</p>
                  {contact.phone && <p className="text-xs text-[#5D6772]">{contact.phone}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

// --- Sub-components & Helpers ---

const InfoTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
}> = ({ icon, label, value, isLink }) => (
  <div className="flex items-start gap-3">
    <div className="text-[#5D6772] mt-0.5 shrink-0">{icon}</div>
    <div className="space-y-0.5 min-w-0">
      <p className="text-sm font-semibold text-[#051321] tracking-tight">
        {label}
      </p>
      <p
        className={`text-xs text-[#5D6772] truncate ${isLink ? "flex items-center gap-1 font-medium" : ""}`}
      >
        {value} {isLink && <LinkIcon size={12} className="text-[#7539FF]" />}
      </p>
    </div>
  </div>
);

const DetailItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="space-y-1.5">
    <p className="text-sm font-semibold text-[#051321] tracking-tight flex items-center gap-2">
      <span className="w-1.5 h-1.5 bg-[#051321] rounded-full" /> {label}
    </p>
    <p className="text-xs text-[#5D6772] truncate pl-3.5 font-medium">
      {value}
    </p>
  </div>
);

const MetricItem: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-[#051321] tracking-tight leading-tight">
      {label}
    </p>
    <p className="text-xs text-[#5D6772] truncate ">{value}</p>
  </div>
);

export default ShipperDetails;
