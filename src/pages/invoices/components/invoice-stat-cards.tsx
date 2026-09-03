import {
  CircleDollarSign,
  ShoppingBag,
  Wallet,
  Headset,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VendorInvoiceStats } from "@/modules/invoices/invoices.api";

interface StatCardProps {
  title: string;
  value: string;
  trend?: number;
  color: string;
  iconClass: string;
  icon: LucideIcon;
}

function StatCard({
  title,
  value,
  trend,
  color,
  iconClass,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow">
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-16 w-16"
        aria-hidden="true"
      >
        <div
          className={cn(
            "absolute bottom-0 left-0 size-13 [clip-path:polygon(0_14%,0_100%,100%_100%,44%_64%,16%_22%)]",
            color,
          )}
        />
      </div>

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-600 text-sm mb-2">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${iconClass} p-3 rounded-full`}>
          <Icon className="" />
        </div>
      </div>

      {typeof trend === "number" && (
        <div className="flex items-center gap-1 text-teal-600 text-sm">
          <TrendingUp className="w-4 h-4" />
          <span className="font-semibold">{trend.toFixed(2)}%</span>
          <span className="text-gray-600">from last month</span>
        </div>
      )}
    </div>
  );
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString()}`;
}

export type InvoiceStatCardsProps = {
  stats?: VendorInvoiceStats;
};

export function InvoiceStatCards({ stats }: InvoiceStatCardsProps) {
  const totalIncome = stats?.totalIncome ?? 0;
  const productSales = stats?.productSales ?? 0;
  const serviceRevenue = stats?.serviceRevenue ?? 0;
  const otherIncome = stats?.otherIncome ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Income"
        value={formatCurrency(totalIncome)}
        color="bg-purple-500"
        iconClass="text-purple-500 border border-purple-500 bg-purple-100"
        // trend={stats?.trends?.totalIncome}
        icon={CircleDollarSign}
      />
      <StatCard
        title="Product Sales"
        value={formatCurrency(productSales)}
        color="bg-green-500"
        iconClass="text-green-500 border border-green-500 bg-green-100"
        // trend={stats?.trends?.productSales}
        icon={ShoppingBag}
      />
      <StatCard
        title="Service Revenue"
        value={formatCurrency(serviceRevenue)}
        color="bg-yellow-500"
        iconClass="text-yellow-500 border border-yellow-500 bg-yellow-100"
        // trend={stats?.trends?.serviceRevenue}
        icon={Wallet}
      />
      <StatCard
        title="Other Income"
        value={formatCurrency(otherIncome)}
        color="bg-red-500"
        iconClass="text-red-500 border border-red-500 bg-red-100"
        // trend={stats?.trends?.otherIncome}
        icon={Headset}
      />
    </div>
  );
}
