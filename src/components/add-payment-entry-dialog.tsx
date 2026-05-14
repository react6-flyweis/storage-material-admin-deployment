import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const paymentEntrySchema = z.object({
  payerName: z.string().min(1, "Payer name is required"),
  paymentType: z.string().min(1, "Payment type is required"),
  amount: z.string().min(1, "Amount is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  transactionId: z.string().min(1, "Transaction ID is required"),
  remarks: z.string().optional(),
});

type PaymentEntryFormData = z.infer<typeof paymentEntrySchema>;

type AddPaymentEntryDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: (data: PaymentEntryFormData) => void;
};

const payerNames = [
  "ABC Construction",
  "XYZ Building",
  "James Court",
  "Riverside Office Complex",
  "Duplex Villa",
];

const paymentTypes = ["Bank Transfer", "ACH", "Cheque"];

export default function AddPaymentEntryDialog({
  open,
  onClose,
  onSuccess,
}: AddPaymentEntryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<PaymentEntryFormData>({
    resolver: zodResolver(paymentEntrySchema),
  });

  const onSubmit = async (data: PaymentEntryFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSuccess?.(data);
      reset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleCancel()}>
      <DialogContent className="sm:max-w-xl p-0 gap-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Add payment entry
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
          {/* Payer Name and Payment Type */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="payerName"
                className="text-sm font-medium text-slate-700"
              >
                Payer Name
              </Label>
              <Select onValueChange={(value) => setValue("payerName", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payer" />
                </SelectTrigger>
                <SelectContent>
                  {payerNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.payerName && (
                <p className="text-xs text-red-500">
                  {errors.payerName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="paymentType"
                className="text-sm font-medium text-slate-700"
              >
                Payment Type
              </Label>
              <Select onValueChange={(value) => setValue("paymentType", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  {paymentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentType && (
                <p className="text-xs text-red-500">
                  {errors.paymentType.message}
                </p>
              )}
            </div>
          </div>

          {/* Amount and Payment Date */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="amount"
                className="text-sm font-medium text-slate-700"
              >
                Amount
              </Label>
              <Input
                id="amount"
                type="text"
                placeholder="$5,000"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="paymentDate"
                className="text-sm font-medium text-slate-700"
              >
                Payment Date
              </Label>
              <Input
                id="paymentDate"
                type="date"
                placeholder="15 Jan 2026"
                {...register("paymentDate")}
              />
              {errors.paymentDate && (
                <p className="text-xs text-red-500">
                  {errors.paymentDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Transaction ID and Remarks */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="transactionId"
                className="text-sm font-medium text-slate-700"
              >
                Transaction ID
              </Label>
              <Input
                id="transactionId"
                type="text"
                placeholder="UPI98234XYZ"
                {...register("transactionId")}
              />
              {errors.transactionId && (
                <p className="text-xs text-red-500">
                  {errors.transactionId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="remarks"
                className="text-sm font-medium text-slate-700"
              >
                Remarks{" "}
                <span className="text-xs text-slate-400">(Optional)</span>
              </Label>
              <Textarea
                id="remarks"
                placeholder="January membership payment"
                className="min-h-8"
                {...register("remarks")}
              />
              {errors.remarks && (
                <p className="text-xs text-red-500">{errors.remarks.message}</p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 my-6" />

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save & Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
