import { useState, useEffect } from "react";
import { ArrowLeft, Minus, Plus, Search, Check, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import SuccessDialog from "@/components/success-dialog";
import AddBasicCustomerDialog from "@/components/customers/add-basic-customer-dialog";
import { cn } from "@/lib/utils";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


import { useCustomersQuery, useSalesEmployeesQuery } from "@/modules/customers/customers.hooks";
import { useCreateLeadMutation } from "@/modules/leads/leads.hooks";

export default function AddNewLead() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [customerSearch, setCustomerSearch] = useState("");
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState("");
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newlyAddedCustomer, setNewlyAddedCustomer] = useState<any>(null);

  const [salesSearch, setSalesSearch] = useState("");
  const [debouncedSalesSearch, setDebouncedSalesSearch] = useState("");
  const [salesPopoverOpen, setSalesPopoverOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCustomerSearch(customerSearch), 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSalesSearch(salesSearch), 300);
    return () => clearTimeout(timer);
  }, [salesSearch]);

  const { data: customersData, isLoading: isLoadingCustomers } = useCustomersQuery(1, 100, { search: debouncedCustomerSearch });
  const { data: salesData, isLoading: isLoadingSales } = useSalesEmployeesQuery({ search: debouncedSalesSearch });
  const createLead = useCreateLeadMutation();

  // Form state
  const [formData, setFormData] = useState({
    customerId: "",
    projectName: "",
    buildingType: "",
    location: "",
    source: "manual",
    quoteValue: 0,
    roofStyle: "",
    width: 0,
    length: 0,
    height: 0,
    doors: 0,
    windows: 0,
    insulation: 0,
    assignedSales: "",
  });

  const filteredCustomers = customersData?.data?.customers || [];
  const filteredSales = salesData?.data?.employees || [];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (value) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (value) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleNumberChange = (field: string, delta: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(
        0,
        (prev[field as keyof typeof prev] as number) + delta
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, boolean> = {};
    if (!formData.customerId) newErrors.customerId = true;
    if (!formData.projectName) newErrors.projectName = true;
    if (!formData.assignedSales) newErrors.assignedSales = true;
    if (!formData.buildingType) newErrors.buildingType = true;
    if (!formData.roofStyle) newErrors.roofStyle = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields");
      return;
    }

    setErrors({});
    
    createLead.mutate(formData, {
      onSuccess: () => {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/leads");
        }, 1500);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to create lead");
      }
    });
  };

  const handleCancel = () => {
    navigate("/leads");
  };

  return (
    <div className="p-6 w-full min-h-0">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Add New Lead</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new lead record and assign it to your pipeline
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6 p-5 rounded-lg shadow bg-white"
      >
        {/* Customer & Project Details */}
        <div className="">
          <h2 className="text-lg font-semibold mb-4">Customer & Project Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">
                Select Customer <span className="text-red-500">*</span>
              </Label>
              <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerPopoverOpen}
                    className={cn("w-full justify-between font-normal", errors.customerId ? "border-red-500 ring-1 ring-red-500" : "")}
                  >
                    {formData.customerId
                      ? (() => {
                          if (newlyAddedCustomer && newlyAddedCustomer.id === formData.customerId) {
                            return `${newlyAddedCustomer.customerName} (${newlyAddedCustomer.email || 'No email'})`;
                          }
                          const c = customersData?.data?.customers?.find((x: any) => x._id === formData.customerId);
                          return c ? `${c.customerName} (${c.email})` : "Select customer";
                        })()
                      : isLoadingCustomers
                      ? "Loading customers..."
                      : "Select a customer"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Search customer..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                  </div>
                  <div className="p-1 border-b border-gray-100">
                    <Button 
                      type="button" 
                      variant="ghost"
                      className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium h-9 px-2"
                      onClick={() => {
                        setCustomerPopoverOpen(false);
                        setIsAddCustomerOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add New Customer
                    </Button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-1">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">No customer found.</div>
                    ) : (
                      filteredCustomers.map((c) => (
                        <div
                          key={c._id}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 hover:text-slate-900",
                            formData.customerId === c._id ? "bg-slate-100" : ""
                          )}
                          onClick={() => {
                            handleSelectChange("customerId", c._id);
                            setCustomerPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.customerId === c._id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {c.customerName} <span className="ml-1 text-muted-foreground">({c.email})</span>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignedSales">
                Assigned Sales <span className="text-red-500">*</span>
              </Label>
              <Popover open={salesPopoverOpen} onOpenChange={setSalesPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={salesPopoverOpen}
                    className={cn("w-full justify-between font-normal", errors.assignedSales ? "border-red-500 ring-1 ring-red-500" : "")}
                  >
                    {formData.assignedSales
                      ? (() => {
                          const s = salesData?.data?.employees?.find((x) => x._id === formData.assignedSales);
                          return s ? s.name : "Assign to sales";
                        })()
                      : isLoadingSales
                      ? "Loading sales..."
                      : "Assign to sales"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Search sales..."
                      value={salesSearch}
                      onChange={(e) => setSalesSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-1">
                    {filteredSales.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">No sales found.</div>
                    ) : (
                      filteredSales.map((s) => (
                        <div
                          key={s._id}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 hover:text-slate-900",
                            formData.assignedSales === s._id ? "bg-slate-100" : ""
                          )}
                          onClick={() => {
                            handleSelectChange("assignedSales", s._id);
                            setSalesPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.assignedSales === s._id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {s.name}
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="projectName"
                name="projectName"
                placeholder="Enter Project Name"
                value={formData.projectName}
                onChange={handleInputChange}
                className={errors.projectName ? "border-red-500 ring-1 ring-red-500" : ""}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Enter Location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Lead Details */}
        <div className="">
          <h2 className="text-lg font-semibold mb-4">Lead Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">
                Lead Source
              </Label>
              <Select
                value={formData.source}
                onValueChange={(value) => handleSelectChange("source", value)}
              >
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select lead source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="import">Import</SelectItem>
                  <SelectItem value="customer_portal">Customer Portal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quoteValue">Quote Value</Label>
              <Input
                id="quoteValue"
                name="quoteValue"
                type="number"
                placeholder="Enter Quote Value"
                value={formData.quoteValue || ""}
                onChange={(e) => setFormData(p => ({ ...p, quoteValue: Number(e.target.value) }))}
              />
            </div>

          </div>
        </div>

        {/* Project Specification */}
        <div className="">
          <h2 className="text-lg font-semibold mb-4">Project Specification</h2>
          <div className="space-y-4">
            {/* Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (ft/m)</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberChange("width", -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="width"
                    name="width"
                    type="number"
                    value={formData.width}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        width: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberChange("width", 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="length">Length (ft/m)</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberChange("length", -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="length"
                    name="length"
                    type="number"
                    value={formData.length}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        length: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberChange("length", 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (ft/m)</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberChange("height", -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        height: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberChange("height", 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Roof Style and Building Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roofStyle">
                  Roof Style <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.roofStyle}
                  onValueChange={(value) =>
                    handleSelectChange("roofStyle", value)
                  }
                >
                  <SelectTrigger id="roofStyle" className={errors.roofStyle ? "border-red-500 ring-1 ring-red-500" : ""}>
                    <SelectValue placeholder="Select Roof Style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gable">Gable</SelectItem>
                    <SelectItem value="hip">Hip</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="mansard">Mansard</SelectItem>
                    <SelectItem value="gambrel">Gambrel</SelectItem>
                    <SelectItem value="shed">Shed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="buildingType">
                  Building Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.buildingType}
                  onValueChange={(value) =>
                    handleSelectChange("buildingType", value)
                  }
                >
                  <SelectTrigger id="buildingType" className={errors.buildingType ? "border-red-500 ring-1 ring-red-500" : ""}>
                    <SelectValue placeholder="Select Building Type" />
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
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Specs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doors">Doors</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberChange("doors", -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="doors"
                    name="doors"
                    type="number"
                    value={formData.doors}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        doors: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberChange("doors", 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="windows">Windows</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberChange("windows", -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="windows"
                    name="windows"
                    type="number"
                    value={formData.windows}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        windows: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberChange("windows", 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="insulation">Insulation</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberChange("insulation", -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="insulation"
                    name="insulation"
                    type="number"
                    value={formData.insulation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        insulation: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberChange("insulation", 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Save Lead
          </Button>
        </div>
      </form>
      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Lead Added Successfully!"
      />
      <AddBasicCustomerDialog 
        open={isAddCustomerOpen}
        onOpenChange={setIsAddCustomerOpen}
        onAdd={(newCustomer) => {
          setNewlyAddedCustomer(newCustomer);
          handleSelectChange("customerId", newCustomer.id);
          setIsAddCustomerOpen(false);
        }}
      />
    </div>
  );
}
