import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  PencilLine,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ChevronDown,
  ArrowUpDown,
  Search,
  Briefcase,
  History,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/Pagination";
import pdfIcon from "@/modules/construction/assets/pdficon.svg";
import { usePlantCarrierQuery } from "@/modules/plant/carrier.hooks";
import { type GetPlantCarrierResponse } from "@/modules/plant/carrier.api";

interface CarrierViewData {
  id: string;
  name: string;
  status: string;
  rating: number;
  address: string;
  email: string;
  phone: string;
  website: string;
  lastAwarded: string;
  serviceCategory: string;
  avgResponseTime: string;
  fleet: {
    flatbed: number;
    dryVan: number;
    refrigerated: number;
    heavyHaul: number;
    totalVehicles: number;
    maxCapacity: string;
    avgAge: string;
  };
  notes: string;
  assignedProjects: Array<{
    id: string;
    route: string;
    cargo: string;
    date: string;
    status: string;
  }>;
  freightHistory: Array<{
    id: string;
    route: string;
    cargo: string;
    date: string;
    status: string;
  }>;
  complianceDocs: Array<{
    name: string;
    size: string;
    type: string;
    expiry: string;
    url: string;
  }>;
}

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const formatAddress = (
  address?: GetPlantCarrierResponse["data"]["carrier"]["address"],
) => {
  if (!address) {
    return "";
  }

  return [
    address.placeNumber,
    address.streetAddress,
    address.landmark,
    `${address.city || ""}, ${address.state || ""} ${address.postalCode || ""}`.trim(),
  ]
    .filter((part) => part && part.trim())
    .join(", ");
};

