import PaymentStatusDistribution from "@/components/payments/payment-status-distribution";
import RevenueTrend from "@/components/payments/revenue-trend";
import PaymentAgingAnalysis from "@/components/payments/payment-aging-analysis";
import StageWisePaymentProgress from "@/components/payments/stage-wise-payment-progress";
import RecentPaymentsTable from "@/components/payments/recent-payments-table";
import StatCardV2 from "@/components/ui/stat-card-v2";
import {
  DollarSign,
  ShoppingBag,
  Hourglass,
  Handbag,
  CircleDollarSign,
  Upload,
} from "lucide-react";
import DateRangeFilter from "@/components/ui/date-range-filter";
import { Button } from "@/components/ui/button";
// import AIRevenueForecasting from "@/components/payments/ai-revenue-forecasting";
// import CustomerTaxTable from "@/components/payments/customer-tax-table";

export default function PaymentsPage() {
  return (
    <div className="lg:pr-5 lg:pt-5 p-5 lg:p-0 space-y-5">
      {/* Header */}

      <div className="flex justify-between">
        <div className="">
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">
            Track all payments, outstanding, and revenue trends in one place
          </p>
        </div>
        {/* Action buttons (date range filter and export ) */}
        <div className="flex items-center space-x-3">
          <DateRangeFilter className="bg-white" />
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCardV2
          title="Total Payments"
          value="$12,500,000"
          subtitle="vs Apr 2025"
          icon={<DollarSign className="w-5 h-5" />}
          color="purple"
        />
        <StatCardV2
          title="Total Received"
          value="$8,950,000"
          subtitle="vs Apr 2025"
          icon={<ShoppingBag className="w-5 h-5" />}
          color="green"
        />
        <StatCardV2
          title="Total Outstanding"
          value="$3,550,000"
          subtitle="vs Apr 2025"
          icon={<Handbag className="w-5 h-5" />}
          color="yellow"
        />
        <StatCardV2
          title="Total Overdue"
          value="$2,750,000"
          subtitle="vs Apr 2025"
          icon={<Hourglass className="w-5 h-5" />}
          color="red"
        />
        <StatCardV2
          title="Total Overdue (YTD)"
          value="22.0%"
          subtitle="vs Apr 2025"
          icon={<CircleDollarSign className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* First Row - 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PaymentStatusDistribution />
        <RevenueTrend />
        <PaymentAgingAnalysis />
      </div>

      {/* Second Row - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StageWisePaymentProgress />

        {/* Recent payments table */}
        <div className="lg:col-span-2">
          <RecentPaymentsTable />
        </div>
        {/* <AIRevenueForecasting /> */}
      </div>

      {/* Smart Notifications & Insights */}
      {/* <div className="mt-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">
          Smart Notifications & Insights
        </h2>

        <div className="space-y-2">
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <div className="text-sm text-red-700">
              2 payments are overdue ($45,000 total).
            </div>
            <Link
              to="/leads/1/chats"
              className="text-sm font-medium text-red-600 border border-red-200 px-3 py-1 rounded-md hover:bg-red-50"
            >
              Send Reminder
            </Link>
          </div>

          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <div className="text-sm text-blue-700">
              Upcoming payment on 26 Oct - John Doe ($20,000).
            </div>
            <Link
              to="/leads/1/chats"
              className="text-sm font-medium text-blue-600 border border-blue-200 px-3 py-1 rounded-md hover:bg-blue-50"
            >
              Send Reminder
            </Link>
          </div>

          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <div className="text-sm text-green-700">
              Average payment cycle improved by 3 days this month.
            </div>
          </div>
        </div>
      </div> */}

      {/* Customer table - Default tax profile per customer */}
      {/* <CustomerTaxTable /> */}
    </div>
  );
}
