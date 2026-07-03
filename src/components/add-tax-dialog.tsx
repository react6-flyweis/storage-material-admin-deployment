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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  children?: React.ReactNode;
  initialName?: string;
  initialRate?: string;
  initialType?: "%" | "$";
  onAdd: (tax: { name: string; rate: string; type: "%" | "$" }) => void;
};

export default function AddTaxDialog({
  children,
  initialName = "",
  initialRate = "",
  initialType = "%",
  onAdd,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(initialName);
  const [rate, setRate] = React.useState(initialRate);
  const [type, setType] = React.useState<"%" | "$">(initialType);

  React.useEffect(() => {
    setName(initialName);
    setRate(initialRate);
    setType(initialType);
  }, [initialName, initialRate, initialType, open]);

  const handleAdd = () => {
    const n = name.trim();
    const r = rate.trim();
    if (!n || !r) return;
    onAdd({ name: n, rate: r, type });
    setName("");
    setRate("");
    setType("%");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md p-0">
        <div className="p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">New Tax</DialogTitle>
            <DialogDescription className="sr-only">
              Add a new tax rate
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Tax Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Texas"
                  className="h-12 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="new-tax-type"
                    checked={type === "%"}
                    onChange={() => setType("%")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">%</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="new-tax-type"
                    checked={type === "$"}
                    onChange={() => setType("$")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">$</span>
                </label>
              </div>

              <div className="space-y-2">
                <Label>Tax Rate / Amount</Label>
                <div className="relative">
                  <Input
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="Enter"
                    className="pr-12 h-12 rounded-lg"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {type}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex items-center justify-between">
          <DialogClose asChild>
            <Button
              size="lg"
              className="rounded-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            size="lg"
            onClick={handleAdd}
            className="rounded-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
