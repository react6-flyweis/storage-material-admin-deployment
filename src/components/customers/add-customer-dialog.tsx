import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useSalesEmployeesQuery, useCreateCustomerMutation } from "@/modules/customers/customers.hooks";

type Customer = {
  id: string;
  customerName: string;
  phone?: string;
  email?: string;
  inquiryFor?: string;
  status?: string;
  createdAt: Date;
  isReturning?: boolean;
};

export default function AddCustomerDialog({
  onAdd,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  onAdd?: (c: Customer) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;
  
  const [showSuccess, setShowSuccess] = React.useState(false);

  // Fetch sales employees and create customer mutation
  const { data: salesEmployeesResponse, isLoading: isSalesEmployeesLoading } = useSalesEmployeesQuery();
  const salesEmployees = salesEmployeesResponse?.data?.employees ?? [];
  const createCustomerMutation = useCreateCustomerMutation();

  type FormValues = {
    firstName: string;
    email: string;
    phone: string;
    buildingType: string;
    location: string;
    projectName: string;
    countryCode: string;
    assignedSales: string;
    notes?: string;
  };

  const form = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      email: "",
      phone: "",
      buildingType: "Warehouse",
      location: "",
      projectName: "",
      countryCode: "+1",
      assignedSales: "unassigned",
      notes: "",
    },
    resolver: async (values) => {
      const errors: any = {};
      
      if (!values.firstName?.trim()) {
        errors.firstName = { type: "required", message: "Customer name is required" };
      }
      
      if (!values.email?.trim()) {
        errors.email = { type: "required", message: "Email is required" };
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = { type: "pattern", message: "Please enter a valid email" };
      }
      
      if (!values.phone?.trim()) {
        errors.phone = { type: "required", message: "Phone number is required" };
      } else if (!/^\d{10}$/.test(values.phone.replace(/\D/g, ""))) {
        errors.phone = { type: "pattern", message: "Phone must be 10 digits" };
      }
      
      if (!values.buildingType?.trim()) {
        errors.buildingType = { type: "required", message: "Building type is required" };
      }
      
      if (!values.location?.trim()) {
        errors.location = { type: "required", message: "Location is required" };
      }
      
      if (!values.projectName?.trim()) {
        errors.projectName = { type: "required", message: "Project name is required" };
      }
      
      return {
        values: Object.keys(errors).length === 0 ? values : {},
        errors,
      };
    },
  });

  function onSubmit(values: FormValues) {
    // Prepare data for API
    const apiData = {
      firstName: values.firstName,
      email: values.email,
      phone: values.phone,
      buildingType: values.buildingType,
      location: values.location,
      projectName: values.projectName,
      countryCode: values.countryCode,
      assignedSales: values.assignedSales === "unassigned" ? "" : values.assignedSales,
    };

    createCustomerMutation.mutate(apiData, {
      onSuccess: (response) => {
        // Create customer object for callback (maintaining backward compatibility)
        const newCustomer: Customer = {
          id: response.data.customer._id,
          customerName: response.data.customer.firstName || "Unnamed",
          inquiryFor: values.buildingType,
          status: "New",
          createdAt: new Date(),
          isReturning: false,
          phone: values.phone,
          email: values.email,
        };

        if (onAdd) {
          onAdd(newCustomer);
        }
        setOpen(false);
        form.reset();
        setShowSuccess(true);
      },
      onError: (error) => {
        console.error("Failed to create customer:", error);
        // You can add error handling here (toast notification, etc.)
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="p-0">
        <DialogHeader className="border-b p-5">
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-3 p-4 pt-0"
        >
          <Controller
            control={form.control}
            name="firstName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="firstName">Customer Name <span className="text-red-500">*</span></FieldLabel>
                <Input
                  {...field}
                  id="firstName"
                  placeholder="John Doe"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="buildingType"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="buildingType">Building Type <span className="text-red-500">*</span></FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="buildingType"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Warehouse">Warehouse</SelectItem>
                      <SelectItem value="Garage">Garage</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="location"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="location">Location <span className="text-red-500">*</span></FieldLabel>
                  <Input
                    {...field}
                    id="location"
                    placeholder="Chennai"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="projectName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="projectName">Project Name <span className="text-red-500">*</span></FieldLabel>
                <Input
                  {...field}
                  id="projectName"
                  placeholder="Ravi Warehouse"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="notes"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="notes">Notes</FieldLabel>
                <Textarea
                  {...field}
                  id="notes"
                  placeholder="Notes about the customer"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="assignedSales"
            render={({ field, fieldState }) => {
              // Get the selected employee name for display
              const selectedEmployee = salesEmployees.find(emp => emp._id === field.value);
              const displayText = field.value === "unassigned" || !field.value
                ? "Unassigned"
                : selectedEmployee?.name || "Assigned";

              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="assignedSales">Assign Lead to</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="assignedSales"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder={isSalesEmployeesLoading ? "Loading..." : displayText} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {isSalesEmployeesLoading ? (
                        <SelectItem value="loading" disabled>Loading sales employees...</SelectItem>
                      ) : salesEmployees.length > 0 ? (
                        salesEmployees
                          .filter(employee => employee.isActive) // Only show active employees
                          .map((employee) => (
                            <SelectItem key={employee._id} value={employee._id}>
                              <div className="flex items-center space-x-2">
                                <div className="size-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                  {employee.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">{employee.name || "Unknown"}</span>
                                  <span className="text-xs text-gray-500">{employee.email}</span>
                                </div>
                                {employee.assignedLeadCount !== undefined && (
                                  <span className="text-xs text-gray-400 ml-auto">
                                    {employee.assignedLeadCount} leads
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="no-employees" disabled>No sales employees available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              );
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="countryCode"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="countryCode">Country Code <span className="text-red-500">*</span></FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="countryCode"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+91">+91 (India)</SelectItem>
                      <SelectItem value="+1">+1 (USA)</SelectItem>
                      <SelectItem value="+44">+44 (UK)</SelectItem>
                      <SelectItem value="+86">+86 (China)</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="phone">Phone Number <span className="text-red-500">*</span></FieldLabel>
                  <Input
                    {...field}
                    id="phone"
                    placeholder="9876543210"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email <span className="text-red-500">*</span></FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="ravi@ex.com"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <div className="w-full flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit">Add & Assign</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Customer Added Successfully!"
      />
    </Dialog>
  );
}
