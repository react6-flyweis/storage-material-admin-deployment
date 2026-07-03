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
import { Controller, useForm } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useCreateBasicCustomerMutation } from "@/modules/customers/customers.hooks";

type Customer = {
  id: string;
  customerName: string;
  phone?: string;
  email?: string;
  createdAt: Date;
};

export default function AddBasicCustomerDialog({
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
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const createCustomerMutation = useCreateBasicCustomerMutation();

  type FormValues = {
    firstName: string;
    email: string;
    phone: string;
    countryCode: string;
  };

  const form = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      email: "",
      phone: "",
      countryCode: "+1",
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
      
      return {
        values: Object.keys(errors).length === 0 ? values : {},
        errors,
      };
    },
  });

  function onSubmit(values: FormValues) {
    setErrorMessage(null);
    const apiData = {
      firstName: values.firstName,
      email: values.email,
      phone: values.phone,
      countryCode: values.countryCode,
    };

    createCustomerMutation.mutate(apiData, {
      onSuccess: (response) => {
        const newCustomer: Customer = {
          id: response.data.customer._id,
          customerName: response.data.customer.firstName || "Unnamed",
          createdAt: new Date(),
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
      onError: (error: any) => {
        console.error("Failed to create customer:", error);
        setErrorMessage(error?.response?.data?.message || "Failed to create customer");
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
          className="space-y-4 p-4 pt-0"
        >
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-2">
              {errorMessage}
            </div>
          )}
          
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
                  placeholder="john@example.com"
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

          <DialogFooter className="mt-6">
            <div className="w-full flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                  setErrorMessage(null);
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createCustomerMutation.isPending}>
                {createCustomerMutation.isPending ? "Adding..." : "Add Customer"}
              </Button>
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
