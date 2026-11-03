import { User } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../ui/button";

import EmptyState from "@/components/ui/empty-state";
import { FileSpreadsheet } from "lucide-react";

export interface InvoiceItem {
  name: string;
  description: string;
  amount: string;
  contract: string;
}

export default function TotalInvoicesGenerated({
  invoices = [],
  totalCount = 0,
}: {
  period?: "Today" | "Week" | "Month";
  invoices?: InvoiceItem[];
  totalCount?: number;
}) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Total invoices generated
        </h3>
        <span className="text-2xl font-bold text-gray-900">{totalCount}</span>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices generated"
          description="No invoices generated for this timeframe."
          icon={FileSpreadsheet}
        />
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-full">
                <User className="size-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{invoice.name}</p>
                <p className="text-sm text-gray-600">{invoice.description}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600">{invoice.amount}</p>
                <p className="text-xs text-gray-600">{invoice.contract}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-center mt-5">
        <Link to="/invoice/list">
          <Button variant="link" size="sm">
            View All
          </Button>
        </Link>
      </div>
    </div>
  );
}
