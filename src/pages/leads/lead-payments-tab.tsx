import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getInvoiceStatsProvider } from "@/modules/invoices/invoices.api";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";

export default function LeadPaymentsTab({ leadId, invoices }: { leadId: string, invoices: any[] }) {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["invoice", "stats", leadId],
    queryFn: () => getInvoiceStatsProvider({ leadId }),
    enabled: !!leadId,
  });

  const stats = statsData?.data || { totalAmount: 0, totalPaid: 0, totalUnpaid: 0, overdue: 0 };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const totalAmount = stats.totalAmount ?? stats.totalPaymentsReceived ?? 0;
  const totalPaid = stats.totalPaid ?? stats.paymentCompletion ?? 0; // The API returned totalPaid so using that first
  const outstandingBalance = stats.totalUnpaid ?? stats.pendingAmount ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Financial Summary */}
      <div className="bg-[#f4f8fb] rounded-xl p-6">
        <h3 className="text-base font-bold text-gray-900 mb-6">Financial Summary</h3>
        <div className="flex flex-col md:flex-row justify-between gap-6 pr-12">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Total Payment</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Total Paid</p>
            <p className="text-xl font-bold text-[#16a34a]">{formatCurrency(totalPaid)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Outstanding Balance</p>
            <p className="text-xl font-bold text-[#dc2626]">{formatCurrency(outstandingBalance)}</p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-4 px-1">Payment History</h3>
        <div className="bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8fafc] text-gray-600 text-xs font-bold border-b border-t border-gray-100 uppercase">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">INVOICE #</th>
                  <th className="px-6 py-4 whitespace-nowrap">DATE</th>
                  <th className="px-6 py-4 whitespace-nowrap">AMOUNT</th>
                  <th className="px-6 py-4 whitespace-nowrap">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices && invoices.length > 0 ? (
                  invoices.map((invoice: any) => (
                    <tr key={invoice._id || invoice.invoiceNumber} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-gray-900">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 text-gray-500">{dayjs(invoice.date || invoice.createdAt).format("MMM DD, YYYY")}</td>
                      <td className="px-6 py-4 text-gray-900 font-bold">{formatCurrency(invoice.totalAmount || invoice.amount)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Badge className={invoice.status?.toLowerCase() === 'paid' ? "bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7] border-none px-2 py-0.5 rounded text-[11px] font-bold capitalize tracking-wider" : "bg-amber-100 text-amber-800 hover:bg-amber-100 border-none px-2 py-0.5 rounded text-[11px] font-bold capitalize tracking-wider"}>
                            {invoice.status}
                          </Badge>
                          {invoice.status?.toLowerCase() === 'paid' && invoice.paidAt && (
                            <span className="text-xs text-gray-900 font-medium">
                              {dayjs(invoice.paidAt).format("MMM DD, YYYY, h:mm A")}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No payment history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
