import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useGetProjectInvoiceStatsQuery, useGetAdminProjectInvoicesQuery, useMarkInvoicePaidMutation } from "@/modules/invoices/invoices.hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import {
  ArrowLeft,
  Search,
  Filter,
  AlertTriangle,
  DollarSign,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import Pagination from "@/components/Pagination";
import { Card } from "@/components/ui/card";
import StatCard from "@/components/ui/stat-card";

const dummy = "Remove the hardcoded array";
const invoiceStats = [
  {
    title: "Total Invoices",
    value: "6 Invoices",
    bg: "bg-[#1D51A4]",
    icon: CheckCircle2,
    iconColor: "text-[#1D51A4]",
  },
  {
    title: "Paid Amount",
    value: "$100,000",
    bg: "bg-[#22C55E]",
    icon: CheckCircle2,
    iconColor: "text-[#22C55E]",
  },
  {
    title: "Pending Amount",
    value: "$20,000",
    bg: "bg-[#EAB308]",
    icon: DollarSign,
    iconColor: "text-[#EAB308]",
  },
  {
    title: "Overdue Amount",
    value: "$8,000",
    bg: "bg-[#FB923C]",
    icon: AlertTriangle,
    iconColor: "text-[#FB923C]",
  },
];

export default function ProjectInvoicesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id, projectId } = useParams<{ id: string, projectId: string }>();
  // Use projectId if available, otherwise fallback to id (for backwards compatibility if needed)
  const leadId = projectId || id || "";

  const { data: leadData } = useLeadDetailQuery(leadId);
  const customerId = leadData?.data?.lead?.customerId?._id || leadData?.data?.lead?.customerId || id || "";

  const { data: statsData } = useGetProjectInvoiceStatsQuery(customerId, leadId);
  const stats = statsData?.data || {};

  const { data: invoicesResponse } = useGetAdminProjectInvoicesQuery(customerId, leadId);
  const invoicesData = invoicesResponse?.data?.payments || [];
  const pagination = {
    total: invoicesResponse?.data?.total || 0,
    page: 1,
    limit: 10,
  };

  const markAsPaidMutation = useMarkInvoicePaidMutation();

  const handleMarkAsPaid = async (invoiceId: string) => {
    if (!invoiceId) return;
    try {
      await markAsPaidMutation.mutateAsync(invoiceId);
      toast.success("Invoice marked as paid successfully!");
      // Invalidate queries to refresh the list and stats
      queryClient.invalidateQueries({ queryKey: ["adminProjectInvoices", customerId, leadId] });
      queryClient.invalidateQueries({ queryKey: ["projectInvoiceStats", customerId, leadId] });
    } catch (error: any) {
      console.error("Failed to mark invoice as paid", error);
      toast.error(error?.response?.data?.message || "Failed to mark invoice as paid");
    }
  };

  const calculatedTotalAmount = (stats.totalPaymentsReceived || 0) + (stats.pendingAmount || 0);

  const dynamicInvoiceStats = [
    {
      title: "Total Amount",
      value: `$${calculatedTotalAmount.toLocaleString()}`,
      bg: "bg-[#1D51A4]",
      icon: CheckCircle2,
      iconColor: "text-[#1D51A4]",
    },
    {
      title: "Paid Amount",
      value: `$${(stats.totalPaymentsReceived || 0).toLocaleString()}`,
      bg: "bg-[#22C55E]",
      icon: CheckCircle2,
      iconColor: "text-[#22C55E]",
    },
    {
      title: "Pending Amount",
      value: `$${(stats.pendingAmount || 0).toLocaleString()}`,
      bg: "bg-[#EAB308]",
      icon: DollarSign,
      iconColor: "text-[#EAB308]",
    },
    {
      title: "Overdue Amount",
      value: `$${(stats.overdueAmount || 0).toLocaleString()}`,
      bg: "bg-[#FB923C]",
      icon: AlertTriangle,
      iconColor: "text-[#FB923C]",
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
          Project {leadData?.data?.lead?.projectName ? `- ${leadData.data.lead.projectName}` : ""} Invoices
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {dynamicInvoiceStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            color={stat.bg}
            icon={<stat.icon className={`h-5 w-5 ${stat.iconColor}`} />}
            valueClassName="text-3xl font-semibold"
          />
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search"
            className="pl-9 bg-white border-slate-200"
          />
        </div>
        <Button
          variant="outline"
          className="bg-white border-slate-200 text-slate-700"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Table Section */}
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
              <TableHead className="w-12 text-center py-4">
                <Checkbox className="border-slate-300" />
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                Invoice
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                Amount
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                <div className="flex items-center gap-1">
                  Sent Date
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-400"
                  >
                    <path d="m3 16 4 4 4-4" />
                    <path d="M7 20V4" />
                    <path d="m21 8-4-4-4 4" />
                    <path d="M17 4v16" />
                  </svg>
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                <div className="flex items-center gap-1">
                  Items
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-400"
                  >
                    <path d="m3 16 4 4 4-4" />
                    <path d="M7 20V4" />
                    <path d="m21 8-4-4-4 4" />
                    <path d="M17 4v16" />
                  </svg>
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                Status
              </TableHead>
              <TableHead className="w-40"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoicesData.map((invoice: any, index: number) => {
              const status = invoice.invoiceStatus === "paid" ? "Paid" :
                invoice.invoiceStatus === "overdue" ? "Overdue" :
                  invoice.invoiceStatus === "draft" ? "Draft" : "Pending";
              return (
                <TableRow key={index} className="hover:bg-slate-50/50">
                  <TableCell className="text-center py-4">
                    <Checkbox className="border-slate-300" />
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">
                    {invoice.invoiceNumber || invoice.invoiceId || `INV-${index}`}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    ${(invoice.amount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-slate-600">{invoice.date ? new Date(invoice.date).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell className="text-slate-600">
                    {invoice.invoice?.lineItems?.length || 1}
                  </TableCell>
                  <TableCell>
                    {status === "Pending" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-[#FEF9C3] text-[#CA8A04] border border-[#FEF08A]">
                        <div className="w-2 h-2 rounded-full bg-[#EAB308]"></div>
                        Pending
                        <CheckCircle2 className="h-3 w-3 ml-1 opacity-70" />
                      </span>
                    )}
                    {status === "Draft" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                        Draft
                      </span>
                    )}
                    {status === "Paid" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                        <div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>
                        Paid
                        <CheckCircle2 className="h-3 w-3 ml-1 opacity-70" />
                      </span>
                    )}
                    {status === "Overdue" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
                        <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
                        Overdue
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ml-1 opacity-70"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {status === "Pending" && (
                      <Button
                        size="sm"
                        className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-md px-4 h-8"
                        onClick={() => handleMarkAsPaid(invoice.invoiceId || invoice._id)}
                        disabled={markAsPaidMutation.isPending}
                      >
                        {markAsPaidMutation.isPending ? "Marking..." : "Mark as Paid"}
                      </Button>
                    )}
                    {status === "Overdue" && (
                      <Button
                        size="sm"
                        className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-md px-4 h-8"
                      >
                        Follow up
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
      <div className="flex items-center justify-between  bg-white">
        <Pagination
          totalItems={pagination.total}
          currentPage={pagination.page}
          onPageChange={() => { }}
          onRowsPerPageChange={(row) => {
            console.log("Rows per page changed to:", row);
          }}
          rowsPerPage={pagination.limit}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </div>
    </div>
  );
}
