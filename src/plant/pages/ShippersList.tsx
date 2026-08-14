import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Store,
  Eye,
  Pencil,
} from "lucide-react";
import TitleSubtitle from "@/components/TitleSubtitle";
import { Button } from "@/components/ui/button";
import Pagination from "../components/Pagination";
import VendorShipperFilterModal, {
  type VendorShipperFilterValues,
} from "./VendorShipperFilterModal";
import { usePlantVendorsQuery } from "@/modules/plant/vendor.hooks";
import type { PlantVendor } from "@/modules/plant/vendor.api";

interface VendorRow {
  id: string;
  name: string;
  vendorId: string;
  contact: string;
  email: string;
  phone: string;
  materialTypes: string[];
  extraMaterials: number;
  orders: { active: number; total: number };
  status: string;
  vendorType: string;
  pickupLocation: string;
  onTimeDeliveries: string;
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
      className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${isActive
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-gray-100 text-gray-600 border border-gray-200"
        }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-600" : "bg-gray-500"}`} />
      {toTitleCase(status)}
    </span>
  );
};

export default function ShippersList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(20);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<VendorShipperFilterValues>({
    materialType: "",
    status: "",
  });

  const queryArgs = useMemo(
    () => ({
      search: searchTerm.trim() || undefined,
      materialType: appliedFilters.materialType || undefined,
      status: (appliedFilters.status as "active" | "inactive") || undefined,
      page: currentPage,
      limit: rowsPerPage,
    }),
    [appliedFilters.materialType, appliedFilters.status, currentPage, rowsPerPage, searchTerm],
  );

  const {
    data: vendorsResponse,
    isLoading,
    isFetching,
  } = usePlantVendorsQuery(queryArgs);

  const vendors = useMemo<VendorRow[]>(() => {
    return (vendorsResponse?.data?.vendors ?? []).map((vendor: PlantVendor) => ({
      id: vendor._id,
      name: vendor.vendorName,
      vendorId: vendor.vendorCode,
      contact: vendor.contactName,
      email: vendor.email,
      phone: vendor.phone,
      materialTypes: vendor.materialTypes,
      extraMaterials: Math.max(0, vendor.materialTypes.length - 1),
      orders: {
        active: vendor.activeOrders,
        total: vendor.totalOrders,
      },
      status: vendor.status,
      vendorType: vendor.vendorType,
      pickupLocation: vendor.pickupLocation,
      onTimeDeliveries: "-",
    }));
  }, [vendorsResponse]);

  const totalVendors = vendorsResponse?.data?.total ?? 0;

  const materialTypeOptions = useMemo(() => {
    const uniqueMaterialTypes = new Set<string>();

    (vendorsResponse?.data?.vendors ?? []).forEach((vendor) => {
      vendor.materialTypes.forEach((materialType) => {
        if (materialType.trim()) {
          uniqueMaterialTypes.add(materialType);
        }
      });
    });

    return [
      { label: "All Materials", value: "" },
      ...Array.from(uniqueMaterialTypes)
        .sort((left, right) => left.localeCompare(right))
        .map((materialType) => ({ label: materialType, value: materialType })),
    ];
  }, [vendorsResponse]);

  const loading = isLoading || isFetching;

  const handleAddVendor = () => {
    navigate("/plant/shippers/add");
  };

  const handleEditVendor = (vendor: VendorRow) => {
    navigate(`/plant/shippers/${vendor.id}/edit`);
  };

  const handleApplyFilters = (filters: VendorShipperFilterValues) => {
    setAppliedFilters(filters);
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  const headers = [
    "Shipper",
    "Contact",
    "Email",
    "Phone",
    "Material Types",
    "Orders",
    "Status",
    "Vendor Type",
    "Pickup Location",
    "On-time Deliveries",
    "Actions",
  ];

  const emptyState = !loading && vendors.length === 0;

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#f4f7fb] min-h-screen font-sans">
      <div className="flex flex-col gap-1 pt-1">
        <TitleSubtitle
          title="Logistics"
          subtitle="Manage Shipper companies and material vendors"
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by vendor, contact, email, or material..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
          <Button
            variant="outline"
            className="border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-medium"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button
            className="bg-[#2563eb] hover:bg-blue-700 text-white font-medium shadow-sm"
            onClick={handleAddVendor}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Vendor
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#eef4fa] border-b border-blue-100 text-gray-600 font-bold uppercase text-xs">
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-3 py-3 whitespace-nowrap first:rounded-tl-xl last:rounded-tr-xl"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                Array.from({ length: Math.min(rowsPerPage, 5) }).map((_, index) => (
                  <tr key={`vendor-skeleton-${index}`} className="bg-white">
                    {Array.from({ length: headers.length }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-3 py-4">
                        <div className="h-4 rounded bg-gray-100 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : emptyState ? (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="px-3 py-8 text-center text-sm text-[#637381]"
                  >
                    No vendors match the current filters.
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                          <Store className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-gray-900 leading-tight truncate">
                            {vendor.name}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {vendor.vendorId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 font-medium text-gray-700">
                      {vendor.contact}
                    </td>
                    <td className="px-3 py-4">
                      <a
                        href={`mailto:${vendor.email}`}
                        className="text-blue-500 hover:underline flex items-center gap-1 whitespace-nowrap"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">{vendor.email}</span>
                      </a>
                    </td>
                    <td className="px-3 py-4">
                      <a
                        href={`tel:${vendor.phone}`}
                        className="text-blue-500 hover:underline flex items-center gap-1 whitespace-nowrap"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{vendor.phone}</span>
                      </a>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-wrap gap-1">
                        {vendor.materialTypes.map((type) => (
                          <span
                            key={type}
                            className="px-2 py-0.5 bg-[#F3E8FF] text-[#8200DB] text-[10px] font-semibold rounded whitespace-nowrap"
                          >
                            {type}
                          </span>
                        ))}
                        {vendor.extraMaterials > 0 && (
                          <span className="px-2 py-0.5 bg-[#F4F6F8] text-[#637381] text-[10px] font-semibold rounded">
                            +{vendor.extraMaterials}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">
                          {vendor.orders.active} active
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {vendor.orders.total} total
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <StatusBadge status={vendor.status} />
                    </td>
                    <td className="px-3 py-4 font-medium text-gray-700 whitespace-nowrap">
                      {vendor.vendorType}
                    </td>
                    <td className="px-3 py-4 font-medium text-gray-700 whitespace-nowrap">
                      {vendor.pickupLocation}
                    </td>
                    <td className="px-3 py-4 font-medium text-gray-700 whitespace-nowrap">
                      {vendor.onTimeDeliveries}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2.5">
                        <button
                          className="text-gray-500 hover:text-gray-900 transition-colors"
                          onClick={() => navigate(`/plant/shippers/${vendor.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          onClick={() => handleEditVendor(vendor)}
                        >
                          <Pencil className="w-4 h-4" />
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

      {totalVendors > 0 && (
        <Pagination
          totalItems={totalVendors}
          itemsPerPage={rowsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}

      <VendorShipperFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        materialTypeOptions={materialTypeOptions}
        onApply={handleApplyFilters}
      />
    </div>
  );
}
