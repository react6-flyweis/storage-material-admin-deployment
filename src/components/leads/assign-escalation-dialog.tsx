import React, { useState } from "react";
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
import SuccessDialog from "@/components/success-dialog";
import { useAdminEmployeesQuery } from "@/modules/employees/employees.hooks";
import { useAssignEscalationMutation } from "@/modules/leads/leads.hooks";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Props = {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  escalationId: string;
  note?: string;
};

export default function AssignEscalationDialog({ trigger, open, onOpenChange, escalationId, note }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [salesPerson, setSalesPerson] = useState("");
  
  const dialogOpen = open ?? internalOpen;
  const setDialogOpen = onOpenChange ?? setInternalOpen;

  const { data: employeesResponse, isLoading: isEmployeesLoading } = useAdminEmployeesQuery({
    role: "sales"
  });

  const assignMutation = useAssignEscalationMutation();

  const onAssign = () => {
    if (!salesPerson) {
      toast.error("Please select a sales person");
      return;
    }
    
    assignMutation.mutate(
      { escalationId, employeeId: salesPerson },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setShowSuccess(true);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to assign escalation");
        }
      }
    );
  };

  const salesEmployees = employeesResponse?.data?.employees || [];

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="bg-blue-600 hover:bg-blue-700">Assign</Button>
        )}
      </DialogTrigger>

      <DialogContent className=" p-0 gap-0">
        <DialogHeader className="border-b p-5">
          <DialogTitle className="text-lg">Assign Escalation</DialogTitle>
          <DialogDescription>
            {note && (
              <div className="mt-2 text-sm text-gray-700 bg-orange-50 p-3 rounded-md border border-orange-100 text-left">
                <span className="font-semibold block mb-1">Escalation Note:</span>
                {note}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div>
            <Label>Assign Sales</Label>
            <Select value={salesPerson} onValueChange={setSalesPerson}>
              <SelectTrigger className="w-full mt-1" disabled={isEmployeesLoading}>
                <SelectValue placeholder={isEmployeesLoading ? "Loading..." : "Select a sales person"} />
              </SelectTrigger>
              <SelectContent>
                {salesEmployees.length > 0 ? (
                  salesEmployees.map((emp) => (
                    <SelectItem key={emp._id} value={emp._id}>
                      {emp.name} {emp.email ? `(${emp.email})` : ""}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="empty" disabled>No sales personnel found</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="p-4">
          <DialogClose asChild>
            <Button size="lg" className="bg-gray-300 text-gray-700 mr-2 w-40">
              Cancel
            </Button>
          </DialogClose>

          <Button
            size="lg"
            onClick={onAssign}
            disabled={assignMutation.isPending}
            className="w-40 bg-blue-600 hover:bg-blue-700"
          >
            {assignMutation.isPending ? "Assigning..." : "Assign Escalation"}
          </Button>
        </DialogFooter>
      </DialogContent>
      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Escalation Assigned Successfully!"
      />
    </Dialog>
  );
}
