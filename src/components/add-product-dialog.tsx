import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateProductMutation,
  useProductCategoriesQuery,
} from "@/modules/products/products.hooks";
import type { CreateProductPayload } from "@/modules/products/products.types";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pricingTypeOptions = [
  { label: "Per lb", value: "per_lb" },
  { label: "Per sq ft", value: "per_sq_ft" },
  { label: "Per linear ft", value: "per_linear_ft" },
  { label: "Per qty", value: "per_qty" },
];

const unitOptions = ["lb", "sq_ft", "linear_ft", "ea", "pc"];

const usageMappingOptions = [
  { label: "Quotation", value: "quotation" },
  { label: "BOM/Takeoff", value: "bom_takeoff" },
  { label: "Shipper", value: "shipper" },
  { label: "Freight", value: "freight" },
  { label: "Other", value: "other" },
];

const initialFormState = {
  name: "",
  description: "",
  category: "",
  subcategory: "",
  skuPartCode: "",
  vendorShipper: "",
  pricingType: "per_lb",
  unit: "lb",
  baseCost: "",
  defaultMargin: "",
  sellingPrice: "",
  minMargin: "",
  maxMargin: "",
  taxable: true,
  usageMapping: ["quotation", "bom_takeoff"] as string[],
  smdtLinkedCode: "",
  status: "active",
  priceLock: false,
};

