import React, { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  FileText,
  Upload,
  // Settings, 
  Plus,
  Search,
  Filter,
  ChevronDown,
  ArrowUpDown,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import AddEditPartCostModal from "./modals/AddEditPartCostModal";
import UploadBOMModal from "./modals/UploadBOMModal";
import Pagination from "../components/Pagination";
import ItemCostFilterModal, { type ItemCostFilterValues } from "./ItemCostFilterModal";
import { useSmdtStatsQuery, useSmdtItemsQuery, useExportSmdtExcelMutation } from "@/modules/plant/smdt.hooks";
import { toast } from "sonner";
import type { SmdtItem } from "@/modules/plant/smdt.api";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ItemCostList() {
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isUploadBOMOpen, setIsUploadBOMOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Search & Filter State
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50);
  const [appliedFilters, setAppliedFilters] = useState<ItemCostFilterValues>({
    category: "",
    isFrameType: "all",
    isActive: "true",
  });

  const queryParams = useMemo(() => {
    return {
      search: debouncedSearch.trim() || undefined,
      category: appliedFilters.category || undefined,
      isFrameType: appliedFilters.isFrameType === "all" ? undefined : appliedFilters.isFrameType === "true",
      isActive: appliedFilters.isActive,
      page: currentPage,
      limit: rowsPerPage,
    };
  }, [debouncedSearch, appliedFilters, currentPage, rowsPerPage]);

  const exportMutation = useExportSmdtExcelMutation();

  const { data: statsResponse, isLoading: isStatsLoading } = useSmdtStatsQuery();
  const { data: itemsResponse, isLoading: isItemsLoading, isFetching: isItemsFetching } = useSmdtItemsQuery(queryParams);

  const stats = statsResponse?.data;
  const items = itemsResponse?.data?.items ?? [];
  const categories = itemsResponse?.data?.categories ?? [];
  const totalItems = itemsResponse?.data?.total ?? 0;

  const loading = isItemsLoading || isItemsFetching;

  const handleExport = async () => {
    try {
      const filters = {
        search: debouncedSearch.trim() || undefined,
        category: appliedFilters.category || undefined,
        isFrameType: appliedFilters.isFrameType === "all" ? undefined : appliedFilters.isFrameType === "true",
        isActive: appliedFilters.isActive,
      };

      toast.info("Generating Excel export...");
      const blob = await exportMutation.mutateAsync(filters);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "smdt-cost-list.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Excel exported successfully!");
    } catch (error: any) {
      console.error("Failed to export SMDT excel:", error);
      let errorMsg = "Failed to export SMDT Excel file";
      if (error?.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          errorMsg = parsed.message || errorMsg;
        } catch {
          // ignore
        }
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      toast.error(errorMsg);
    }
  };

  const handleEdit = (item: SmdtItem) => {
    setEditingItem(item);
    setIsAddEditOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsAddEditOpen(true);
  };

  const handleApplyFilters = (filters: ItemCostFilterValues) => {
    setAppliedFilters(filters);
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Item Cost List</h1>
          {stats?.activeVersion && (
            <p className="text-sm text-gray-500 mt-1">
              Active: <span className="font-semibold text-slate-700">{stats.activeVersion.name}</span> (Effective: {new Date(stats.activeVersion.effectiveDate).toLocaleDateString()})
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            className="bg-white hover:bg-gray-50 border-gray-200"
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {exportMutation.isPending ? "Exporting..." : "Export"}
          </Button>
          {/* <Button 
            className="bg-[#6B7280] hover:bg-gray-600 text-white border-none"
            onClick={() => setIsUploadBOMOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Check BOM Costing
          </Button> */}
          <Button
            className="bg-[#8B5CF6] hover:bg-purple-600 text-white border-none"
            onClick={handleAdd}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Item/Part Cost
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#3B82F6] rounded-2xl p-6 text-white flex justify-between items-center shadow-sm">
          <div>
            <p className="text-blue-100 font-medium text-sm mb-1">Total Item Cost</p>
            <h2 className="text-4xl font-bold">
              {isStatsLoading ? "..." : formatCurrency(stats?.totalItemCost)}
            </h2>
          </div>
          <DollarSign className="w-12 h-12 text-blue-200/50" strokeWidth={1.5} />
        </div>

        <div className="bg-[#10B981] rounded-2xl p-6 text-white flex justify-between items-center shadow-sm">
          <div>
            <p className="text-emerald-100 font-medium text-sm mb-1">Total Items</p>
            <h2 className="text-4xl font-bold">
              {isStatsLoading ? "..." : stats?.totalItems ?? 0}
            </h2>
          </div>
          <TrendingUp className="w-12 h-12 text-emerald-200/50" strokeWidth={1.5} />
        </div>

        <div className="bg-[#F97316] rounded-2xl p-6 text-white flex justify-between items-center shadow-sm">
          <div>
            <p className="text-orange-100 font-medium text-sm mb-1">New Added</p>
            <h2 className="text-4xl font-bold">
              {isStatsLoading ? "..." : stats?.newlyAdded ?? 0}
            </h2>
          </div>
          <FileText className="w-10 h-10 text-orange-200/50" strokeWidth={1.5} />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by part name..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 bg-white border-gray-200 h-10 w-full"
            />
          </div>
          <Button
            variant="outline"
            className={`bg-white border-gray-200 h-10 px-4 ${appliedFilters.category || appliedFilters.isFrameType !== "all" || appliedFilters.isActive !== "true"
                ? "border-blue-500 text-blue-600 bg-blue-50/50 hover:bg-blue-50"
                : ""
              }`}
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
        <div className="flex items-center">
          <Button variant="outline" className="bg-white border-gray-200 h-10 text-gray-700 font-normal">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            Sort by : Latest
            <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mt-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Part Cost List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8FAFC] text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-12">
                  <Checkbox className="border-gray-300" />
                </th>
                <th className="px-6 py-4 whitespace-nowrap">Part Name</th>
                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-gray-900">
                  <div className="flex items-center gap-1">
                    Part Colour <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-gray-900">
                  <div className="flex items-center gap-1">
                    Cost Unit <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-gray-900">
                  <div className="flex items-center gap-1">
                    MBS Cost <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-gray-900">
                  <div className="flex items-center gap-1">
                    Current Market Cost <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-gray-900">
                  <div className="flex items-center gap-1">
                    Description <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="px-6 py-4 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={`item-skeleton-${index}`} className="border-b border-gray-50">
                    <td className="px-6 py-4">
                      <div className="h-4 w-4 rounded bg-gray-100 animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-12 rounded bg-gray-100 animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-8 rounded bg-gray-100 animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 rounded bg-gray-100 animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 rounded bg-gray-100 animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-48 rounded bg-gray-100 animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-7 w-16 rounded bg-gray-100 animate-pulse ml-auto" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No parts or items found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Checkbox className="border-gray-300" />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.partName}</td>
                    <td className="px-6 py-4 text-gray-500">{item.partColor}</td>
                    <td className="px-6 py-4 text-gray-500">{item.costUnit}</td>
                    <td className="px-6 py-4 text-gray-500">{formatCurrency(item.mbsCost)}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.currentMarketCost !== null ? formatCurrency(item.currentMarketCost) : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.description || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        className="bg-[#5C5CFF] hover:bg-blue-600 text-white rounded-[4px] h-7 px-4 text-xs font-medium"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && totalItems > 0 && (
          <Pagination
            totalItems={totalItems}
            itemsPerPage={rowsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <ItemCostFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        categories={categories}
        initialFilters={appliedFilters}
        onApply={handleApplyFilters}
      />

      <AddEditPartCostModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        initialData={editingItem}
      />

      <UploadBOMModal
        isOpen={isUploadBOMOpen}
        onClose={() => setIsUploadBOMOpen(false)}
      />
    </div>
  );
}
