import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { MessageSquare } from "lucide-react";
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

type PurchaseOrderRow = {
  id: string;
  leadName: string;
  quoteId: string;
  location: string;
  poNumber: string;
  assignedToName: string;
  assignedCount: string;
  status: "Purchase Order";
  quoteValue: string;
  unreadChats: number;
};

const purchaseOrders: PurchaseOrderRow[] = [
  {
    id: "po-1",
    leadName: "John Doe",
    quoteId: "Q-2025-1047",
    location: "Workshop , Texas",
    poNumber: "PO-09876",
    assignedToName: "Sarah Lee",
    assignedCount: "1 person assigned",
    status: "Purchase Order",
    quoteValue: "$12,500",
    unreadChats: 2,
  },
  {
    id: "po-2",
    leadName: "John Doe",
    quoteId: "Q-2025-1047",
    location: "Workshop , Texas",
    poNumber: "PO-09876",
    assignedToName: "Sarah Lee",
    assignedCount: "1 person assigned",
    status: "Purchase Order",
    quoteValue: "$12,500",
    unreadChats: 2,
  },
  {
    id: "po-3",
    leadName: "John Doe",
    quoteId: "Q-2025-1047",
    location: "Workshop , Texas",
    poNumber: "PO-09876",
    assignedToName: "Sarah Lee",
    assignedCount: "1 person assigned",
    status: "Purchase Order",
    quoteValue: "$12,500",
    unreadChats: 2,
  },
  {
    id: "po-4",
    leadName: "John Doe",
    quoteId: "Q-2025-1047",
    location: "Workshop , Texas",
    poNumber: "PO-09876",
    assignedToName: "Sarah Lee",
    assignedCount: "1 person assigned",
    status: "Purchase Order",
    quoteValue: "$12,500",
    unreadChats: 2,
  },
];

export default function AllPurchaseOrdersPage() {
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const allSelected = useMemo(
    () =>
      purchaseOrders.length > 0 &&
      selectedOrderIds.length === purchaseOrders.length,
    [selectedOrderIds],
  );

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(purchaseOrders.map((order) => order.id));
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
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Quote Value
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Chat
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {purchaseOrders.map((order) => {
                const selected = selectedOrderIds.includes(order.id);

                return (
                  <TableRow
                    key={order.id}
                    data-state={selected ? "selected" : undefined}
                    className="border-slate-100/80 cursor-pointer hover:bg-slate-50"
                    onClick={() =>
                      navigate(`/leads/purchase-orders/${order.id}`)
                    }
                  >
                    <TableCell className="px-4">
                      <input
                        aria-label={`Select ${order.leadName}`}
                        className="h-3.5 w-3.5 rounded border-slate-300"
                        type="checkbox"
                        checked={selected}
                        onChange={(event) =>
                          handleToggleOrder(order.id, event.target.checked)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <div>
                        <p className="text-sm text-slate-900">
                          {order.leadName}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {order.quoteId}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {order.location}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-3 text-sm text-slate-800">
                      {order.poNumber}
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <div className="flex items-start gap-2.5">
                        <Avatar className="h-5 w-5 bg-green-100">
                          <AvatarFallback className="text-[10px] text-green-700">
                            {order.assignedToName
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs text-slate-700">
                            {order.assignedToName}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {order.assignedCount}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-0 rounded-full text-[11px] font-medium px-2.5 py-0.5">
                        {order.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-3 py-3 text-sm font-semibold text-slate-900">
                      {order.quoteValue}
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700"
                        aria-label={`Open chat for ${order.leadName}`}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Chat
                        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                          {order.unreadChats}
                        </span>
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
