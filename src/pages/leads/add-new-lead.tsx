import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  Search,
  Check,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SuccessDialog from "@/components/success-dialog";
import AddBasicCustomerDialog, {
  type BasicCustomer,
} from "@/components/customers/add-basic-customer-dialog";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useCustomersQuery,
  useSalesEmployeesQuery,
} from "@/modules/customers/customers.hooks";
import { useCreateLeadMutation } from "@/modules/leads/leads.hooks";

const addLeadSchema = z.object({
  customerId: z.string().trim().min(1, "Customer is required"),
  assignedSales: z
    .string()
    .trim()
    .min(1, "Assigned sales representative is required"),
  projectName: z.string().trim().min(1, "Project name is required"),
  location: z.string().trim().min(1, "Location is required"),
  source: z.string().trim().min(1, "Lead source is required"),
  quoteValue: z
    .union([z.number(), z.string()])
    .refine(
      (val) =>
        val !== "" &&
        val !== undefined &&
        val !== null &&
        !isNaN(Number(val)) &&
        Number(val) > 0,
      {
        message: "Quote value is required and must be greater than 0",
      },
    ),
  width: z
    .union([z.number(), z.string()])
    .refine(
      (val) =>
        val !== "" &&
        val !== undefined &&
        val !== null &&
        !isNaN(Number(val)) &&
        Number(val) > 0,
      {
        message: "Width is required and must be greater than 0",
      },
    ),
  length: z
    .union([z.number(), z.string()])
    .refine(
      (val) =>
        val !== "" &&
        val !== undefined &&
        val !== null &&
        !isNaN(Number(val)) &&
        Number(val) > 0,
      {
        message: "Length is required and must be greater than 0",
      },
    ),
  height: z
    .union([z.number(), z.string()])
    .refine(
      (val) =>
        val !== "" &&
        val !== undefined &&
        val !== null &&
        !isNaN(Number(val)) &&
        Number(val) > 0,
      {
        message: "Height is required and must be greater than 0",
      },
    ),
  roofStyle: z.string().trim().min(1, "Roof style is required"),
  buildingType: z.string().trim().min(1, "Building type is required"),
  doors: z
    .union([z.number(), z.string()])
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        val === "" ||
        (!isNaN(Number(val)) && Number(val) >= 0),
      {
        message: "Doors must be 0 or greater",
      },
    ),
  windows: z
    .union([z.number(), z.string()])
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        val === "" ||
        (!isNaN(Number(val)) && Number(val) >= 0),
      {
        message: "Windows must be 0 or greater",
      },
    ),
  insulation: z
    .union([z.number(), z.string()])
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        val === "" ||
        (!isNaN(Number(val)) && Number(val) >= 0),
      {
        message: "Insulation must be 0 or greater",
      },
    ),
});

type AddLeadFormValues = z.infer<typeof addLeadSchema>;

