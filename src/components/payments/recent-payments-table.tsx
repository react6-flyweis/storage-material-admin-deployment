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

type Payment = {
  id: string;
  date: string;
  time: string;
  client: string;
  clientType: string;
  invoice: string;
  amount: string;
  received: string;
  paymentMode: string;
  status: "Paid" | "Partial" | "Overdue";
};

const payments: Payment[] = [
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
  {
    id: "5",
    date: "May 19, 2025",
    time: "10:30 AM",
    client: "Sunbelt Rentals",
    clientType: "Vendor",
    invoice: "PR-2025-00052",
    amount: "$18,900.00",
    received: "$18,900.00",
    paymentMode: "Bank Transfer",
    status: "Partial",
  },
  {
    id: "6",
    date: "May 19, 2025",
    time: "10:30 AM",
    client: "Elite Transport LLC",
    clientType: "Shipper",
    invoice: "PR-2025-00053",
    amount: "$7,850.00",
    received: "$7,850.00",
    paymentMode: "Bank Transfer",
    status: "Overdue",
  },
];

const statusStyles: Record<Payment["status"], string> = {
  Paid: "bg-emerald-100 text-emerald-800",
  Partial: "bg-amber-100 text-amber-800",
  Overdue: "bg-rose-100 text-rose-800",
};

export default function RecentPaymentsTable() {
  return (
    <Link to="/payments/payment-status" className="block">
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
              {payments.slice(0, 4).map((payment) => (
                <TableRow key={payment.id} className="hover:bg-gray-50">
                  <TableCell className="">
                    <div className="text-sm font-semibold text-gray-900">
                      {payment.date}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {payment.time}
                    </div>
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
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[payment.status]}`}
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
        </CardContent>
      </Card>
    </Link>
  );
}