export function AddProductDialog({
  open,
  onOpenChange,
}: AddProductDialogProps) {
  const [formData, setFormData] = useState(initialFormState);
  const { data: categoriesData } = useProductCategoriesQuery();
  const createProductMutation = useCreateProductMutation();

  const categoryOptions = categoriesData?.data?.categories || [];
  const subcategoryOptions = categoriesData?.data?.subcategories || [];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUsageMappingToggle = (value: string) => {
    setFormData((prev) => {
      const exists = prev.usageMapping.includes(value);
      const updated = exists
        ? prev.usageMapping.filter((item) => item !== value)
        : [...prev.usageMapping, value];
      return { ...prev, usageMapping: updated };
    });
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const handleSubmit = async (submitStatus: "active" | "draft") => {
    if (!formData.name.trim()) {
      toast.error("Product Name is required.");
      return;
    }

    const payload: CreateProductPayload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category || undefined,
      subcategory: formData.subcategory || undefined,
      skuPartCode: formData.skuPartCode.trim() || undefined,
      vendorShipper: formData.vendorShipper.trim() || undefined,
      pricingType: formData.pricingType || undefined,
      unit: formData.unit || undefined,
      baseCost: formData.baseCost !== "" ? Number(formData.baseCost) : undefined,
      defaultMargin: formData.defaultMargin !== "" ? Number(formData.defaultMargin) : undefined,
      sellingPrice: formData.sellingPrice !== "" ? Number(formData.sellingPrice) : undefined,
      minMargin: formData.minMargin !== "" ? Number(formData.minMargin) : undefined,
      maxMargin: formData.maxMargin !== "" ? Number(formData.maxMargin) : undefined,
      taxable: formData.taxable,
      usageMapping: formData.usageMapping,
      smdtLinkedCode: formData.smdtLinkedCode.trim() || undefined,
      status: submitStatus,
      priceLock: formData.priceLock,
    };

    try {
      await createProductMutation.mutateAsync(payload);
      toast.success(
        submitStatus === "draft"
          ? "Product saved as draft successfully!"
          : "Product added successfully!"
      );
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save product."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Add New Product
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8 bg-white">
          {/* BASIC INFORMATION */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              BASIC INFORMATION
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  placeholder="Main Frame (steel)"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Primary structural steel frame"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => handleInputChange("category", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sub Category</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(val) => handleInputChange("subcategory", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategoryOptions.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>SKU/Part Code</Label>
                <Input
                  placeholder="ST-MF-001"
                  value={formData.skuPartCode}
                  onChange={(e) => handleInputChange("skuPartCode", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Vendor/ Shipper</Label>
                <Input
                  placeholder="Vendor A"
                  value={formData.vendorShipper}
                  onChange={(e) => handleInputChange("vendorShipper", e.target.value)}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Product image</Label>
                <div className="border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
                  <Upload className="w-6 h-6 mb-2 text-blue-600" />
                  <span className="text-sm">
                    Click to upload or drag and drop
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PRICING INFORMATION */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              PRICING INFORMATION
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Pricing Type</Label>
                <Select
                  value={formData.pricingType}
                  onValueChange={(val) => handleInputChange("pricingType", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Pricing Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricingTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(val) => handleInputChange("unit", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Base Cost</Label>
                <Input
                  type="number"
                  placeholder="2.40"
                  value={formData.baseCost}
                  onChange={(e) => handleInputChange("baseCost", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Default Margin (%)</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={formData.defaultMargin}
                  onChange={(e) => handleInputChange("defaultMargin", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Selling Price</Label>
                <Input
                  type="number"
                  placeholder="3.12"
                  value={formData.sellingPrice}
                  onChange={(e) => handleInputChange("sellingPrice", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum Margin Allowed</Label>
                <Input
                  type="number"
                  placeholder="20"
                  value={formData.minMargin}
                  onChange={(e) => handleInputChange("minMargin", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Maximum Margin Allowed</Label>
                <Input
                  type="number"
                  placeholder="40"
                  value={formData.maxMargin}
                  onChange={(e) => handleInputChange("maxMargin", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* PRICING INFORMATION 2 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider flex items-center justify-between">
              PRICING INFORMATION
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Input Type Required</Label>
                <Input placeholder="" disabled />
              </div>
              <div className="space-y-2">
                <Label>Default Quantity</Label>
                <Input placeholder="1" disabled />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Allow Quantity Override in rates
                </span>
                <Switch disabled defaultChecked />
              </div>
            </div>
          </div>

          {/* PROCUREMENT INVENTORY */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              PROCUREMENT INVENTORY
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Lead Time</Label>
                <Input placeholder="" disabled />
              </div>
              <div className="space-y-2">
                <Label>Min Order Quantity</Label>
                <Input placeholder="" disabled />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Stock Tracking</span>
                <Switch disabled defaultChecked />
              </div>
            </div>
          </div>

          {/* COST STRUCTURE */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              COST STRUCTURE
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Material Cost (USD)</Label>
                <Input placeholder="" disabled />
              </div>
              <div className="space-y-2">
                <Label>Labor Cost (USD)</Label>
                <Input placeholder="" disabled />
              </div>

              <div className="space-y-2">
                <Label>Overhead Cost (USD)</Label>
                <Input placeholder="" disabled />
              </div>
              <div className="space-y-2">
                <Label>Total Cost (USD)</Label>
                <Input placeholder="" disabled />
              </div>
            </div>
          </div>

          {/* TAX & ACCOUNTING */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              TAX & ACCOUNTING
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Tax Category</Label>
                <Input placeholder="" disabled />
              </div>
              <div className="space-y-2">
                <Label>Account Code</Label>
                <Input placeholder="" disabled />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxable</span>
                <Switch
                  checked={formData.taxable}
                  onCheckedChange={(checked) => handleInputChange("taxable", checked)}
                />
              </div>
            </div>
          </div>

          {/* USAGE MAPPING */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              USAGE MAPPING
            </h3>
            <div className="flex flex-wrap gap-8 items-center pt-2">
              {usageMappingOptions.map((item) => (
                <div key={item.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`usage-${item.value}`}
                    checked={formData.usageMapping.includes(item.value)}
                    onCheckedChange={() => handleUsageMappingToggle(item.value)}
                  />
                  <Label
                    htmlFor={`usage-${item.value}`}
                    className="font-normal cursor-pointer text-sm"
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* SMDT INTERGRATION */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              SMDT INTERGRATION
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Linked SMDT Item/Code</Label>
                <Input
                  placeholder="MF-001"
                  value={formData.smdtLinkedCode}
                  onChange={(e) => handleInputChange("smdtLinkedCode", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Synced</Label>
                <Input placeholder="" disabled />
              </div>
              <div className="space-y-2">
                <Label>Sync Source</Label>
                <Input placeholder="" disabled />
              </div>
            </div>
          </div>

          {/* CONTROL & STATUS */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              CONTROL & STATUS
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => handleInputChange("status", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Effective from</Label>
                <Input placeholder="" disabled />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Price Lock</span>
                <Switch
                  checked={formData.priceLock}
                  onCheckedChange={(checked) => handleInputChange("priceLock", checked)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white sticky bottom-0 z-10">
          <Button
            variant="outline"
            className="border-gray-200"
            onClick={() => onOpenChange(false)}
            disabled={createProductMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => handleSubmit("draft")}
            disabled={createProductMutation.isPending}
          >
            {createProductMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Save as Draft
          </Button>
          <Button
            className="bg-[#2563EB] hover:bg-blue-700 text-white"
            onClick={() => handleSubmit("active")}
            disabled={createProductMutation.isPending}
          >
            {createProductMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
            )}
            Save Product
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

