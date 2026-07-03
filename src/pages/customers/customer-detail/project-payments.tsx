import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Hammer,
  ShieldCheck,
  CircleDollarSign,
  LineChart,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import StatCard from "@/components/ui/stat-card";
import { useGetAdminProjectInvoicesQuery } from "@/modules/invoices/invoices.hooks";
import { Loader2 } from "lucide-react";
import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import { useGetProjectInvoiceStatsQuery } from "@/modules/invoices/invoices.hooks";

export default function ProjectPayments() {
  const navigate = useNavigate();
  const { id, projectId } = useParams();
  const actualProjectId = projectId || id;

  // Fetch project details to get customerId
  const { data: leadData, isLoading: isLeadLoading } = useLeadDetailQuery(actualProjectId || "");
  const actualCustomerId = leadData?.data?.lead?.customerId || (id !== actualProjectId ? id : "");

  const { data: statsResponse, isLoading: isStatsLoading } = useGetProjectInvoiceStatsQuery(
    actualCustomerId || "",
    actualProjectId || ""
  );

  const { data: response, isLoading: isInvoicesLoading } = useGetAdminProjectInvoicesQuery(
    actualCustomerId || "",
    actualProjectId || ""
  );

  const isLoading = isLeadLoading || isInvoicesLoading || isStatsLoading;

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  console.log("response", response)
  const invoices = response?.data?.payments || [];
  const statsData = statsResponse?.data || {
    totalPaymentsReceived: 0,
    paymentCompletion: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  };

  const paymentCompletion = statsData.paymentCompletion || 0;

  const paymentStats = [
    {
      title: "Total Payments Received",
      value: `$${(statsData.totalPaymentsReceived || 0).toLocaleString()}`,
      bg: "bg-[#1D51A4]",
      icon: Hammer,
      iconColor: "text-[#1D51A4]",
    },
    {
      title: "Payment Completion",
      value: `${paymentCompletion}%`,
      bg: "bg-[#22C55E]",
      icon: ShieldCheck,
      iconColor: "text-[#22C55E]",
    },
    {
      title: "Pending Amount",
      value: `$${(statsData.pendingAmount || 0).toLocaleString()}`,
      bg: "bg-[#EAB308]",
      icon: CircleDollarSign,
      iconColor: "text-[#EAB308]",
    },
    {
      title: "Overdue Amount",
      value: `$${(statsData.overdueAmount || 0).toLocaleString()}`,
      bg: "bg-[#FB923C]",
      icon: LineChart,
      iconColor: "text-[#FB923C]",
      alert: (statsData.overdueAmount || 0) > 0,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="default"
          onClick={() => navigate('/customers')}
          className="px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-[#1E293B]">
          Project Payments
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {paymentStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={
              <div className="flex items-center gap-1.5 opacity-90">
                <div className="w-2.5 h-2.5 rounded-sm bg-white/40" />
                {stat.title}
              </div>
            }
            value={stat.value}
            color={stat.bg}
            icon={<stat.icon className={`h-5 w-5 ${stat.iconColor}`} />}
            valueClassName="text-3xl font-semibold"
          />
        ))}
      </div>

      {/* Table Section */}
      <Card className="p-6 mt-6 border-none shadow-sm bg-white">
        <h2 className="text-base font-semibold mb-6 text-slate-800">
          Invoices
        </h2>
        {invoices.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No invoices found for this project.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-400 uppercase text-xs py-4">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-slate-400 uppercase text-xs py-4">
                  Invoice Number
                </TableHead>
                <TableHead className="font-semibold text-slate-400 uppercase text-xs py-4">
                  Amount
                </TableHead>
                <TableHead className="font-semibold text-slate-400 uppercase text-xs py-4">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-slate-400 uppercase text-xs py-4">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((payment) => (
                <TableRow
                  key={payment.invoiceId}
                  className="hover:bg-slate-50/50 border-b border-slate-50"
                >
                  <TableCell className="text-slate-600 py-5">
                    {payment.date ? format(new Date(payment.date), "MMM dd, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {payment.invoiceNumber || "N/A"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    ${payment.amount?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium text-sm capitalize ${payment.status === 'paid' ? 'text-[#22C55E]' :
                          payment.status === 'overdue' ? 'text-red-500' : 'text-amber-500'
                        }`}
                    >
                      {payment.status || "Pending"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-md px-4 h-8 text-xs font-medium"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
