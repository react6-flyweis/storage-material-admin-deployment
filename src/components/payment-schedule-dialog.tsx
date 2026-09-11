import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, useFieldArray, useWatch } from "react-hook-form";

type Payment = { name: string; amount: string };

type Props = {
  children?: React.ReactNode;
  initialType?: "%" | "$";
  initialPayments?: Payment[];
  maxPercent?: number;
  deposit?: {
    type: "%" | "$";
    value: string;
  };
  onDone: (payload: { type: "%" | "$"; payments: Payment[] }) => void;
};

export default function PaymentScheduleDialog({
  children,
  initialType = "%",
  initialPayments = [],
  maxPercent = 100,
  deposit,
  onDone,
}: Props) {
  type FormValues = { type: "%" | "$"; payments: Payment[] };

  const [open, setOpen] = React.useState(false);

  const hasDeposit = Boolean(
    deposit &&
      deposit.value &&
      parseFloat(deposit.value) > 0
  );

  const getNormalizedPayments = React.useCallback(() => {
    const list = [...(initialPayments || [])];
    if (hasDeposit && deposit) {
      const depositIdx = list.findIndex(
        (p) => p.name.trim().toLowerCase() === "deposit"
      );
      if (depositIdx >= 0) {
        list[depositIdx] = {
          name: "Deposit",
          amount: deposit.value,
        };
        if (depositIdx !== 0) {
          const [d] = list.splice(depositIdx, 1);
          list.unshift(d);
        }
      } else {
        list.unshift({
          name: "Deposit",
          amount: deposit.value,
        });
      }
    }
    return list;
  }, [initialPayments, hasDeposit, deposit]);

  const { control, register, handleSubmit, reset, setValue } =
    useForm<FormValues>({
      defaultValues: { type: initialType, payments: getNormalizedPayments() },
      mode: "onChange",
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "payments",
  });

  // reset when props change
  React.useEffect(() => {
    reset({ type: initialType, payments: getNormalizedPayments() });
  }, [initialType, getNormalizedPayments, reset]);

  // Ensure there's at least one payment row when the dialog opens
  React.useEffect(() => {
    if (open) {
      const current = getNormalizedPayments();
      if (current.length === 0) {
        append({ name: "", amount: "" });
      } else if (hasDeposit && current.length === 1) {
        append({ name: "", amount: "" });
      }
    }
  }, [open, append, hasDeposit, getNormalizedPayments]);

  const watchedPayments = useWatch({ control, name: "payments" });
  const watchedType = useWatch({ control, name: "type" }) || initialType;

  const limit = watchedType === "%" ? 100 : maxPercent;

  const totalAmount = (watchedPayments || []).reduce(
    (sum: number, p: Payment) => sum + (parseFloat(p.amount || "0") || 0),
    0
  );

  const error =
    watchedType === "%" && totalAmount > limit
      ? `Sum of payments exceeds ${limit}%`
      : "";

  const remainingLabel = React.useMemo(() => {
    if (watchedType === "%") {
      const rem = Math.max(0, limit - totalAmount);
      return `${rem.toFixed(2)}% Remaining`;
    }
    return `${totalAmount.toFixed(2)} Total`;
  }, [totalAmount, watchedType, limit]);

  const onSubmit = (data: FormValues) => {
    if (watchedType === "%" && totalAmount > limit) return; // prevent submit

    const cleaned = data.payments
      .map((p) => ({
        name: (p.name || "").trim(),
        amount: (p.amount || "").trim(),
      }))
      .filter((p) => p.name || p.amount);

    onDone({ type: data.type, payments: cleaned });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-xl p-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <DialogTitle className="text-lg font-semibold">
                Payment Schedule
              </DialogTitle>
              <DialogDescription className="sr-only">
                Configure payment schedule
              </DialogDescription>
            </DialogHeader>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="%"
                      {...register("type")}
                      checked={watchedType === "%"}
                      onChange={() => {
                        setValue("type", "%");
                        const current = watchedPayments || [];
                        setValue(
                          "payments",
                          current.map((p, idx) => ({
                            ...p,
                            amount:
                              hasDeposit && idx === 0 && deposit?.type === "%"
                                ? deposit.value
                                : "",
                          }))
                        );
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">%</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="$"
                      {...register("type")}
                      checked={watchedType === "$"}
                      onChange={() => {
                        setValue("type", "$");
                        const current = watchedPayments || [];
                        setValue(
                          "payments",
                          current.map((p, idx) => ({
                            ...p,
                            amount:
                              hasDeposit && idx === 0 && deposit?.type === "$"
                                ? deposit.value
                                : "",
                          }))
                        );
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">$</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {fields.map((field, i) => {
                    const isDepositRow = hasDeposit && i === 0;

                    return (
                      <React.Fragment key={field.id}>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1.5">
                            Payment Name
                            {isDepositRow && (
                              <span className="text-xs font-normal text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                Deposit
                              </span>
                            )}
                          </Label>
                          <Input
                            {...register(`payments.${i}.name` as const)}
                            readOnly={isDepositRow}
                            placeholder={
                              hasDeposit
                                ? `Payment ${i + 1}`
                                : i === 0
                                ? "Deposit"
                                : `Payment ${i + 1}`
                            }
                            className={`h-12 rounded-lg ${
                              isDepositRow
                                ? "bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200"
                                : ""
                            }`}
                          />
                        </div>

                        <div className="space-y-2 relative">
                          <Label>
                            {watchedType === "%"
                              ? "Payment Percentage"
                              : "Payment Amount"}
                          </Label>
                          <Input
                            {...register(`payments.${i}.amount` as const)}
                            readOnly={isDepositRow}
                            placeholder={watchedType === "%" ? "25%" : "0.00"}
                            className={`h-12 rounded-lg ${
                              isDepositRow
                                ? "bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200"
                                : ""
                            }`}
                          />
                          {!isDepositRow && (
                            <button
                              type="button"
                              onClick={() => remove(i)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-red-500"
                              aria-label={`remove-payment-${i}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => append({ name: "", amount: "" })}
                    className="flex items-center gap-3 text-blue-600 hover:underline mt-3"
                  >
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </span>
                    <span className="text-sm">Add payment</span>
                  </button>
                </div>

                <div className="text-center">
                  <div className="text-blue-600">{remainingLabel}</div>
                  {error && (
                    <div className="text-sm text-red-500 mt-2">{error}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t flex items-center justify-end gap-4">
            <DialogClose asChild>
              <Button
                size="lg"
                className="rounded-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              size="lg"
              disabled={!!error}
              className="rounded-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Done
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
