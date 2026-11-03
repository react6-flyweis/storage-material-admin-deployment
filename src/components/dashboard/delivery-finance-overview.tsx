import {
  BadgeDollarSign,
  BellRing,
  Box,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileText,
  Package2,
  Send,
  ShieldAlert,
  Truck,
  Users,
  WalletCards,
  TriangleAlert,
  ClipboardList,
  Route,
  BadgeX,
  Gauge,
  type LucideIcon,
} from "lucide-react";
import type {
  DeliveryFinance,
  LoadOptimization,
  DeliveryOperations,
  CommunicationStatus,
  FreightActivity,
} from "@/modules/dashboard/dashboard.types";

interface DeliveryFinanceOverviewProps {
  finance?: DeliveryFinance;
  loadOptimization?: LoadOptimization;
  operations?: DeliveryOperations;
  communication?: CommunicationStatus;
  freight?: FreightActivity;
}

function formatCurrency(amount?: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

function formatChange(changePct?: number) {
  if (changePct === undefined || changePct === 0) {
    return {
      text: "0% from last month",
      className: "text-slate-500",
    };
  }
  if (changePct > 0) {
    return {
      text: `+${changePct}% from last month`,
      className: "text-emerald-600",
    };
  }
  return {
    text: `${changePct}% from last month`,
    className: "text-rose-600",
  };
}

function MetricCard({
  title,
  value,
  change,
  changeClass,
  icon: Icon,
  iconBg,
}: {
  title: string;
  value: string;
  change: string;
  changeClass: string;
  icon: LucideIcon;
  iconBg: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
        </div>
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}
        >
          <Icon className="size-5 text-white" />
        </div>
      </div>

      <div className="mt-4 h-px w-full bg-slate-100" />

      <p className={`mt-3 text-sm ${changeClass}`}>{change}</p>
    </div>
  );
}

