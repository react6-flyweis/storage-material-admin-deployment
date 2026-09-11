import { useState } from "react";
import { Upload, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddProductDialog } from "@/components/add-product-dialog";
import {
  useProductsQuery,
  useProductCategoriesQuery,
  useExportProductsMutation,
} from "@/modules/products/products.hooks";

const pricingTypeOptions = [
  { label: "Per lb", value: "per_lb" },
  { label: "Per sq ft", value: "per_sq_ft" },
  { label: "Per linear ft", value: "per_linear_ft" },
  { label: "Per qty", value: "per_qty" },
];

const statusOptions = ["Active", "Inactive"];

const getCategoryColor = (category?: string) => {
  switch (category?.toLowerCase()) {
    case "structure":
      return "bg-gray-100 text-gray-800";
    case "panels":
      return "bg-blue-50 text-blue-600";
    case "hardware":
      return "bg-gray-100 text-gray-800";
    case "trims":
      return "bg-orange-50 text-orange-500";
    case "opening":
      return "bg-purple-50 text-purple-600";
    case "accessories":
      return "bg-pink-50 text-pink-600";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatPricingType = (pricingType?: string) => {
  if (!pricingType) return "-";
  if (pricingType === "per_lb") return "Per lb";
  if (pricingType === "per_sq_ft") return "Per sq ft";
  if (pricingType === "per_linear_ft") return "Per linear ft";
  if (pricingType === "per_qty") return "Per qty";
  return pricingType;
};

export default function ProductLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [pricingTypeFilter, setPricingTypeFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    categoryFilter !== "all" ||
    subcategoryFilter !== "all" ||
    pricingTypeFilter !== "all" ||
    vendorFilter !== "all" ||
    statusFilter !== "all";

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setSubcategoryFilter("all");
    setPricingTypeFilter("all");
    setVendorFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  const { data: categoriesData } = useProductCategoriesQuery();

  const categoryOptions = categoriesData?.data?.categories || [];
  const subcategoryOptions = categoriesData?.data?.subcategories || [];
  const vendorOptions = categoriesData?.data?.vendors || [];

  const { data, isLoading, isError, error } = useProductsQuery({
    page,
    limit,
    search: searchTerm.trim() || undefined,
    category: categoryFilter,
    subcategory: subcategoryFilter,
    pricingType: pricingTypeFilter,
    vendor: vendorFilter,
    status: statusFilter,
  });

  const exportMutation = useExportProductsMutation();

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({
        search: searchTerm.trim() || undefined,
        category: categoryFilter,
        subcategory: subcategoryFilter,
        pricingType: pricingTypeFilter,
        vendor: vendorFilter,
        status: statusFilter,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `products_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const productsData = data?.data?.products || [];
  const totalProducts = data?.data?.total || 0;
  const totalPages = Math.ceil(totalProducts / limit) || 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Library</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all products, pricing and configurations used in quotations
            and projects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="bg-white border-gray-200"
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Export
          </Button>
          <Button
            className="bg-[#2563EB] hover:bg-blue-700 text-white"
            onClick={() => setIsAddProductOpen(true)}
          >
            Add New Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <Select
          value={categoryFilter}
          onValueChange={(val) => {
            setCategoryFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoryOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={subcategoryFilter}
          onValueChange={(val) => {
            setSubcategoryFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="All Subcategories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subcategories</SelectItem>
            {subcategoryOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={pricingTypeFilter}
          onValueChange={(val) => {
            setPricingTypeFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="All Pricing Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pricing Types</SelectItem>
            {pricingTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={vendorFilter}
          onValueChange={(val) => {
            setVendorFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="All Vendors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            {vendorOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option} value={option.toLowerCase()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="p-4 flex items-center justify-end gap-3 border-b border-gray-100">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="text-gray-600 border-gray-200 bg-white hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-1.5" />
              Clear Filters
            </Button>
          )}
          <div className="w-full max-w-md">
            <Input
              type="text"
              placeholder="Search by Product name or SKU"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-semibold text-gray-900 border-b border-gray-200">
                  Product Name
                </TableHead>
                <TableHead className="font-semibold text-gray-900 border-b border-gray-200">
                  Category
                </TableHead>
                <TableHead className="font-semibold text-gray-900 border-b border-gray-200">
                  Subcategory
                </TableHead>
                <TableHead className="font-semibold text-gray-900 border-b border-gray-200">
                  SKU / Part Code
                </TableHead>
                <TableHead className="font-semibold text-gray-900 border-b border-gray-200">
                  Pricing Type
                </TableHead>
                <TableHead className="font-semibold text-gray-900 border-b border-gray-200">
                  Unit
                </TableHead>
                <TableHead className="font-semibold text-gray-900 border-b border-gray-200">
                  Base Cost (USD)
                </TableHead>
                <TableHead className="font-semibold text-gray-900 border-b border-gray-200">
                  Default Markup
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span>Loading products...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-red-500">
                    Failed to load products. {error?.message || "An error occurred."}
                  </TableCell>
                </TableRow>
              ) : productsData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                productsData.map((product) => (
                  <TableRow key={product._id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium text-gray-900 py-4">
                      {product.name}
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                          product.category
                        )}`}
                      >
                        {product.category || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600 py-4">
                      {product.subcategory || "-"}
                    </TableCell>
                    <TableCell className="text-gray-600 py-4">
                      {product.skuPartCode || "-"}
                    </TableCell>
                    <TableCell className="text-gray-600 py-4">
                      {formatPricingType(product.pricingType)}
                    </TableCell>
                    <TableCell className="text-gray-600 py-4">
                      {product.unit || "-"}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 py-4">
                      ${typeof product.baseCost === "number" ? product.baseCost.toFixed(2) : product.baseCost ?? "-"}
                    </TableCell>
                    <TableCell className="text-gray-600 py-4">
                      {typeof product.defaultMargin === "number" ? `${product.defaultMargin}%` : product.defaultMargin ?? "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="p-4 bg-white flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          Showing
          <Select
            value={limit.toString()}
            onValueChange={(val) => {
              setLimit(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="mx-2 w-16 h-8 bg-white">
              <SelectValue placeholder="20" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          Results
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-gray-400 bg-white"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              className={`h-8 w-8 ${
                page === pageNum
                  ? "bg-purple-50 text-purple-600 border-purple-200"
                  : "bg-white border-transparent text-gray-600 hover:bg-gray-100"
              }`}
            >
              {pageNum}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-gray-400 bg-white"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AddProductDialog
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
      />
    </div>
  );
}
