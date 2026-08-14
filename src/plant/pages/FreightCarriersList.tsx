import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Pencil, Trash2, Truck } from "lucide-react";
import TitleSubtitle from "@/components/TitleSubtitle";
import Pagination from "../components/Pagination";
import CarrierFilterModal, { type CarrierFilterValues } from "./CarrierFilterModal";
import { usePlantCarriersQuery } from "@/modules/plant/carrier.hooks";
import type { PlantCarrier } from "@/modules/plant/carrier.api";

interface CarrierRow {
  id: string;
  name: string;
  carrierId: string;
  contact: string;
  email: string;
  phone: string;
  bids: { active: number; total: number };
  awarded: { count: number; winRate: number };
  avgBid: { amount: number; responseTime: string };
  status: string;
  serviceType: string;
  serviceArea: string;
  equipmentTypes: string[];
}

const normalizeStatus = (status: string) =>
  status
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "_");

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isActive = normalizeStatus(status) === "active";
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
        isActive
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-gray-100 text-gray-600 border border-gray-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-600" : "bg-gray-500"}`} />
      {toTitleCase(status)}
    </span>
  );
};

export default function FreightCarriersList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(20);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<CarrierFilterValues>({
    serviceType: "",
    serviceArea: "",
    equipmentType: "",
    status: "",
  });

  const queryArgs = useMemo(
    () => ({
      search: searchTerm.trim() || undefined,
      serviceType: appliedFilters.serviceType || undefined,
      serviceArea: appliedFilters.serviceArea || undefined,
      equipmentType: appliedFilters.equipmentType || undefined,
      status: (appliedFilters.status as "active" | "inactive") || undefined,
      page: currentPage,
      limit: rowsPerPage,
    }),
    [appliedFilters, currentPage, rowsPerPage, searchTerm]
  );

  const {
    data: carriersResponse,
    isLoading,
    isFetching,
  } = usePlantCarriersQuery(queryArgs);

  const carriers = useMemo<CarrierRow[]>(() => {
    return (carriersResponse?.data?.carriers ?? []).map((carrier: PlantCarrier) => ({
      id: carrier._id,
      name: carrier.carrierName,
      carrierId: carrier.carrierCode,
      contact: carrier.contactName,
      email: carrier.email,
      phone: carrier.phone,
      bids: {
        active: carrier.activeBids,
        total: carrier.totalBids,
      },
      awarded: {
        count: carrier.awardedBidCount,
        winRate: carrier.bidWinRate,
      },
      avgBid: {
        amount: carrier.avgBid,
        responseTime: "Responds within 45 min",
      },
      status: carrier.status,
      serviceType: carrier.serviceType,
      serviceArea: carrier.serviceArea,
      equipmentTypes: carrier.equipmentTypes,
    }));
  }, [carriersResponse]);

  const totalCarriers = carriersResponse?.data?.total ?? 0;

  const serviceTypeOptions = useMemo(() => {
    const uniqueTypes = new Set<string>();
    (carriersResponse?.data?.carriers ?? []).forEach((carrier) => {
      if (carrier.serviceType?.trim()) {
        uniqueTypes.add(carrier.serviceType.trim());
      }
    });
    return [
      { label: "All Service Types", value: "" },
      ...Array.from(uniqueTypes)
        .sort((a, b) => a.localeCompare(b))
        .map((type) => ({ label: type, value: type })),
    ];
  }, [carriersResponse]);

  const serviceAreaOptions = useMemo(() => {
    const uniqueAreas = new Set<string>();
    (carriersResponse?.data?.carriers ?? []).forEach((carrier) => {
      if (carrier.serviceArea?.trim()) {
        uniqueAreas.add(carrier.serviceArea.trim());
      }
    });
    return [
      { label: "All Service Areas", value: "" },
      ...Array.from(uniqueAreas)
        .sort((a, b) => a.localeCompare(b))
        .map((area) => ({ label: area, value: area })),
    ];
  }, [carriersResponse]);

  const equipmentTypeOptions = useMemo(() => {
    const uniqueEquips = new Set<string>();
    (carriersResponse?.data?.carriers ?? []).forEach((carrier) => {
      (carrier.equipmentTypes ?? []).forEach((equip) => {
        if (equip?.trim()) {
          uniqueEquips.add(equip.trim());
        }
      });
    });
    return [
      { label: "All Equipment Types", value: "" },
      ...Array.from(uniqueEquips)
        .sort((a, b) => a.localeCompare(b))
        .map((equip) => ({ label: equip, value: equip })),
    ];
  }, [carriersResponse]);

  const loading = isLoading || isFetching;

  const handleApplyFilters = (filters: CarrierFilterValues) => {
    setAppliedFilters(filters);
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  const headers = [
    "Carrier",
    "Contact",
    "Email",
    "Phone",
    "Bids",
    "Awarded",
    "Avg Bid",
    "Status",
    "Service Type",
    "Service Area",
    "Equipment Type",
    "Actions",
  ];

  const emptyState = !loading && carriers.length === 0;

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#f4f7fb] min-h-screen font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-1 pt-1">
        <TitleSubtitle
          title="Freight Carriers"
          subtitle="Manage freight haulers and carriers for bidding"
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by carrier name, contact, email, or phone..."
            className="pl-9 bg-white border-gray-200"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className="border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-medium"
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filter
          </Button>
          <Button
            className="bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg font-medium flex-1 sm:flex-none"
            onClick={() => navigate("/plant/freight-carriers/add")}
          >
            + Add Carrier
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left min-w-[1200px]">
            <thead className="bg-[#eef4fa] text-gray-600 font-bold border-b border-blue-100 text-xs uppercase">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-4 whitespace-nowrap first:rounded-tl-xl last:rounded-tr-xl"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                Array.from({ length: Math.min(rowsPerPage, 5) }).map((_, index) => (
                  <tr key={`carrier-skeleton-${index}`} className="bg-white">
                    {Array.from({ length: headers.length }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-4">
                        <div className="h-4 rounded bg-gray-100 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : emptyState ? (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="px-4 py-8 text-center text-sm text-[#637381]"
                  >
                    No carriers match the current filters.
                  </td>
                </tr>
              ) : (
                carriers.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm leading-tight">
                            {row.name}
                          </div>
                          <div className="text-gray-400 text-[11px] mt-0.5">{row.carrierId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900 leading-tight">{row.contact}</div>
                    </td>
                    <td className="px-4 py-4">
                      <a
                        href={`mailto:${row.email}`}
                        className="text-blue-500 flex items-center gap-1 hover:underline whitespace-nowrap"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        {row.email}
                      </a>
                    </td>
                    <td className="px-4 py-4">
                      <a
                        href={`tel:${row.phone}`}
                        className="text-blue-500 flex items-center gap-1 hover:underline whitespace-nowrap"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span>{row.phone}</span>
                      </a>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-gray-900 text-sm leading-tight">
                        {row.bids.active} <br />
                        active
                      </div>
                      <div className="text-gray-400 text-[11px] mt-0.5">{row.bids.total} total</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-green-600 text-sm leading-tight">
                        {row.awarded.count}
                      </div>
                      <div className="text-gray-400 text-[11px] mt-0.5">
                        {row.awarded.winRate}% win
                        <br />
                        rate
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-gray-900 text-sm leading-tight">
                        $
                        {row.avgBid.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-gray-400 text-[11px] leading-tight">average</div>
                      <div className="text-gray-400 text-[10px] mt-1 flex items-start gap-1">
                        <span className="mt-1 flex-shrink-0 w-1 h-1 rounded-full bg-gray-400"></span>
                        {row.avgBid.responseTime}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700">
                      <div className="w-[80px]">{row.serviceType}</div>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700">
                      <div className="w-[80px]">{row.serviceArea}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1 w-[120px]">
                        {row.equipmentTypes.map((type) => (
                          <span
                            key={type}
                            className="px-2 py-0.5 bg-[#E0F2FE] text-[#0369A1] text-[10px] font-semibold rounded whitespace-nowrap"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <Link
                          to={`/plant/freight-carriers/${row.id}`}
                          className="text-gray-500 hover:text-gray-900 transition-colors block"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/plant/freight-carriers/${row.id}/edit`}
                          className="text-blue-500 hover:text-blue-700 transition-colors block"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button className="text-red-500 hover:text-red-700 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalCarriers > 0 && (
        <Pagination
          totalItems={totalCarriers}
          itemsPerPage={rowsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Filter Modal */}
      <CarrierFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        serviceTypeOptions={serviceTypeOptions}
        serviceAreaOptions={serviceAreaOptions}
        equipmentTypeOptions={equipmentTypeOptions}
        onApply={handleApplyFilters}
      />

    </div>
  );
}
