import { useState, useEffect } from "react";
import { X, Plus, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";

import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import { useCreateQuotationMutation } from "@/modules/quotations/quotations.hooks";
import { useSalesEmployeesQuery } from "@/modules/customers/customers.hooks";
import type { CreateQuotationPayload } from "@/modules/quotations/quotations.api";

interface CreateQuotationDialogProps {
  trigger: React.ReactNode;
  leadData?: {
    name: string;
    id: string;
  };
}

export default function CreateQuotationDialog({
  trigger,
  leadData,
}: CreateQuotationDialogProps) {
  const [open, setOpen] = useState(false);
  const [sendMethod, setSendMethod] = useState<
    "email" | "whatsapp" | "website"
  >("email");

  const leadId = leadData?.id;
  const { data: leadQueryData, refetch } = useLeadDetailQuery(leadId || "");
  const createMutation = useCreateQuotationMutation();
  const { data: salesEmployeesData } = useSalesEmployeesQuery({ isActive: true });

  const [formData, setFormData] = useState<Partial<CreateQuotationPayload>>({
    buildingType: "",
    basePrice: 0,
    maxPrice: 0,
    sqft: "",
    width: undefined,
    length: undefined,
    height: undefined,
    currency: "usd",
    roofStyle: "",
    location: "",
    windLoad: "",
    snowLoad: "",
    estimatedDelivery: "",
    paymentTerms: "",
    companyName: "",
    specialNote: "",
    internalNotes: "",
    clientNotes: "",
    priorityLevel: "medium",
    proposalDate: new Date().toISOString(),
    validity: "",
    preparedBy: "",
    margin: 0,
    leftEaveHeight: undefined,
    rightEaveHeight: undefined,
    roofSlope: "",
    frameType: "",
    endwallType: "",
    girtType: "",
    purlinType: "",
    bracingType: "",
    roofPanel: "",
    wallPanelType: "",
    roofColor: "",
    wallColor: "",
    trimColor: "",
    baseAngle: "",
    materialCost: 0,
    freightCost: 0,
    markupPercent: 0,
    shippingCost: 0,
    deliveryType: "",
    shippingIncluded: false,
    changeNote: "",
    includedComponents: [],
    exclusions: [],
    optionalAddOns: [],
  });

  useEffect(() => {
    if (open && leadId) {
      refetch();
    }
  }, [open, leadId, refetch]);

  useEffect(() => {
    if (leadQueryData?.data?.lead && open) {
      const lead = leadQueryData.data.lead;
      const aiData = lead.aiQuoteData || {};
      
      setFormData(prev => ({
        ...prev,
        buildingType: lead.buildingType || "",
        basePrice: aiData.priceMin || lead.quoteValue || 0,
        maxPrice: aiData.priceMax || lead.quoteValue || 0,
        sqft: aiData.details?.sqft || "",
        width: lead.width ? Number(lead.width) : undefined,
        length: lead.length ? Number(lead.length) : undefined,
        height: lead.height ? Number(lead.height) : undefined,
        roofStyle: lead.roofStyle || aiData.details?.roofType || "",
        location: lead.location || aiData.details?.region || "",
        currency: "usd",
        priorityLevel: "medium",
        proposalDate: new Date().toISOString(),
      }));
    }
  }, [leadQueryData, open]);

  const handleSaveDraft = async () => {
    if (!leadId) return;
    try {
      await createMutation.mutateAsync({
        leadId,
        ...formData,
      });
      setOpen(false);
    } catch (err) {
      console.error("Failed to create quotation", err);
    }
  };

  const includedMaterials = [
    "Primary Frame Structure",
    "Secondary Framing",
    "Roof Panels",
    "Wall Panels",
    "Trim & Flashing",
    "Fasteners & Hardware",
    "Engineering Drawings",
    "Structural Calculations",
    "Foundation Anchor Bolts",
    "Gutter System",
    "Ridge Ventilation",
    "Insulation (if selected)",
  ];

  const optionalAddons = [
    { name: "Walk-in Doors", price: "+$450 each" },
    { name: "Overhead Doors", price: "+$1,200 each" },
    { name: "Windows", price: "+$180 each" },
    { name: "Skylights", price: "+$320 each" },
    { name: "Insulation Package", price: "+$450" },
    { name: "Color Upgrade", price: "+$450" },
    { name: "Concrete Foundation", price: "+$4500" },
    { name: "Electrical Package", price: "+$450" },
    { name: "HVAC Preparation", price: "+$450" },
    { name: "Loading Dock", price: "+$450" },
    { name: "Office Space", price: "+$450" },
    { name: "Mezzanine Level", price: "+$8,900" },
  ];

  const [customMaterials, setCustomMaterials] = useState<string[]>([]);
  const [newMaterial, setNewMaterial] = useState("");
  const [showMaterialInput, setShowMaterialInput] = useState(false);

  const [customAddons, setCustomAddons] = useState<{name: string, price: string}[]>([]);
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState("");
  const [showAddonInput, setShowAddonInput] = useState(false);

  const handleAddMaterial = () => {
    if (newMaterial.trim()) {
      setCustomMaterials([...customMaterials, newMaterial.trim()]);
      setNewMaterial("");
      setShowMaterialInput(false);
    }
  };

  const handleAddAddon = () => {
    if (newAddonName.trim()) {
      setCustomAddons([...customAddons, { name: newAddonName.trim(), price: newAddonPrice.trim() || "+$0" }]);
      setNewAddonName("");
      setNewAddonPrice("");
      setShowAddonInput(false);
    }
  };

  const allMaterials = [...includedMaterials, ...customMaterials];
  const allAddons = [...optionalAddons, ...customAddons];

  const handleMaterialToggle = (material: string, checked: boolean) => {
    setFormData(p => {
      const current = (p.includedComponents || []) as string[];
      if (checked) return { ...p, includedComponents: [...current, material] };
      return { ...p, includedComponents: current.filter(m => m !== material) };
    });
  };

  const handleAddonToggle = (addon: {name: string, price: string}, checked: boolean) => {
    setFormData(p => {
      const current = p.optionalAddOns || [];
      if (checked) return { ...p, optionalAddOns: [...current, { name: addon.name, price: Number(addon.price.replace(/[^0-9.]/g, '')) || 0 }] };
      return { ...p, optionalAddOns: current.filter(a => a.name !== addon.name) };
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Create Manual Quotation-{leadData?.name || "John Doe"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6">
          {/* Customer Information, Building Requirements, and Pricing in 3 columns */}
          <div className="grid grid-cols-3 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Customer Information</h3>

              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-xs">
                  Customer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={`${leadQueryData?.data?.customer?.firstName || ""} ${leadQueryData?.data?.customer?.lastName || ""}`.trim()}
                  readOnly
                  className="h-9 text-sm bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={leadQueryData?.data?.customer?.email || ""}
                  readOnly
                  className="h-9 text-sm bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={leadQueryData?.data?.customer?.phone ? `${leadQueryData.data.customer.phone.countryCode || ""} ${leadQueryData.data.customer.phone.number || ""}`.trim() : ""}
                  readOnly
                  className="h-9 text-sm bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-xs">
                  Company
                </Label>
                <Input
                  id="company"
                  placeholder="Company name (optional)"
                  value={formData.companyName || ""}
                  onChange={(e) => setFormData(p => ({ ...p, companyName: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Building Requirements */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Building Requirements</h3>

              <div className="space-y-2">
                <Label htmlFor="buildingType" className="text-xs">
                  Building Type <span className="text-red-500">*</span>
                </Label>
                <Select key={formData.buildingType || "btype"} value={formData.buildingType || undefined} onValueChange={(v) => setFormData(p => ({ ...p, buildingType: v }))}>
                  <SelectTrigger id="buildingType" className="h-9 text-sm">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arch-buildings">Arch Buildings</SelectItem>
                    <SelectItem value="aviation">Aviation</SelectItem>
                    <SelectItem value="carports">Carports</SelectItem>
                    <SelectItem value="workshops">Workshops</SelectItem>
                    <SelectItem value="agricultural">Agricultural</SelectItem>
                    <SelectItem value="warehouses">Warehouses</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="sales-storage">Sales Storage</SelectItem>
                    <SelectItem value="barndominiums">Barndominiums</SelectItem>
                    <SelectItem value="garages">Garages</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="width" className="text-xs">
                    Width (ft) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="width"
                    type="number"
                    value={formData.width || ""}
                    onChange={(e) => setFormData(p => ({ ...p, width: Number(e.target.value) }))}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="length" className="text-xs">
                    Length (ft) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="length"
                    type="number"
                    value={formData.length || ""}
                    onChange={(e) => setFormData(p => ({ ...p, length: Number(e.target.value) }))}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-xs">
                    Height (ft) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height || ""}
                    onChange={(e) => setFormData(p => ({ ...p, height: Number(e.target.value) }))}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roofStyle" className="text-xs">
                  Roof Style <span className="text-red-500">*</span>
                </Label>
                <Select key={formData.roofStyle || "rstyle"} value={formData.roofStyle || undefined} onValueChange={(v) => setFormData(p => ({ ...p, roofStyle: v }))}>
                  <SelectTrigger id="roofStyle" className="h-9 text-sm">
                    <SelectValue placeholder="Select Roof Style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gable">Gable Roof</SelectItem>
                    <SelectItem value="gambrel">Gambrel Roof</SelectItem>
                    <SelectItem value="hip">Hip Roof</SelectItem>
                    <SelectItem value="flat">Flat Roof</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="windLoad" className="text-xs">
                    Wind Load (mph)
                  </Label>
                  <Input
                    id="windLoad"
                    type="text"
                    value={formData.windLoad || ""}
                    onChange={(e) => setFormData(p => ({ ...p, windLoad: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="snowLoad" className="text-xs">
                    Snow Load (psf)
                  </Label>
                  <Input
                    id="snowLoad"
                    type="text"
                    value={formData.snowLoad || ""}
                    onChange={(e) => setFormData(p => ({ ...p, snowLoad: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDelivery" className="text-xs">
                  Estimated Delivery
                </Label>
                <Input
                  id="estimatedDelivery"
                  value={formData.estimatedDelivery || ""}
                  onChange={(e) => setFormData(p => ({ ...p, estimatedDelivery: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Pricing & Materials */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Pricing & Materials</h3>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="basePrice" className="text-xs">
                    Base Price ($) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={formData.basePrice || ""}
                    onChange={(e) => setFormData(p => ({ ...p, basePrice: Number(e.target.value) }))}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxPrice" className="text-xs">
                    Max Price ($) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    value={formData.maxPrice || ""}
                    onChange={(e) => setFormData(p => ({ ...p, maxPrice: Number(e.target.value) }))}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-xs">
                  Currency
                </Label>
                <Select value={formData.currency || "usd"} onValueChange={(v) => setFormData(p => ({ ...p, currency: v }))}>
                  <SelectTrigger id="currency" className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil" className="text-xs">
                  Quotation Valid Until
                </Label>
                <Input
                  id="validUntil"
                  type="date"
                  placeholder="dd-mm-yyyy"
                  value={formData.validTill ? new Date(formData.validTill).toISOString().split('T')[0] : ""}
                  onChange={(e) => setFormData(p => ({ ...p, validTill: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms" className="text-xs">
                  Payment Terms
                </Label>
                <Select value={formData.paymentTerms || undefined} onValueChange={(v) => setFormData(p => ({ ...p, paymentTerms: v }))}>
                  <SelectTrigger id="paymentTerms" className="h-9 text-sm">
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50-50">
                      50% Down, 50% on Delivery
                    </SelectItem>
                    <SelectItem value="30-70">
                      30% Down, 70% on Delivery
                    </SelectItem>
                    <SelectItem value="full">Full Payment Upfront</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedSalesperson" className="text-xs">
                  Assigned Salesperson
                </Label>
                <Select
                  value={formData.assignedSalesperson || undefined}
                  onValueChange={(v) => setFormData(p => ({ ...p, assignedSalesperson: v }))}
                >
                  <SelectTrigger id="assignedSalesperson" className="h-9 text-sm">
                    <SelectValue placeholder="Select salesperson" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesEmployeesData?.data?.employees?.map((emp) => (
                      <SelectItem key={emp._id} value={emp._id}>
                        {emp.name} <span className="text-gray-400 text-xs">({emp.email})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="margin" className="text-xs">Margin (%)</Label>
                <Input
                  id="margin"
                  type="number"
                  value={formData.margin || ""}
                  onChange={(e) => setFormData(p => ({ ...p, margin: Number(e.target.value) }))}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="changeNote" className="text-xs">Change Note</Label>
                <Input
                  id="changeNote"
                  placeholder="e.g. Initial draft"
                  value={formData.changeNote || ""}
                  onChange={(e) => setFormData(p => ({ ...p, changeNote: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* COGS & Final Pricing Inputs */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">COGS & Pricing Inputs <span className="text-xs font-normal text-gray-400">(Server auto-calculates finalPrice)</span></h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="materialCost" className="text-xs">Material Cost ($)</Label>
                <Input id="materialCost" type="number" value={formData.materialCost || ""} onChange={(e) => setFormData(p => ({ ...p, materialCost: Number(e.target.value) }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freightCost" className="text-xs">Freight Cost ($)</Label>
                <Input id="freightCost" type="number" value={formData.freightCost || ""} onChange={(e) => setFormData(p => ({ ...p, freightCost: Number(e.target.value) }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="markupPercent" className="text-xs">Markup (%)</Label>
                <Input id="markupPercent" type="number" value={formData.markupPercent || ""} onChange={(e) => setFormData(p => ({ ...p, markupPercent: Number(e.target.value) }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingCost" className="text-xs">Shipping Cost ($)</Label>
                <Input id="shippingCost" type="number" value={formData.shippingCost || ""} onChange={(e) => setFormData(p => ({ ...p, shippingCost: Number(e.target.value) }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryType" className="text-xs">Delivery Type</Label>
                <Input id="deliveryType" placeholder="e.g. Flatbed" value={formData.deliveryType || ""} onChange={(e) => setFormData(p => ({ ...p, deliveryType: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2 flex items-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.shippingIncluded || false}
                    onChange={(e) => setFormData(p => ({ ...p, shippingIncluded: e.target.checked }))}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Shipping Included</span>
                </label>
              </div>
            </div>
          </div>

          {/* Structure & Engineering */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Structure & Engineering</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leftEaveHeight" className="text-xs">Left Eave Height (ft)</Label>
                <Input id="leftEaveHeight" type="number" value={formData.leftEaveHeight || ""} onChange={(e) => setFormData(p => ({ ...p, leftEaveHeight: Number(e.target.value) }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rightEaveHeight" className="text-xs">Right Eave Height (ft)</Label>
                <Input id="rightEaveHeight" type="number" value={formData.rightEaveHeight || ""} onChange={(e) => setFormData(p => ({ ...p, rightEaveHeight: Number(e.target.value) }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roofSlope" className="text-xs">Roof Slope</Label>
                <Input id="roofSlope" placeholder="e.g. 1:12" value={formData.roofSlope || ""} onChange={(e) => setFormData(p => ({ ...p, roofSlope: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frameType" className="text-xs">Frame Type</Label>
                <Input id="frameType" placeholder="e.g. Rigid Frame" value={formData.frameType || ""} onChange={(e) => setFormData(p => ({ ...p, frameType: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endwallType" className="text-xs">Endwall Type</Label>
                <Input id="endwallType" placeholder="e.g. Standard" value={formData.endwallType || ""} onChange={(e) => setFormData(p => ({ ...p, endwallType: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="girtType" className="text-xs">Girt Type</Label>
                <Input id="girtType" placeholder="e.g. Bypass" value={formData.girtType || ""} onChange={(e) => setFormData(p => ({ ...p, girtType: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purlinType" className="text-xs">Purlin Type</Label>
                <Input id="purlinType" placeholder="e.g. Z-Purlin" value={formData.purlinType || ""} onChange={(e) => setFormData(p => ({ ...p, purlinType: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bracingType" className="text-xs">Bracing Type</Label>
                <Input id="bracingType" placeholder="e.g. Rod Bracing" value={formData.bracingType || ""} onChange={(e) => setFormData(p => ({ ...p, bracingType: e.target.value }))} className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* Material Specifications */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Material Specifications</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roofPanel" className="text-xs">Roof Panel</Label>
                <Input id="roofPanel" placeholder="e.g. 26GA PBR" value={formData.roofPanel || ""} onChange={(e) => setFormData(p => ({ ...p, roofPanel: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallPanelType" className="text-xs">Wall Panel Type</Label>
                <Input id="wallPanelType" placeholder="e.g. 26GA PBR" value={formData.wallPanelType || ""} onChange={(e) => setFormData(p => ({ ...p, wallPanelType: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roofColor" className="text-xs">Roof Color</Label>
                <Input id="roofColor" placeholder="e.g. Galvalume" value={formData.roofColor || ""} onChange={(e) => setFormData(p => ({ ...p, roofColor: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallColor" className="text-xs">Wall Color</Label>
                <Input id="wallColor" placeholder="e.g. White" value={formData.wallColor || ""} onChange={(e) => setFormData(p => ({ ...p, wallColor: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trimColor" className="text-xs">Trim Color</Label>
                <Input id="trimColor" placeholder="e.g. Charcoal" value={formData.trimColor || ""} onChange={(e) => setFormData(p => ({ ...p, trimColor: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseAngle" className="text-xs">Base Angle</Label>
                <Input id="baseAngle" placeholder="e.g. Standard" value={formData.baseAngle || ""} onChange={(e) => setFormData(p => ({ ...p, baseAngle: e.target.value }))} className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* Included Materials & Components */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">
              Included Materials & Components
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {allMaterials.map((material, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 border p-2 rounded-md"
                >
                  <input
                    type="checkbox"
                    id={`material-${index}`}
                    checked={(formData.includedComponents || []).includes(material)}
                    onChange={(e) => handleMaterialToggle(material, e.target.checked)}
                    className="rounded border-gray-300 h-4 w-4"
                  />
                  <label
                    htmlFor={`material-${index}`}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {material}
                  </label>
                </div>
              ))}
            </div>
            {showMaterialInput ? (
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  placeholder="Material name"
                  className="h-8 text-sm max-w-[200px]"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMaterial()}
                />
                <Button size="sm" onClick={handleAddMaterial} className="h-8">Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowMaterialInput(false)} className="h-8">Cancel</Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMaterialInput(true)}
                className="text-blue-600 h-8 px-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>

          {/* Optional Add-ons & Upgrades */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">
              Optional Add-ons & Upgrades
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {allAddons.map((addon, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between space-x-2 pr-2 border p-2 rounded-md"
                >
                  <div className="flex items-center space-x-2 ">
                    <input
                      type="checkbox"
                      id={`addon-${index}`}
                      checked={(formData.optionalAddOns || []).some(a => a.name === addon.name)}
                      onChange={(e) => handleAddonToggle(addon, e.target.checked)}
                      className="rounded border-gray-300 h-4 w-4"
                    />
                    <label
                      htmlFor={`addon-${index}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {addon.name}
                    </label>
                  </div>
                  <span className="text-xs text-blue-600 whitespace-nowrap">
                    {addon.price}
                  </span>
                </div>
              ))}
            </div>
            {showAddonInput ? (
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  value={newAddonName}
                  onChange={(e) => setNewAddonName(e.target.value)}
                  placeholder="Add-on name"
                  className="h-8 text-sm max-w-[200px]"
                />
                <Input
                  value={newAddonPrice}
                  onChange={(e) => setNewAddonPrice(e.target.value)}
                  placeholder="Price (e.g. +$500)"
                  className="h-8 text-sm max-w-[120px]"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAddon()}
                />
                <Button size="sm" onClick={handleAddAddon} className="h-8">Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddonInput(false)} className="h-8">Cancel</Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddonInput(true)}
                className="text-blue-600 h-8 px-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>

          {/* Special Requirements & Notes */}
          <div className="space-y-2">
            <Label htmlFor="specialNotes" className="text-sm font-semibold">
              Special Note <span className="text-xs font-normal text-gray-400">(Shown to customer)</span>
            </Label>
            <Textarea
              id="specialNotes"
              value={formData.specialNote || ""}
              onChange={(e) => setFormData(p => ({ ...p, specialNote: e.target.value }))}
              placeholder="Any special building codes, site conditions, or custom requirements..."
              className="min-h-20 text-sm resize-none"
            />
          </div>

          {/* Client Notes */}
          <div className="space-y-2">
            <Label htmlFor="clientNotes" className="text-sm font-semibold">
              Client Notes <span className="text-xs font-normal text-gray-400">(Customer-facing)</span>
            </Label>
            <Textarea
              id="clientNotes"
              value={formData.clientNotes || ""}
              onChange={(e) => setFormData(p => ({ ...p, clientNotes: e.target.value }))}
              placeholder="Customer requested details..."
              className="min-h-20 text-sm resize-none"
            />
          </div>

          {/* Internal Notes */}
          <div className="space-y-2">
            <Label htmlFor="internalNotes" className="text-sm font-semibold">
              Internal Notes <span className="text-xs font-normal text-gray-400">(Not sent to customer)</span>
            </Label>
            <Textarea
              id="internalNotes"
              value={formData.internalNotes || ""}
              onChange={(e) => setFormData(p => ({ ...p, internalNotes: e.target.value }))}
              placeholder="Internal team notes..."
              className="min-h-20 text-sm resize-none"
            />
          </div>

          {/* Lead Source and Priority Level */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leadSource" className="text-xs">
                Lead source
              </Label>
              <Select defaultValue="high-value">
                <SelectTrigger id="leadSource" className="w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-value">
                    High- value prospect, interested in additional features
                  </SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priorityLevel" className="text-xs">
                Priority Level
              </Label>
              <Select value={formData.priorityLevel || "medium"} onValueChange={(v: "low"|"medium"|"high") => setFormData(p => ({ ...p, priorityLevel: v }))}>
                <SelectTrigger id="priorityLevel" className="w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t flex items-center justify-between  bg-white">
          <div className="flex gap-2">
            <Button
              size="lg"
              className="w-40 border-0 bg-gray-200"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button
              size="lg"
              className="bg-gray-700 hover:bg-gray-800 "
              onClick={handleSaveDraft}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Saving..." : "Save as Draft"}
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <Button size="lg">Preview Quotation</Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="lg"
                  className="bg-purple-500 flex items-center gap-2"
                >
                  {`Generate & Send via ${
                    sendMethod === "email"
                      ? "email"
                      : sendMethod === "whatsapp"
                      ? "WhatsApp"
                      : "Website"
                  }`}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuRadioGroup
                  value={sendMethod}
                  onValueChange={(v) =>
                    setSendMethod(v as "email" | "whatsapp" | "website")
                  }
                >
                  <DropdownMenuRadioItem value="email">
                    Email
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="whatsapp">
                    WhatsApp
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="website">
                    Website
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
