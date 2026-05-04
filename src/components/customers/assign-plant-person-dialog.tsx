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

type FormValues = {
  assignPlant: string;
  priority: string;
  panel: string;
  notes: string;
};

type Props = {
  trigger?: React.ReactNode | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  customerId?: string | null;
};

export default function AssignPlantPersonDialog({
  trigger,
  open,
  onOpenChange,
  customerId,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      assignPlant: "James Lee",
      priority: "Low",
      panel: "Plant",
      notes: "James Lee",
    },
  });

  const dialogOpen = open ?? internalOpen;
  const setDialogOpen = onOpenChange ?? setInternalOpen;
  const shouldRenderTrigger = trigger !== undefined && trigger !== null;
  const hasExplicitTrigger = trigger !== undefined;

  useEffect(() => {
    if (!dialogOpen) {
      reset();
    }
  }, [dialogOpen, reset]);

  const onAssign = (values: FormValues) => {
    console.log("Assigning to plant", {
      customerId,
      ...values,
    });
    setDialogOpen(false);
    setShowSuccess(true);
  };

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
            <Label htmlFor="assignPlant">Assign Plant</Label>
            <Controller
              control={control}
              name="assignPlant"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="assignPlant" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="James Lee">James Lee</SelectItem>
                    <SelectItem value="Linda Park">Linda Park</SelectItem>
                    <SelectItem value="Mike Ross">Mike Ross</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="priority" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="panel">Select Panel</Label>
              <Controller
                control={control}
                name="panel"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="panel" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Plant">Plant</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Plant 2">Plant 2</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <textarea
                  id="notes"
                  {...field}
                  className="min-h-30 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              )}
            />
          </div>

          <DialogFooter className="p-4 flex flex-wrap gap-3 justify-end">
            <DialogClose asChild>
              <Button variant="ghost" type="button" className="min-w-35">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="min-w-35 bg-blue-600 hover:bg-blue-700"
            >
              Assign to Plant
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
