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
}: {
  onAdd: (c: Customer) => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  type FormValues = {
    customerName: string;
    inquiryFor: string;
    status: string;
    notes?: string;
    assignTo?: string;
    phone?: string;
    email?: string;
  };

  const form = useForm<FormValues>({
    defaultValues: {
      customerName: "",
      inquiryFor: "Wearhouse",
      status: "New",
      notes: "",
      assignTo: "",
      phone: "",
      email: "",
    },
  });

  function onSubmit(values: FormValues) {
    const id = `ID-${new Date().getFullYear()}-${
      Math.floor(Math.random() * 9000) + 1000
    }`;
    const newCustomer: Customer = {
      id,
      customerName: values.customerName || "Unnamed",
      inquiryFor: values.inquiryFor,
      status: values.status || "New",
      createdAt: new Date(),
      isReturning: false,
      phone: values.phone,
      email: values.email,
    };
    onAdd(newCustomer);
    setOpen(false);
    form.reset();
    setShowSuccess(true);
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
            name="customerName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="customerName">Customer Name</FieldLabel>
                <Input
                  {...field}
                  id="customerName"
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
              name="inquiryFor"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="inquiryFor">Customer Request</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="inquiryFor"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wearhouse">Wearhouse</SelectItem>
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
              name="status"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="status">Customer Status</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="status"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

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
            name="assignTo"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="assignTo">Assign Lead to</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="assignTo"
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="james">James Lee</SelectItem>
                    <SelectItem value="linda">Linda Park</SelectItem>
                    <SelectItem value="mike">Mike Ross</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <Input
                    {...field}
                    id="phone"
                    placeholder="0987654321"
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
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="client@gmail.com"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

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
