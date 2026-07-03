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
import { Plus } from "lucide-react";
import AddTaxDialog from "@/components/add-tax-dialog";

type Tax = { name: string; rate: string; type?: "%" | "$" };

type Props = {
  children?: React.ReactNode;
  availableTaxes?: Tax[];
  initialSelected?: string[]; // names
  onDone: (selectedNames: string[], updatedTaxes: Tax[]) => void;
};

export default function TaxDialog({
  children,
  availableTaxes = [],
  initialSelected = [],
  onDone,
}: Props) {
  const [taxes, setTaxes] = React.useState<Tax[]>(availableTaxes);
  const [checked, setChecked] = React.useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    initialSelected.forEach((n) => (map[n] = true));
    return map;
  });

  React.useEffect(() => {
    setTaxes(availableTaxes);
    // re-sync checked when initialSelected changes
    setChecked(() => {
      const map: Record<string, boolean> = {};
      initialSelected.forEach((n) => (map[n] = true));
      return map;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    availableTaxes.join?.("|") || JSON.stringify(availableTaxes),
    initialSelected.join("|"),
  ]);

  const toggle = (name: string) => {
    setChecked((s) => ({ ...s, [name]: !s[name] }));
  };

  const handleAdd = (tax: Tax) => {
    // add to top and check it
    setTaxes((s) => [{ ...tax }, ...s.filter((t) => t.name !== tax.name)]);
    setChecked((s) => ({ ...s, [tax.name]: true }));
  };

  const handleDone = () => {
    const selected = Object.keys(checked).filter((k) => checked[k]);
    onDone(selected, taxes);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-0">
        <div className="p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">Tax</DialogTitle>
            <DialogDescription className="sr-only">
              Select taxes or add a new one
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <div className="space-y-3">
              {taxes.map((t, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 cursor-pointer text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={!!checked[t.name]}
                    onChange={() => toggle(t.name)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">
                    {t.name} ({t.type === "$" ? "$" : ""}{t.rate}{t.type !== "$" ? "%" : ""})
                  </span>
                </label>
              ))}

              <AddTaxDialog onAdd={handleAdd}>
                <button
                  type="button"
                  className="flex items-center gap-3 text-blue-600 hover:underline mt-3"
                >
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </span>
                  <span className="text-sm">New Tax</span>
                </button>
              </AddTaxDialog>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex items-center justify-between">
          <DialogClose asChild>
            <Button
              size="lg"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg w-32"
            >
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button size="lg" onClick={handleDone} className="rounded-lg w-32">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