export default function AddNewLead() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState("");
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newlyAddedCustomer, setNewlyAddedCustomer] =
    useState<BasicCustomer | null>(null);

  const [salesSearch, setSalesSearch] = useState("");
  const [debouncedSalesSearch, setDebouncedSalesSearch] = useState("");
  const [salesPopoverOpen, setSalesPopoverOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedCustomerSearch(customerSearch),
      300,
    );
    return () => clearTimeout(timer);
  }, [customerSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSalesSearch(salesSearch), 300);
    return () => clearTimeout(timer);
  }, [salesSearch]);

  const { data: customersData, isLoading: isLoadingCustomers } =
    useCustomersQuery(1, 100, { search: debouncedCustomerSearch });
  const { data: salesData, isLoading: isLoadingSales } = useSalesEmployeesQuery(
    { search: debouncedSalesSearch },
  );
  const createLead = useCreateLeadMutation();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AddLeadFormValues>({
    resolver: zodResolver(addLeadSchema),
    defaultValues: {
      customerId: "",
      assignedSales: "",
      projectName: "",
      location: "",
      source: "",
      quoteValue: "",
      width: "",
      length: "",
      height: "",
      roofStyle: "",
      buildingType: "",
      doors: 0,
      windows: 0,
      insulation: 0,
    },
  });

  const selectedCustomerId = watch("customerId");
  const selectedAssignedSales = watch("assignedSales");

  const filteredCustomers = (customersData?.data?.customers || []).filter(
    (c) => {
      if (!customerSearch.trim()) return true;
      const q = customerSearch.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.customerId.toLowerCase().includes(q)
      );
    },
  );
  const filteredSales = salesData?.data?.employees || [];

  const handleNumberStep = (
    field: "width" | "length" | "height" | "doors" | "windows" | "insulation",
    delta: number,
  ) => {
    const current = Number(getValues(field)) || 0;
    const nextVal = Math.max(0, current + delta);
    setValue(field, nextVal, { shouldValidate: true });
    clearErrors("root");
  };

  const onSubmit = async (data: AddLeadFormValues) => {
    clearErrors("root");
    try {
      await createLead.mutateAsync({
        customerId: data.customerId,
        projectName: data.projectName.trim(),
        buildingType: data.buildingType,
        location: data.location.trim(),
        source: data.source,
        quoteValue: Number(data.quoteValue),
        roofStyle: data.roofStyle,
        width: Number(data.width),
        length: Number(data.length),
        height: Number(data.height),
        doors: Number(data.doors) || 0,
        windows: Number(data.windows) || 0,
        insulation: Number(data.insulation) || 0,
        assignedSales: data.assignedSales,
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate("/leads");
      }, 1500);
    } catch (err: unknown) {
      const apiMessage = getApiErrorMessage(
        err,
        "Failed to create lead. Please check the form and try again.",
      );
      setError("root", { message: apiMessage });
    }
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
        <h1 className="text-2xl font-bold mt-2">Add New Lead</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new lead record and assign it to your pipeline
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-6 p-5 rounded-lg shadow bg-white"
      >
        {/* API / Root Error Banner */}
        {errors.root && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-md border border-red-200 bg-red-50 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errors.root.message}</div>
          </div>
        )}

        {/* Customer & Project Details */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Customer & Project Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Select Combobox */}
            <div className="space-y-2">
              <Label htmlFor="customerId">
                Select Customer <span className="text-red-500">*</span>
              </Label>
              <Popover
                open={customerPopoverOpen}
                onOpenChange={setCustomerPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerPopoverOpen}
                    className={cn(
                      "w-full justify-between font-normal",
                      errors.customerId
                        ? "border-red-500 ring-1 ring-red-500"
                        : "",
                    )}
                  >
                    {selectedCustomerId
                      ? (() => {
                          if (
                            newlyAddedCustomer &&
                            newlyAddedCustomer.id === selectedCustomerId
                          ) {
                            return `${newlyAddedCustomer.customerName} (${newlyAddedCustomer.email || "No email"})`;
                          }
                          const c = customersData?.data?.customers?.find(
                            (x) => x._id === selectedCustomerId,
                          );
                          if (!c) return "Select customer";
                          return `${c.customerName} (${c.email})`;
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
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No customer found.
                      </div>
                    ) : (
                      filteredCustomers.map((c) => (
                        <div
                          key={c._id}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 hover:text-slate-900",
                            selectedCustomerId === c._id ? "bg-slate-100" : "",
                          )}
                          onClick={() => {
                            setValue("customerId", c._id, {
                              shouldValidate: true,
                            });
                            clearErrors("root");
                            setCustomerPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCustomerId === c._id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span>{c.customerName}</span>
                          <span className="ml-1 text-muted-foreground">
                            ({c.email})
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              {errors.customerId && (
                <p className="text-xs text-red-500">
                  {errors.customerId.message}
                </p>
              )}
            </div>

            {/* Assigned Sales Combobox */}
            <div className="space-y-2">
              <Label htmlFor="assignedSales">
                Assigned Sales <span className="text-red-500">*</span>
              </Label>
              <Popover
                open={salesPopoverOpen}
                onOpenChange={setSalesPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={salesPopoverOpen}
                    className={cn(
                      "w-full justify-between font-normal",
                      errors.assignedSales
                        ? "border-red-500 ring-1 ring-red-500"
                        : "",
                    )}
                  >
                    {selectedAssignedSales
                      ? (() => {
                          const s = salesData?.data?.employees?.find(
                            (x) => x._id === selectedAssignedSales,
                          );
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
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No sales found.
                      </div>
                    ) : (
                      filteredSales.map((s) => (
                        <div
                          key={s._id}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 hover:text-slate-900",
                            selectedAssignedSales === s._id
                              ? "bg-slate-100"
                              : "",
                          )}
                          onClick={() => {
                            setValue("assignedSales", s._id, {
                              shouldValidate: true,
                            });
                            clearErrors("root");
                            setSalesPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedAssignedSales === s._id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {s.name}
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              {errors.assignedSales && (
                <p className="text-xs text-red-500">
                  {errors.assignedSales.message}
                </p>
              )}
            </div>

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="projectName">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="projectName"
                placeholder="Enter Project Name"
                {...register("projectName")}
                onChange={(e) => {
                  register("projectName").onChange(e);
                  clearErrors("root");
                }}
                className={
                  errors.projectName ? "border-red-500 ring-1 ring-red-500" : ""
                }
              />
              {errors.projectName && (
                <p className="text-xs text-red-500">
                  {errors.projectName.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                placeholder="Enter Location"
                {...register("location")}
                onChange={(e) => {
                  register("location").onChange(e);
                  clearErrors("root");
                }}
                className={
                  errors.location ? "border-red-500 ring-1 ring-red-500" : ""
                }
              />
              {errors.location && (
                <p className="text-xs text-red-500">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Lead Details */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Lead Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lead Source */}
            <div className="space-y-2">
              <Label htmlFor="source">
                Lead Source <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="source"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      clearErrors("root");
                    }}
                  >
                    <SelectTrigger
                      id="source"
                      className={cn(
                        "w-full",
                        errors.source
                          ? "border-red-500 ring-1 ring-red-500"
                          : "",
                      )}
                    >
                      <SelectValue placeholder="Select lead source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chat">Chat</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="import">Import</SelectItem>
                      <SelectItem value="customer_portal">
                        Customer Portal
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.source && (
                <p className="text-xs text-red-500">{errors.source.message}</p>
              )}
            </div>

            {/* Quote Value */}
            <div className="space-y-2">
              <Label htmlFor="quoteValue">
                Quote Value <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quoteValue"
                type="number"
                min="0"
                step="any"
                placeholder="Enter Quote Value"
                {...register("quoteValue")}
                onChange={(e) => {
                  register("quoteValue").onChange(e);
                  clearErrors("root");
                }}
                className={
                  errors.quoteValue ? "border-red-500 ring-1 ring-red-500" : ""
                }
              />
              {errors.quoteValue && (
                <p className="text-xs text-red-500">
                  {errors.quoteValue.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Project Specification */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Project Specification</h2>
          <div className="space-y-4">
            {/* Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Width */}
              <div className="space-y-2">
                <Label htmlFor="width">
                  Width (ft/m) <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberStep("width", -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="width"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register("width")}
                    onChange={(e) => {
                      register("width").onChange(e);
                      clearErrors("root");
                    }}
                    className={cn(
                      "text-center",
                      errors.width ? "border-red-500 ring-1 ring-red-500" : "",
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberStep("width", 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.width && (
                  <p className="text-xs text-red-500">{errors.width.message}</p>
                )}
              </div>

              {/* Length */}
              <div className="space-y-2">
                <Label htmlFor="length">
                  Length (ft/m) <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberStep("length", -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="length"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register("length")}
                    onChange={(e) => {
                      register("length").onChange(e);
                      clearErrors("root");
                    }}
                    className={cn(
                      "text-center",
                      errors.length ? "border-red-500 ring-1 ring-red-500" : "",
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberStep("length", 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.length && (
                  <p className="text-xs text-red-500">
                    {errors.length.message}
                  </p>
                )}
              </div>

              {/* Height */}
              <div className="space-y-2">
                <Label htmlFor="height">
                  Height (ft/m) <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberStep("height", -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="height"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register("height")}
                    onChange={(e) => {
                      register("height").onChange(e);
                      clearErrors("root");
                    }}
                    className={cn(
                      "text-center",
                      errors.height ? "border-red-500 ring-1 ring-red-500" : "",
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberStep("height", 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.height && (
                  <p className="text-xs text-red-500">
                    {errors.height.message}
                  </p>
                )}
              </div>
            </div>

            {/* Roof Style and Building Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Roof Style */}
              <div className="space-y-2">
                <Label htmlFor="roofStyle">
                  Roof Style <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="roofStyle"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        clearErrors("root");
                      }}
                    >
                      <SelectTrigger
                        id="roofStyle"
                        className={cn(
                          "w-full",
                          errors.roofStyle
                            ? "border-red-500 ring-1 ring-red-500"
                            : "",
                        )}
                      >
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
                  )}
                />
                {errors.roofStyle && (
                  <p className="text-xs text-red-500">
                    {errors.roofStyle.message}
                  </p>
                )}
              </div>

              {/* Building Type */}
              <div className="space-y-2">
                <Label htmlFor="buildingType">
                  Building Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="buildingType"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        clearErrors("root");
                      }}
                    >
                      <SelectTrigger
                        id="buildingType"
                        className={cn(
                          "w-full",
                          errors.buildingType
                            ? "border-red-500 ring-1 ring-red-500"
                            : "",
                        )}
                      >
                        <SelectValue placeholder="Select Building Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="arch-buildings">
                          Arch Buildings
                        </SelectItem>
                        <SelectItem value="aviation">Aviation</SelectItem>
                        <SelectItem value="carports">Carports</SelectItem>
                        <SelectItem value="workshops">Workshops</SelectItem>
                        <SelectItem value="agricultural">
                          Agricultural
                        </SelectItem>
                        <SelectItem value="warehouses">Warehouses</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="sales-storage">
                          Sales Storage
                        </SelectItem>
                        <SelectItem value="barndominiums">
                          Barndominiums
                        </SelectItem>
                        <SelectItem value="garages">Garages</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.buildingType && (
                  <p className="text-xs text-red-500">
                    {errors.buildingType.message}
                  </p>
                )}
              </div>
            </div>

            {/* Additional Specs (Optional: Doors, Windows, Insulation) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Doors */}
              <div className="space-y-2">
                <Label htmlFor="doors">Doors</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberStep("doors", -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="doors"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register("doors")}
                    onChange={(e) => {
                      register("doors").onChange(e);
                      clearErrors("root");
                    }}
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberStep("doors", 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.doors && (
                  <p className="text-xs text-red-500">{errors.doors.message}</p>
                )}
              </div>

              {/* Windows */}
              <div className="space-y-2">
                <Label htmlFor="windows">Windows</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberStep("windows", -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="windows"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register("windows")}
                    onChange={(e) => {
                      register("windows").onChange(e);
                      clearErrors("root");
                    }}
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberStep("windows", 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.windows && (
                  <p className="text-xs text-red-500">
                    {errors.windows.message}
                  </p>
                )}
              </div>

              {/* Insulation */}
              <div className="space-y-2">
                <Label htmlFor="insulation">Insulation</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberStep("insulation", -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="insulation"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register("insulation")}
                    onChange={(e) => {
                      register("insulation").onChange(e);
                      clearErrors("root");
                    }}
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleNumberStep("insulation", 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.insulation && (
                  <p className="text-xs text-red-500">
                    {errors.insulation.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting || createLead.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting || createLead.isPending}
          >
            {isSubmitting || createLead.isPending
              ? "Saving Lead..."
              : "Save Lead"}
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
          setValue("customerId", newCustomer.id, { shouldValidate: true });
          clearErrors("root");
          setIsAddCustomerOpen(false);
        }}
      />
    </div>
  );
}