function DetailCard({
  title,
  items,
}: {
  title: string;
  items: Array<{
    label: string;
    value: string;
    icon: LucideIcon;
    iconBg: string;
    iconFg: string;
  }>;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2 text-slate-900">
        <ClipboardList className="size-5" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <div key={item.label} className="flex items-start gap-3">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${item.iconBg}`}
              >
                <ItemIcon className={`size-4 ${item.iconFg}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-0.5 text-base font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DeliveryFinanceOverview({
  finance,
  loadOptimization,
  operations,
  communication,
  freight,
}: DeliveryFinanceOverviewProps) {
  const topCards = [
    {
      title: "Freight Spend",
      value: formatCurrency(finance?.freightSpend),
      icon: Package2,
    },
    {
      title: "Pending Carrier Payments",
      value: formatCurrency(finance?.pendingCarrierPayments),
      icon: CreditCard,
    },
    {
      title: "Freight Savings",
      value: `${formatCurrency(finance?.freightSavings)} saved`,
      icon: CircleDollarSign,
    },
  ];

  const bundlesChange = formatChange(loadOptimization?.totalBundlesCreatedChangePct);
  const truckloadsChange = formatChange(loadOptimization?.totalTruckloadsPlannedChangePct);
  const utilizationChange = formatChange(loadOptimization?.avgLoadUtilizationChangePct);
  const savingsChange = formatChange(loadOptimization?.optimizationSavingsChangePct);

  const performanceCards = [
    {
      title: "Total Bundles Created",
      value: String(loadOptimization?.totalBundlesCreated ?? 0),
      change: bundlesChange.text,
      changeClass: bundlesChange.className,
      icon: Box,
      iconBg: "bg-violet-600",
    },
    {
      title: "Total Truckloads Planned",
      value: String(loadOptimization?.totalTruckloadsPlanned ?? 0),
      change: truckloadsChange.text,
      changeClass: truckloadsChange.className,
      icon: Truck,
      iconBg: "bg-emerald-600",
    },
    {
      title: "Avg Load Utilization %",
      value: `${loadOptimization?.avgLoadUtilizationPct ?? 0}%`,
      change: utilizationChange.text,
      changeClass: utilizationChange.className,
      icon: Gauge,
      iconBg: "bg-amber-600",
    },
    {
      title: "Optimization Savings $",
      value: formatCurrency(loadOptimization?.optimizationSavings),
      change: savingsChange.text,
      changeClass: savingsChange.className,
      icon: BadgeDollarSign,
      iconBg: "bg-red-600",
    },
  ];

  const operationsCards = [
    {
      title: "Delivery Operations",
      items: [
        {
          label: "Total Deliveries Today",
          value: String(operations?.totalDeliveriesToday ?? 0),
          icon: FileText,
          iconBg: "bg-violet-100",
          iconFg: "text-violet-600",
        },
        {
          label: "Upcoming Deliveries",
          value: String(operations?.upcomingDeliveries ?? 0),
          icon: Users,
          iconBg: "bg-emerald-100",
          iconFg: "text-emerald-600",
        },
        {
          label: "Delayed Deliveries",
          value: String(operations?.delayedDeliveries ?? 0),
          icon: TriangleAlert,
          iconBg: "bg-orange-100",
          iconFg: "text-orange-500",
        },
        {
          label: "Rescheduled Deliveries",
          value: String(operations?.rescheduledDeliveries ?? 0),
          icon: ClipboardList,
          iconBg: "bg-blue-100",
          iconFg: "text-blue-600",
        },
        {
          label: "Completed Deliveries Today",
          value: String(operations?.completedDeliveriesToday ?? 0),
          icon: CheckCircle2,
          iconBg: "bg-violet-100",
          iconFg: "text-violet-600",
        },
      ],
    },
    {
      title: "Communication Status",
      items: [
        {
          label: "Confirmations Sent",
          value: `${communication?.confirmationsSentPct ?? 0}%`,
          icon: Send,
          iconBg: "bg-violet-100",
          iconFg: "text-violet-600",
        },
        {
          label: "48hr Reminders Sent",
          value: `${communication?.reminders48hrSentPct ?? 0}%`,
          icon: BellRing,
          iconBg: "bg-emerald-100",
          iconFg: "text-emerald-600",
        },
        {
          label: "24hr Reminders Sent %",
          value: `${communication?.reminders24hrSentPct ?? 0}%`,
          icon: Clock3,
          iconBg: "bg-orange-100",
          iconFg: "text-orange-500",
        },
        {
          label: "Failed Notifications",
          value: `${communication?.failedNotificationsPct ?? 0}%`,
          icon: BadgeX,
          iconBg: "bg-blue-100",
          iconFg: "text-blue-600",
        },
      ],
    },
    {
      title: "Freight Activity",
      items: [
        {
          label: "Active Freight Requests",
          value: String(freight?.activeFreightRequests ?? 0),
          icon: Route,
          iconBg: "bg-violet-100",
          iconFg: "text-violet-600",
        },
        {
          label: "Bids Pending",
          value: String(freight?.bidsPending ?? 0),
          icon: WalletCards,
          iconBg: "bg-emerald-100",
          iconFg: "text-emerald-600",
        },
        {
          label: "Loads Awarded Today",
          value: String(freight?.loadsAwardedToday ?? 0),
          icon: BadgeDollarSign,
          iconBg: "bg-orange-100",
          iconFg: "text-orange-500",
        },
        {
          label: "Loads In Transit",
          value: String(freight?.loadsInTransit ?? 0),
          icon: Truck,
          iconBg: "bg-blue-100",
          iconFg: "text-blue-600",
        },
        {
          label: "Delayed Shipments",
          value: String(freight?.delayedShipments ?? 0),
          icon: ShieldAlert,
          iconBg: "bg-emerald-100",
          iconFg: "text-emerald-600",
        },
      ],
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Delivery Finance
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {topCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-lg border-2 border-blue-500/80 bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold text-slate-900">
          Load Optimization Performance
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {performanceCards.map((card) => (
            <MetricCard key={card.title} {...card} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {operationsCards.map((card) => (
          <DetailCard key={card.title} title={card.title} items={card.items} />
        ))}
      </div>
    </section>
  );
}
