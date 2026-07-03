import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Eye } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import {
  usePurchaseOrdersQuery,
  useUpdatePurchaseOrderStatusMutation,
} from "@/modules/purchase-orders/purchase-orders.hooks";
import AssignPoPlantDialog from "@/components/leads/assign-po-plant-dialog";
import { toast } from "sonner";

export default function AllPurchaseOrdersPage() {
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [assignPlantDialogOpen, setAssignPlantDialogOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: purchaseOrdersData, isLoading } = usePurchaseOrdersQuery();
  const updateStatusMutation = useUpdatePurchaseOrderStatusMutation();

  const purchaseOrders = purchaseOrdersData?.data?.orders || [];

  const allSelected = useMemo(
    () =>
      purchaseOrders.length > 0 &&
      selectedOrderIds.length === purchaseOrders.length,
    [selectedOrderIds, purchaseOrders]
  );

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(purchaseOrders.map((order) => order._id));
      return;
    }
    setSelectedOrderIds([]);
  };

  const handleToggleOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds((prev) => [...prev, orderId]);
      return;
    }
    setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId));
  };

  const handleApprovePO = (orderId: string) => {
    updateStatusMutation.mutate(
      { poOrderId: orderId, status: "approved" },
      {
        onSuccess: () => {
          setActiveOrderId(orderId);
          setAssignPlantDialogOpen(true);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to approve PO");
        }
      }
    );
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading Purchase Orders...</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-[#e9eef8] min-h-[calc(100vh-80px)]">
      <div>
        <h1 className="text-2xl sm:text-3xl text-slate-900">
          All Purchase Orders - {purchaseOrders.length}
        </h1>
        <p className="text-slate-500 mt-1">Assign and view leads</p>
      </div>

      <Card className=" border-slate-100 shadow-sm py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100/80 border-slate-200 hover:bg-slate-100/80">
                <TableHead className="w-10 px-4">
                  <input
                    aria-label="Select all purchase orders"
                    className="h-3.5 w-3.5 rounded border-slate-300"
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) => handleToggleAll(event.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Lead Info
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  PO Number
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Assigned To
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Status
                </TableHead>
                {/* <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Quote Value
                </TableHead> */}
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Invoice Amount
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Payment Status
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {purchaseOrders.map((order) => {
                const selected = selectedOrderIds.includes(order._id);
                const leadName = order.customerId ? `${order.customerId.firstName || ""} ${order.customerId.lastName || ""}`.trim() || "Unknown Customer" : "Unknown Customer";
                const projectName = order.leadId?.projectName || "";
                const quoteId = order.leadId?.jobId || order.quotationId?.quoteNumber || "Unknown Project";
                const location = order.leadId?.location || order.customerId?.location || "Unknown Location";
                const assignedToName = order.assignedTo?.name || "Unassigned";
                const assignedCount = order.assignedTo ? "1 person assigned" : "No one assigned";
                const quoteValue = order.leadId?.quoteValue || order.invoiceId?.totalAmount || 0;
                const invoiceStatus = order.invoicePayment?.status || order.invoiceId?.status || "Pending";
                const paymentStatus = invoiceStatus.charAt(0).toUpperCase() + invoiceStatus.slice(1);

                return (
                  <TableRow
                    key={order._id}
                    data-state={selected ? "selected" : undefined}
                    className="border-slate-100/80 hover:bg-slate-50"
                  >
                    <TableCell className="px-4">
                      <input
                        aria-label={`Select ${leadName}`}
                        className="h-3.5 w-3.5 rounded border-slate-300"
                        type="checkbox"
                        checked={selected}
                        onChange={(event) =>
                          handleToggleOrder(order._id, event.target.checked)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {leadName}
                        </p>
                        {projectName && (
                          <p className="text-[12px] text-slate-500 mt-0.5">
                            {projectName}
                          </p>
                        )}
                        <p className="text-[12px] text-slate-500 mt-0.5">
                          {quoteId}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {location}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-3 text-sm text-slate-800">
                      {order.poNumber || "N/A"}
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <div className="flex items-start gap-2.5">
                        <Avatar className="h-5 w-5 bg-green-100">
                          <AvatarFallback className="text-[10px] text-green-700">
                            {assignedToName !== "Unassigned" ? assignedToName
                              .split(" ")
                              .map((part) => part[0])
                              .join("") : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs text-slate-700">
                            {assignedToName}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {assignedCount}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-0 rounded-full text-[11px] font-medium px-2.5 py-0.5">
                        {order.status || "Pending"}
                      </Badge>
                    </TableCell>

                    {/* <TableCell className="px-3 py-3 text-sm font-semibold text-slate-900">
                      ${quoteValue.toLocaleString()}
                    </TableCell> */}

                    <TableCell className="px-3 py-3 text-sm font-semibold text-slate-900">
                      ${(order.invoiceAmount || order.invoicePayment?.amount || order.invoiceId?.totalAmount || 0).toLocaleString()}
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <Badge className={`border-0 rounded-full text-[11px] font-medium px-3 py-0.5 ${
                        paymentStatus.toLowerCase() === "paid" 
                          ? "bg-green-100 text-green-700 hover:bg-green-100" 
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                      }`}>
                        {paymentStatus}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          aria-label={`View ${leadName}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/leads/purchase-orders/${order._id}`);
                          }}
                          className="text-purple-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {order.status === "approved" && !order.assignedTo && paymentStatus.toLowerCase() === "paid" ? (
                          <Button
                            type="button"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveOrderId(order._id);
                              setAssignPlantDialogOpen(true);
                            }}
                          >
                            Assign Plant
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            disabled={
                              (updateStatusMutation.isPending && activeOrderId === order._id) ||
                              order.status === "approved" ||
                              order.status === "rejected" ||
                              paymentStatus.toLowerCase() !== "paid"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprovePO(order._id);
                            }}
                            title={paymentStatus.toLowerCase() !== "paid" ? "Lead must be paid to approve" : ""}
                          >
                            {updateStatusMutation.isPending && activeOrderId === order._id ? "Approving..." : order.status === "approved" ? "Approved PO" : "Approve PO"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AssignPoPlantDialog
        open={assignPlantDialogOpen}
        onOpenChange={(open) => {
          setAssignPlantDialogOpen(open);
          if (!open) {
            setActiveOrderId(null);
          }
        }}
        poOrderId={activeOrderId}
      />
    </div>
  );
}