const mapCarrierDetail = (
  data?: GetPlantCarrierResponse["data"],
): CarrierViewData => {
  const carrier = data?.carrier;
  const stats = data?.stats;
  const history = data?.freightHistory ?? [];

  const fleetEquipment = carrier?.fleetEquipment ?? [];
  const flatbed = fleetEquipment.find(e => e.equipmentName.toLowerCase().includes("flatbed"))?.quantity ?? 0;
  const dryVan = fleetEquipment.find(e => e.equipmentName.toLowerCase().includes("dry"))?.quantity ?? 0;
  const refrigerated = fleetEquipment.find(e => e.equipmentName.toLowerCase().includes("refrigerated") || e.equipmentName.toLowerCase().includes("reefer"))?.quantity ?? 0;
  const heavyHaul = fleetEquipment.find(e => e.equipmentName.toLowerCase().includes("heavy") || e.equipmentName.toLowerCase().includes("haul"))?.quantity ?? 0;

  const totalBids = stats?.totalBids ?? 0;
  const bidWinRate = stats?.bidWinRate ?? 0;

  const formattedHistory = history.map((item) => ({
    id: item.deliveryNumber || item.jobId || "-",
    route: item.pickupLocation && item.deliveryLocation ? `${item.pickupLocation} → ${item.deliveryLocation}` : "—",
    cargo: item.projectName || "—",
    date: item.selectedAt
      ? new Date(item.selectedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : item.submittedAt
        ? new Date(item.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "—",
    status: toTitleCase(item.status || "—"),
  }));

  const assignedProjects = formattedHistory.filter(
    (h) =>
      h.status.toLowerCase() === "selected" ||
      h.status.toLowerCase() === "active" ||
      h.status.toLowerCase() === "assigned",
  );

  const complianceDocs = (carrier?.documents ?? []).map((document) => {
    const isPdf =
      document.name.toLowerCase().endsWith(".pdf") ||
      document.url.toLowerCase().includes(".pdf");

    return {
      name: document.name,
      size: "—",
      type: isPdf ? "PDF" : "Document",
      expiry: "—",
      url: document.url,
    };
  });

  return {
    id: carrier?.carrierCode || "",
    name: carrier?.carrierName || "",
    status: carrier?.status ? toTitleCase(carrier.status) : "",
    rating: totalBids > 0 ? Number(((bidWinRate / 100) * 5).toFixed(1)) : 0,
    address: formatAddress(carrier?.address),
    email: carrier?.email || "",
    phone: carrier?.phone || "",
    website: "",
    lastAwarded: stats?.lastAwardedDate
      ? new Date(stats.lastAwardedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
    serviceCategory: carrier?.serviceType || "",
    avgResponseTime: stats?.avgResponseTimeHours
      ? `responds within ${stats.avgResponseTimeHours} hrs`
      : "—",
    fleet: {
      flatbed,
      dryVan,
      refrigerated,
      heavyHaul,
      totalVehicles: carrier?.fleetCapacity?.totalVehicleCount ?? 0,
      maxCapacity: carrier?.fleetCapacity?.maximumLoadCapacity ? `${carrier.fleetCapacity.maximumLoadCapacity.toLocaleString()} lbs` : "—",
      avgAge: carrier?.fleetCapacity?.averageFleetAge ? `${carrier.fleetCapacity.averageFleetAge} Years` : "—",
    },
    notes: carrier?.internalNotes || "",
    assignedProjects,
    freightHistory: formattedHistory,
    complianceDocs,
  };
};

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

const FreightCarrierDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [assignedSort, setAssignedSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [historySort, setHistorySort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [complianceSort, setComplianceSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [docSort, setDocSort] = useState("Docs Type");
  const [docSearch, setDocSearch] = useState("");
  const [docsOpen, setDocsOpen] = useState(true);

  const { data: carrierResponse, isLoading: carrierLoading } = usePlantCarrierQuery(id ?? "", {
    enabled: !!id,
  });

  const carrierData = useMemo(
    () => mapCarrierDetail(carrierResponse?.data),
    [carrierResponse],
  );

  const handleSort = (table: "assigned" | "history" | "compliance", key: string) => {
    const setters = {
      assigned: { state: assignedSort, setter: setAssignedSort },
      history: { state: historySort, setter: setHistorySort },
      compliance: { state: complianceSort, setter: setComplianceSort },
    };
    const { state, setter } = setters[table];
    let direction: "asc" | "desc" = "asc";
    if (state?.key === key && state.direction === "asc") {
      direction = "desc";
    }
    setter({ key, direction });
  };

  const sortedAssigned = useMemo(() => {
    let items = [...carrierData.assignedProjects];
    if (assignedSort) {
      items.sort((a: any, b: any) => {
        if (a[assignedSort.key] < b[assignedSort.key]) return assignedSort.direction === "asc" ? -1 : 1;
        if (a[assignedSort.key] > b[assignedSort.key]) return assignedSort.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [assignedSort, carrierData.assignedProjects]);

  const sortedHistory = useMemo(() => {
    let items = [...carrierData.freightHistory];
    if (historySort) {
      items.sort((a: any, b: any) => {
        if (a[historySort.key] < b[historySort.key]) return historySort.direction === "asc" ? -1 : 1;
        if (a[historySort.key] > b[historySort.key]) return historySort.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [historySort, carrierData.freightHistory]);

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedHistory.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, rowsPerPage, sortedHistory]);

  const sortedDocs = useMemo(() => {
    let docs = [...carrierData.complianceDocs];
    if (docSearch) {
      docs = docs.filter(doc => doc.name.toLowerCase().includes(docSearch.toLowerCase()));
    }

    // Primary sort from dropdown
    if (docSort !== "Docs Type") {
      docs.sort((a, b) => {
        if (docSort === "Name") return a.name.localeCompare(b.name);
        if (docSort === "Size") return b.size.localeCompare(a.size);
        return 0;
      });
    }

    // Secondary sort from table header
    if (complianceSort) {
      docs.sort((a: any, b: any) => {
        if (a[complianceSort.key] < b[complianceSort.key]) return complianceSort.direction === "asc" ? -1 : 1;
        if (a[complianceSort.key] > b[complianceSort.key]) return complianceSort.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return docs;
  }, [docSort, docSearch, complianceSort, carrierData.complianceDocs]);

  if (carrierLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center gap-3 mb-2 mt-2">
          <button
            disabled
            className="p-1.5 rounded-full transition-colors shrink-0 bg-gray-100 animate-pulse"
            aria-label="Loading back button"
          >
            <ArrowLeft size={20} className="text-transparent" />
          </button>
          <div className="h-7 w-28 rounded-full bg-gray-200 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#F7F8F9] rounded-[14px] p-3 md:p-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap gap-6 items-start justify-between mb-8">
                <div className="space-y-3 flex-1">
                  <div className="h-4 w-24 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-8 w-56 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-4 w-80 rounded-full bg-gray-200 animate-pulse" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-white rounded-[14px] shadow-xs mb-6">
                <div className="h-12 rounded bg-gray-100 animate-pulse" />
                <div className="h-12 rounded bg-gray-100 animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-[14px] bg-white">
                <div className="h-12 rounded bg-gray-100 animate-pulse" />
                <div className="h-12 rounded bg-gray-100 animate-pulse" />
                <div className="h-12 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-[14px] p-6 shadow-sm">
              <div className="h-6 w-28 rounded-full bg-gray-200 animate-pulse" />
              <div className="w-full h-px bg-gray-100 my-6" />
              <div className="h-20 rounded bg-gray-100 animate-pulse" />
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => navigate("/plant/freight-carriers")}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-[#051321]" />
          </button>
          <h1 className="text-xl font-bold text-[#051321]">Carriers</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (Left 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-[#F7F8F9] rounded-[14px] p-3 md:p-6 shadow-sm relative border border-gray-100">
              <div className="flex justify-between items-start mb-6 ">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-sm">
                    <span className="text-[#7539FF] font-normal">
                      {carrierData.id}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-[#051321] truncate">
                      {carrierData.name}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 ml-4">
                      <VerifyIcon />
                      <p className="text-[#34C759] font-medium text-sm">
                        {carrierData.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-[#5D6772]">
                    <MapPin size={14} />
                    <span>{carrierData.address}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-gray-200 shadow-sm text-gray-700 bg-white hover:bg-gray-50 h-10 px-4"
                  onClick={() => navigate(`/plant/freight-carriers/${id}/edit`)}
                >
                  <PencilLine size={16} /> Edit Profile
                </Button>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-3 md:p-5 bg-white rounded-[14px] shadow-xs mb-6 border border-gray-100">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#051321] flex items-center gap-2 uppercase tracking-wide">
                    <Mail size={14} /> Email Address
                  </p>
                  <p className="text-sm text-[#5D6772]">{carrierData.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#051321] flex items-center gap-2 uppercase tracking-wide">
                    <Phone size={14} /> Phone
                  </p>
                  <p className="text-sm text-[#5D6772]">{carrierData.phone}</p>
                </div>
              </div>

              {/* Metrics Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-3 md:p-5 rounded-[14px] shadow-xs bg-white border border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="size-1 bg-[#637381] rounded-full" />
                    <p className="text-xs font-bold text-[#051321] uppercase tracking-wide">
                      Last awarded
                    </p>
                  </div>
                  <p className="text-sm text-[#5D6772] pl-3">
                    {carrierData.lastAwarded}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="size-1 bg-[#637381] rounded-full" />
                    <p className="text-xs font-bold text-[#051321] uppercase tracking-wide">
                      Service Category
                    </p>
                  </div>
                  <p className="text-sm text-[#5D6772] pl-3">
                    {carrierData.serviceCategory}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="size-1 bg-[#637381] rounded-full" />
                    <p className="text-xs font-bold text-[#051321] uppercase tracking-wide">
                      Avg Response Time
                    </p>
                  </div>
                  <p className="text-sm text-[#5D6772] pl-3">
                    {carrierData.avgResponseTime}
                  </p>
                </div>
              </div>

              {/* Fleet & Equipment Details */}
              <div className="bg-white rounded-[14px] p-3 shadow-xs mt-6 border border-gray-100">
                <div className="p-2">
                  <SubHeading text="Fleet & Equipment Details" />
                </div>
                <div className="h-px bg-[#E2E4E6] my-6" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 px-2">
                  {[
                    { label: "Flatbed Trucks", value: carrierData.fleet.flatbed },
                    { label: "Dry Vans", value: carrierData.fleet.dryVan },
                    {
                      label: "Refrigerated Trucks",
                      value: carrierData.fleet.refrigerated,
                    },
                    {
                      label: "Heavy Haul Trailers",
                      value: carrierData.fleet.heavyHaul,
                    },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="size-1 bg-[#637381] rounded-full" />
                        <p className="text-xs font-semibold text-[#051321] tracking-wide">
                          {item.label}
                        </p>
                      </div>
                      <p className="text-sm font-normal text-[#5D6772] pl-3">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-2 mt-4">
                  <SubHeading text="Fleet Capacity" />
                </div>
                <div className="h-px bg-[#E2E4E6] my-6" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2 pb-2">
                  {[
                    {
                      label: "Total Vehicles",
                      value: carrierData.fleet.totalVehicles,
                    },
                    {
                      label: "Maximum Load Capacity",
                      value: carrierData.fleet.maxCapacity,
                    },
                    {
                      label: "Average Fleet Age",
                      value: carrierData.fleet.avgAge,
                    },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="size-1 bg-[#637381] rounded-full" />
                        <p className="text-sm font-semibold text-[#051321] tracking-wide">
                          {item.label}
                        </p>
                      </div>
                      <p className="text-sm font-normal text-[#5D6772] pl-3">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Assigned Projects Table */}
            <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <SubHeading text="Assigned Projects" />
              </div>

              <div className="overflow-x-auto rounded-lg border border-[#E2E4E6]">
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead className="bg-[#F4F6F8]">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-black border-b border-r border-[#E2E4E6]">
                        Freight ID
                      </th>
                      <th
                        className="px-6 py-3 text-xs font-medium text-black border-b border-r border-[#E2E4E6] cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort("assigned", "route")}
                      >
                        <div className="flex items-center gap-1">
                          Route <ArrowUpDown size={14} className={assignedSort?.key === "route" ? "text-blue-500" : "text-gray-400"} />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-xs font-medium text-black border-b border-r border-[#E2E4E6] cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort("assigned", "cargo")}
                      >
                        <div className="flex items-center gap-1">
                          Project <ArrowUpDown size={14} className={assignedSort?.key === "cargo" ? "text-blue-500" : "text-gray-400"} />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-xs font-medium text-black border-b border-r border-[#E2E4E6] cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort("assigned", "date")}
                      >
                        <div className="flex items-center gap-1">
                          Delivery Date <ArrowUpDown size={14} className={assignedSort?.key === "date" ? "text-blue-500" : "text-gray-400"} />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-black border-b border-[#E2E4E6]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E4E6]">
                    {sortedAssigned.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center bg-white rounded-b-lg">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-xs mb-3 text-gray-400">
                              <Briefcase size={22} />
                            </div>
                            <h3 className="text-sm font-semibold text-[#051321]">
                              No assigned projects
                            </h3>
                            <p className="text-xs text-[#5D6772] mt-1 max-w-[280px]">
                              There are currently no active or selected projects assigned to this carrier.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sortedAssigned.map((project, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-[#5D6772] font-medium border-r border-[#E2E4E6]">
                            {project.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#051321] font-semibold border-r border-[#E2E4E6]">
                            {project.route}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#5D6772] border-r border-[#E2E4E6]">
                            {project.cargo}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#051321] font-medium border-r border-[#E2E4E6]">
                            {project.date}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full w-fit">
                              {project.status} <CheckCircle2 size={14} />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Freight History Table */}
            <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <SubHeading text="Freight History" />
              </div>

              <div className="overflow-x-auto rounded-lg border border-[#E2E4E6]">
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead className="bg-[#F4F6F8]">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-black border-b border-r border-[#E2E4E6]">Freight ID</th>
                      <th
                        className="px-6 py-3 text-xs font-medium text-black border-b border-r border-[#E2E4E6] cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort("history", "route")}
                      >
                        <div className="flex items-center gap-1">Route <ArrowUpDown size={14} className={historySort?.key === "route" ? "text-blue-500" : "text-gray-400"} /></div>
                      </th>
                      <th
                        className="px-6 py-3 text-xs font-medium text-black border-b border-r border-[#E2E4E6] cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort("history", "cargo")}
                      >
                        <div className="flex items-center gap-1">Cargo <ArrowUpDown size={14} className={historySort?.key === "cargo" ? "text-blue-500" : "text-gray-400"} /></div>
                      </th>
                      <th
                        className="px-6 py-3 text-xs font-medium text-black border-b border-r border-[#E2E4E6] cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort("history", "date")}
                      >
                        <div className="flex items-center gap-1">Delivery Date <ArrowUpDown size={14} className={historySort?.key === "date" ? "text-blue-500" : "text-gray-400"} /></div>
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-black border-b border-[#E2E4E6]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E4E6]">
                    {paginatedHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center bg-white rounded-b-lg">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-xs mb-3 text-gray-400">
                              <History size={22} />
                            </div>
                            <h3 className="text-sm font-semibold text-[#051321]">
                              No freight history
                            </h3>
                            <p className="text-xs text-[#5D6772] mt-1 max-w-[280px]">
                              This carrier doesn't have any recorded freight delivery history yet.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedHistory.map((project, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-[#006CE4] font-medium underline cursor-pointer border-r border-[#E2E4E6]">
                            {project.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#051321] font-semibold border-r border-[#E2E4E6]">{project.route}</td>
                          <td className="px-6 py-4 text-sm text-[#5D6772] border-r border-[#E2E4E6]">{project.cargo}</td>
                          <td className="px-6 py-4 text-sm text-[#051321] font-medium border-r border-[#E2E4E6]">{project.date}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-[#34C759] bg-[#E8F9EE] px-2.5 py-1 rounded-full w-fit border border-[#34C759]">
                              {project.status} <CheckCircle2 size={14} />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {carrierData.freightHistory.length > 0 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={carrierData.freightHistory.length}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={setRowsPerPage}
                  />
                </div>
              )}
            </div>

            {/* Compliance & Certifications */}
            <div className="bg-white rounded-[14px] shadow-sm border border-gray-100 overflow-hidden">
              <div
                className="p-6 flex items-center justify-between cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors"
                onClick={() => setDocsOpen(!docsOpen)}
              >
                <SubHeading text="Compliance & Certifications" />
                <ChevronDown size={20} className={`text-[#637381] transition-transform ${docsOpen ? 'rotate-180' : ''}`} />
              </div>

              {docsOpen && (
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <p className="text-sm font-bold text-[#111827]">
                      Total No of Documents : {carrierData.complianceDocs.length}
                    </p>
                    <div className="flex items-center gap-3">
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
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                        <input
                          type="text"
                          placeholder="Search"
                          value={docSearch}
                          onChange={(e) => setDocSearch(e.target.value)}
                          className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-[200px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-[#E2E4E6]">
                    <table className="w-full text-left border-separate border-spacing-0">
                      <thead className="bg-[#F4F6F8]">
                        <tr>
                          <th
                            className="px-6 py-3 text-xs font-medium text-black border-b border-r border-[#E2E4E6] cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort("compliance", "name")}
                          >
                            <div className="flex items-center gap-1">Name <ArrowUpDown size={14} className={complianceSort?.key === "name" ? "text-blue-500" : "text-gray-400"} /></div>
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-black border-b border-r border-[#E2E4E6]">Size</th>
                          <th className="px-6 py-3 text-xs font-medium text-black border-b border-r border-[#E2E4E6]">Type</th>
                          <th className="px-6 py-3 text-xs font-medium text-black border-b border-[#E2E4E6]">Expiry Date</th>
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
                                  There are no compliance documents or certifications uploaded for this carrier.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          sortedDocs.map((doc, i) => (
                            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 border-r border-[#E2E4E6]">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-[#F8F9FA] rounded-md shrink-0 border border-gray-100">
                                    <img src={pdfIcon} alt="PDF" className="size-5" />
                                  </div>
                                  {doc.url ? (
                                    <a
                                      href={doc.url}
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
                              <td className="px-6 py-4 text-sm text-[#5D6772] border-r border-[#E2E4E6]">{doc.size}</td>
                              <td className="px-6 py-4 text-sm text-[#5D6772] border-r border-[#E2E4E6]">{doc.type}</td>
                              <td className="px-6 py-4 text-sm text-[#051321] font-medium">{doc.expiry}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar (Right 1/3) */}
          <div className="space-y-6">
            {/* Notes Card */}
            <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-100">
              <SubHeading text="Notes" />
              <div className="h-px bg-gray-100 my-6" />
              {carrierData.notes && carrierData.notes.trim() ? (
                <p className="text-sm text-[#637381] leading-relaxed">
                  {carrierData.notes}
                </p>
              ) : (
                <p className="text-sm text-[#919EAB] italic font-inter">
                  No notes available for this carrier.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default FreightCarrierDetails;
