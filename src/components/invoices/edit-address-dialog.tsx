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

export interface AddressDialogValues {
  companyName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

type Props = {
  children?: React.ReactNode;
  initialValues?: Partial<AddressDialogValues>;
  title?: string;
  description?: string;
  onDone: (values: AddressDialogValues) => void;
};

export default function EditAddressDialog({
  children,
  initialValues,
  title = "Edit Address",
  description = "Update the address details for this invoice.",
  onDone,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<AddressDialogValues>({
    companyName: initialValues?.companyName ?? "",
    line1: initialValues?.line1 ?? "",
    line2: initialValues?.line2 ?? "",
    city: initialValues?.city ?? "",
    state: initialValues?.state ?? "",
    postalCode: initialValues?.postalCode ?? "",
    country: initialValues?.country ?? "United States",
  });

  React.useEffect(() => {
    if (open) {
      setForm({
        companyName: initialValues?.companyName ?? "",
        line1: initialValues?.line1 ?? "",
        line2: initialValues?.line2 ?? "",
        city: initialValues?.city ?? "",
        state: initialValues?.state ?? "",
        postalCode: initialValues?.postalCode ?? "",
        country: initialValues?.country ?? "United States",
      });
    }
  }, [initialValues, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDone(form);
    setOpen(false);
  };

  const updateField = (field: keyof AddressDialogValues, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">{title}</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label className="text-xs text-gray-700">Company / Customer Name</Label>
            <Input
              value={form.companyName ?? ""}
              onChange={(e) => updateField("companyName", e.target.value)}
              placeholder="e.g. Steel Building Depot LLC"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-gray-700">Street Address</Label>
            <Input
              value={form.line1 ?? ""}
              onChange={(e) => updateField("line1", e.target.value)}
              placeholder="Street address or P.O. Box"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-gray-700">Suite / Line 2 (Optional)</Label>
            <Input
              value={form.line2 ?? ""}
              onChange={(e) => updateField("line2", e.target.value)}
              placeholder="Suite, unit, building, floor, etc."
              className="h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-700">City</Label>
              <Input
                value={form.city ?? ""}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="City"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-700">State / Province</Label>
              <Input
                value={form.state ?? ""}
                onChange={(e) => updateField("state", e.target.value)}
                placeholder="State / Province"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-700">Postal / ZIP Code</Label>
              <Input
                value={form.postalCode ?? ""}
                onChange={(e) => updateField("postalCode", e.target.value)}
                placeholder="Postal / ZIP Code"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-700">Country</Label>
              <Input
                value={form.country ?? ""}
                onChange={(e) => updateField("country", e.target.value)}
                placeholder="Country"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="h-9 text-xs">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              Save Address
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
