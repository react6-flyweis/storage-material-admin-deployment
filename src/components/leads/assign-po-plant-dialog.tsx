import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Controller, useForm } from "react-hook-form";
import { useAdminEmployeesQuery } from "@/modules/employees/employees.hooks";
import { useAssignPurchaseOrderMutation } from "@/modules/purchase-orders/purchase-orders.hooks";
import { toast } from "sonner";

type FormValues = {
  assignPlant: string;
  notes: string;
};

type Props = {
  trigger?: React.ReactNode | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  poOrderId: string | null;
};

export default function AssignPoPlantDialog({
  trigger,
  open,
  onOpenChange,
  poOrderId,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      assignPlant: "",
      notes: "",
    },
  });

  const dialogOpen = open ?? internalOpen;
  const setDialogOpen = onOpenChange ?? setInternalOpen;
  const shouldRenderTrigger = trigger !== undefined && trigger !== null;
  const hasExplicitTrigger = trigger !== undefined;

  const { data: employeesResponse, isLoading: isEmployeesLoading } = useAdminEmployeesQuery({
    role: "plant"
  });

  const assignMutation = useAssignPurchaseOrderMutation();

  useEffect(() => {
    if (!dialogOpen) {
      reset();
    }
  }, [dialogOpen, reset]);

  const onAssign = (values: FormValues) => {
    if (!poOrderId) return;
    if (!values.assignPlant) {
      toast.error("Please select a plant employee");
      return;
    }

    assignMutation.mutate(
      { poOrderId, assignedTo: values.assignPlant /*, adminNotes: values.notes */ },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setShowSuccess(true);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to assign plant person");
        }
      }
    );
  };

  const plantEmployees = employeesResponse?.data?.employees || [];

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {shouldRenderTrigger ? (
        <DialogTrigger asChild>
          {hasExplicitTrigger ? (
            trigger
          ) : (
            <Button className="bg-blue-600 hover:bg-blue-700">Assign</Button>
          )}
        </DialogTrigger>
      ) : null}

      <DialogContent className="p-0">
        <DialogHeader className="border-b p-5">
          <DialogTitle className="text-lg">Assign Plant person</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onAssign)} className="space-y-4 p-4">
          <div>
            <Label htmlFor="assignPlant">Assign Employee</Label>
            <Controller
              control={control}
              name="assignPlant"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="assignPlant" className="w-full mt-1" disabled={isEmployeesLoading}>
                    <SelectValue placeholder={isEmployeesLoading ? "Loading..." : "Select a plant person"} />
                  </SelectTrigger>
                  <SelectContent>
                    {plantEmployees.length > 0 ? (
                      plantEmployees.map((emp) => (
                        <SelectItem key={emp._id} value={emp._id}>
                          {emp.name} {emp.email ? `(${emp.email})` : ""}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="empty" disabled>No plant personnel found </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* 
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <textarea
                  id="notes"
                  {...field}
                  className="mt-1 min-h-30 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              )}
            />
          </div> 
          */}

          <DialogFooter className="p-4 pb-0 border-t flex flex-wrap gap-3 justify-end">
            <DialogClose asChild>
              <Button size="lg" variant="secondary" type="button" disabled={assignMutation.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button size="lg" type="submit" disabled={assignMutation.isPending}>
              {assignMutation.isPending ? "Assigning..." : "Assign Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Assigned to Plant Successfully!"
      />
    </Dialog>
  );
}
