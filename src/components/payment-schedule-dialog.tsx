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
  onDone: (payload: { type: "%" | "$"; payments: Payment[] }) => void;
};

export default function PaymentScheduleDialog({
  children,
  initialType = "%",
  initialPayments = [],
  maxPercent = 100,
  onDone,
}: Props) {
  type FormValues = { type: "%" | "$"; payments: Payment[] };

  const [open, setOpen] = React.useState(false);

  const { control, register, handleSubmit, reset, setValue } =
    useForm<FormValues>({
      defaultValues: { type: initialType, payments: initialPayments },
      mode: "onChange",
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "payments",
  });

  // reset when props change
  React.useEffect(() => {
    reset({ type: initialType, payments: initialPayments });
  }, [initialType, initialPayments, reset]);

  // Ensure there's at least one payment row when the dialog opens
  React.useEffect(() => {
    if (open && fields.length === 0) {
      // show a single empty row when opening
      append({ name: "", amount: "" });
    }
  }, [open, fields.length, append]);

  const watchedPayments = useWatch({ control, name: "payments" });
  const watchedType = useWatch({ control, name: "type" }) || initialType;

  const totalAmount = (watchedPayments || []).reduce(
    (sum: number, p: Payment) => sum + (parseFloat(p.amount || "0") || 0),
    0
  );

  const error =
    watchedType === "%" && totalAmount > maxPercent
      ? `Sum of payments exceeds ${maxPercent}%`
      : "";

  const remainingLabel = React.useMemo(() => {
    if (watchedType === "%") {
      const rem = Math.max(0, maxPercent - totalAmount);
      return `${rem.toFixed(2)}% Remaining`;
    }
    return `${totalAmount.toFixed(2)} Total`;
  }, [totalAmount, watchedType, maxPercent]);

  const onSubmit = (data: FormValues) => {
    if (watchedType === "%" && totalAmount > maxPercent) return; // prevent submit

    const cleaned = data.payments.map((p) => ({
      name: (p.name || "").trim(),
      amount: (p.amount || "").trim(),
    }));
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
                          current.map((p) => ({ ...p, amount: "" }))
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
                          current.map((p) => ({ ...p, amount: "" }))
                        );
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">$</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {fields.map((field, i) => (
                    <React.Fragment key={field.id}>
                      <div className="space-y-2">
                        <Label>Payment Name</Label>
                        <Input
                          {...register(`payments.${i}.name` as const)}
                          placeholder={i === 0 ? "Deposit" : `Payment ${i + 1}`}
                          className="h-12 rounded-lg"
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
                          placeholder={watchedType === "%" ? "25%" : "0.00"}
                          className="h-12 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => remove(i)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-red-500"
                          aria-label={`remove-payment-${i}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </React.Fragment>
                  ))}
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
