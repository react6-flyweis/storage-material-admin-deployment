import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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
import LeadSelector from "@/components/leads/lead-selector";
import SuccessDialog from "@/components/success-dialog";
import { useAddWipPaymentMutation } from "@/modules/financials/financials.hooks";
import { getApiErrorMessage } from "@/lib/api-error";

const paymentEntrySchema = z.object({
  leadId: z.string().min(1, "Project / Payer selection is required"),
  payerName: z.string().optional(),
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
  onSuccess?: () => void;
};

const paymentTypes = ["deposit", "progress", "final"];

export default function AddPaymentEntryDialog({
  open,
  onClose,
  onSuccess,
}: AddPaymentEntryDialogProps) {
  const [rootError, setRootError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const addPaymentMutation = useAddWipPaymentMutation();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
    reset,
  } = useForm<PaymentEntryFormData>({
    resolver: zodResolver(paymentEntrySchema),
    defaultValues: {
      leadId: "",
      payerName: "",
      paymentType: "",
      amount: "",
      paymentDate: "",
      transactionId: "",
      remarks: "",
    },
  });

  const selectedLeadId = watch("leadId");
  const selectedPaymentType = watch("paymentType");

  useEffect(() => {
    if (!open) {
      reset();
      setRootError(null);
    }
  }, [open, reset]);

  const onSubmit = async (data: PaymentEntryFormData) => {
    setRootError(null);

    const numericAmount = parseFloat(data.amount.replace(/[^0-9.]/g, ""));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("amount", { message: "Please enter a valid positive amount" });
      return;
    }

    try {
      await addPaymentMutation.mutateAsync({
        leadId: data.leadId,
        payload: {
          payerName: data.payerName || undefined,
          paymentType: data.paymentType,
          amount: numericAmount,
          paymentDate: data.paymentDate,
          transactionId: data.transactionId,
          remarks: data.remarks || undefined,
        },
      });

      reset();
      onClose();
      setShowSuccess(true);
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = getApiErrorMessage(err);
      setRootError(errorMessage || "Failed to add payment entry");
    }
  };

  const handleCancel = () => {
    reset();
    setRootError(null);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => !val && handleCancel()}>
        <DialogContent className="sm:max-w-xl p-0 gap-0">
          <DialogHeader className="border-b p-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Add payment entry
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
            {rootError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {rootError}
              </div>
            )}

            {/* Payer / Project Selector and Payment Type */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="payerName"
                  className="text-sm font-medium text-slate-700"
                >
                  Payer Name / Project <span className="text-red-500">*</span>
                </Label>
                <LeadSelector
                  value={selectedLeadId}
                  onValueChange={(leadId) => {
                    setValue("leadId", leadId, { shouldValidate: true });
                  }}
                  error={!!errors.leadId}
                  placeholder="Search projects..."
                />

                {errors.leadId && (
                  <p className="text-xs text-red-500">
                    {errors.leadId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="paymentType"
                  className="text-sm font-medium text-slate-700"
                >
                  Payment Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedPaymentType}
                  onValueChange={(value) =>
                    setValue("paymentType", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
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
                  Amount <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="any"
                  placeholder="5000"
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
                  Payment Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="paymentDate"
                  type="date"
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
                  Transaction ID <span className="text-red-500">*</span>
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
                disabled={addPaymentMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addPaymentMutation.isPending}>
                {addPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Entry"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Payment entry added successfully!"
      />
    </>
  );
}

