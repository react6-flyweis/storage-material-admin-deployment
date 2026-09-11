import { Link } from "react-router";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { RecentPaymentItem } from "@/modules/payments/payments.api";

interface RecentPaymentsTableProps {
  data?: RecentPaymentItem[];
  isLoading?: boolean;
}

type FormattedPayment = {
  id: string;
  date: string;
  time: string;
  client: string;
  clientType: string;
  invoice: string;
  amount: string;
  received: string;
  paymentMode: string;
  status: string;
};

const DEFAULT_PAYMENTS: FormattedPayment[] = [
  {
    id: "1",
    date: "May 19, 2025",
    time: "10:30 AM",
    client: "ABC Builders inc.",
    clientType: "Vendor",
    invoice: "PR-2025-00048",
    amount: "$48,750.00",
    received: "$48,750.00",
    paymentMode: "Bank Transfer",
    status: "Paid",
  },
  {
    id: "2",
    date: "May 19, 2025",
    time: "10:30 AM",
    client: "Fast freight Logistics",
    clientType: "Shipper",
    invoice: "PR-2025-00049",
    amount: "$12,300.50",
    received: "$12,300.50",
    paymentMode: "Bank Transfer",
    status: "Partial",
  },
  {
    id: "3",
    date: "May 19, 2025",
    time: "10:30 AM",
    client: "United Rentals",
    clientType: "Vendor",
    invoice: "PR-2025-00050",
    amount: "$25,600.00",
    received: "$25,600.00",
    paymentMode: "Bank Transfer",
    status: "Paid",
  },
  {
    id: "4",
    date: "May 19, 2025",
    time: "10:30 AM",
    client: "Safety Supplies Co.",
    clientType: "Vendor",
    invoice: "PR-2025-00051",
    amount: "$3,250.75",
    received: "$3,250.75",
    paymentMode: "Bank Transfer",
    status: "Paid",
  },
];

const getStatusBadgeStyle = (status: string) => {
  const s = status.toLowerCase();
  if (s === "paid") return "bg-emerald-100 text-emerald-800";
  if (s === "partial" || s === "sent") return "bg-amber-100 text-amber-800";
  if (s === "overdue") return "bg-rose-100 text-rose-800";
  return "bg-gray-100 text-gray-800";
};

const formatCurrency = (amt?: number) => {
  if (amt === undefined || amt === null) return "$0.00";
  return `$${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return { date: "-", time: "" };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { date: dateStr, time: "" };
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
};

export default function RecentPaymentsTable({ data, isLoading }: RecentPaymentsTableProps) {
  let payments: FormattedPayment[] = DEFAULT_PAYMENTS;

  if (data && data.length > 0) {
    payments = data.map((item) => {
      const { date, time } = formatDate(item.date || item.createdAt);
      
      const clientName =
        item.customerId?.firstName || item.customerId?.lastName
          ? `${item.customerId?.firstName || ""} ${item.customerId?.lastName || ""}`.trim()
          : item.leadId?.projectName || "N/A";
          
      const projectSub = item.leadId?.projectName && clientName !== item.leadId.projectName
        ? item.leadId.projectName
        : "Customer";

      const statusCapitalized = (item.status || "Pending").charAt(0).toUpperCase() + (item.status || "Pending").slice(1);
      
      const paymentMode = item.paymentMethod
        ? item.paymentMethod.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "N/A";

      return {
        id: item._id,
        date,
        time,
        client: clientName,
        clientType: projectSub,
        invoice: item.invoiceNumber || item.poNumber || "N/A",
        amount: formatCurrency(item.totalAmount || item.subtotal),
        received: item.status?.toLowerCase() === "paid" ? formatCurrency(item.totalAmount || item.subtotal) : "$0.00",
        paymentMode,
        status: statusCapitalized,
      };
    });
  }

  return (
    <Card className="bg-[#FAFBFF] rounded-sm py-4 gap-0">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Payments
          </h3>
        </div>
        <Link
          to="/payments/payment-status"
          className="mt-3 sm:mt-0 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View all payments
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="h-48 flex items-center justify-center text-sm text-gray-500">
            Loading...
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Date
                </TableHead>
                <TableHead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Client/Project
                </TableHead>
                <TableHead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Invoice/Reference
                </TableHead>
                <TableHead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Amount
                </TableHead>
                <TableHead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Received
                </TableHead>
                <TableHead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Payment Mode
                </TableHead>
                <TableHead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </TableHead>
                <TableHead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-100">
              {payments.slice(0, 5).map((payment) => (
                <TableRow key={payment.id} className="hover:bg-gray-50">
                  <TableCell className="">
                    <div className="text-sm font-semibold text-gray-900">
                      {payment.date}
                    </div>
                    {payment.time && (
                      <div className="text-xs text-gray-500 mt-1">
                        {payment.time}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="">
                    <div className="text-sm font-semibold text-gray-900">
                      {payment.client}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {payment.clientType}
                    </div>
                  </TableCell>
                  <TableCell className="">{payment.invoice}</TableCell>
                  <TableCell className="">{payment.amount}</TableCell>
                  <TableCell className="">{payment.received}</TableCell>
                  <TableCell className="">{payment.paymentMode}</TableCell>
                  <TableCell className="">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeStyle(payment.status)}`}
                    >
                      {payment.status}
                    </span>
                  </TableCell>
                  <TableCell className="">
                    <Link
                      to={`/payments/payment-status`}
                      className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-blue-600 hover:bg-gray-50"
                    >
                      view
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

