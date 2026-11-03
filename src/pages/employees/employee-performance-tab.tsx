import StatCard from "@/components/ui/stat-card";
import {
  Users,
  CheckSquare,
  Smile,
  DollarSign,
  FileText,
  AlertTriangle,
  Percent,
  FolderKanban,
  Upload,
  ClipboardList,
  CheckCircle2,
  CircleSlash,
  Truck,
  Receipt,
  CheckCircle,
  Clock,
} from "lucide-react";
import type { EmployeePerformanceDataUnion } from "@/modules/employees/employees.api";

type PerformanceTabProps = {
  performance?: EmployeePerformanceDataUnion;
  revenuePeriod?: "all" | "year" | "month";
  onRevenuePeriodChange?: (period: "all" | "year" | "month") => void;
};

const formatCurrency = (amount?: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

export function EmployeePerformanceTab({
  performance,
}: PerformanceTabProps) {
  if (!performance) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-sm text-gray-500">
        No performance metrics available.
      </div>
    );
  }

  // 1. Sales Performance
  if (performance.kind === "sales") {
    const metrics = performance.metrics;
    const salesStats = [
      {
        title: "Leads Closed",
        value: (
          <div className="space-y-1">
            <div className="text-3xl font-semibold">
              {metrics.leadsClosed ?? 0}
            </div>
            <div className="text-xs uppercase tracking-[0.2em] opacity-80">
              View →
            </div>
          </div>
        ),
        color: "bg-blue-600",
        icon: <Users className="h-5 w-5 text-blue-600" />,
        navigateTo: "/leads",
      },
      {
        title: "Conversion Rate",
        value: (
          <span className="text-3xl font-semibold">
            {metrics.conversionRate ?? 0}%
          </span>
        ),
        color: "bg-yellow-400",
        icon: <Percent className="h-5 w-5 text-yellow-400" />,
      },
      {
        title: "Follow-ups Completed",
        value: (
          <span className="text-3xl font-semibold">
            {metrics.followUpsCompletedPercent ?? 0}%
          </span>
        ),
        color: "bg-green-500",
        icon: <CheckSquare className="h-5 w-5 text-green-500" />,
      },
      {
        title: "Customer Satisfaction",
        value: <span className="text-3xl font-semibold">4.8/5</span>,
        color: "bg-orange-400",
        icon: <Smile className="h-5 w-5 text-orange-400" />,
      },
      {
        title: "Revenue Generated",
        value: (
          <div>
            <div className="text-2xl font-semibold">
              {formatCurrency(metrics.revenueGenerated)}
            </div>
            <div className="text-xs opacity-80">
              {metrics.revenuePeriodLabel ?? "This Year"}
            </div>
          </div>
        ),
        color: "bg-rose-400",
        icon: <DollarSign className="h-5 w-5 text-rose-400" />,
      },
      {
        title: "Quotes Created",
        value: (
          <span className="text-3xl font-semibold">
            {metrics.quotesCreated ?? 45}
          </span>
        ),
        color: "bg-sky-400",
        icon: <FileText className="h-5 w-5 text-sky-400" />,
      },
      {
        title: "Escalations Raised",
        value: (
          <span className="text-3xl font-semibold">
            {metrics.escalationsRaised ?? 25}
          </span>
        ),
        color: "bg-orange-600",
        icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {salesStats.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            color={card.color}
            icon={card.icon}
            navigateTo={card.navigateTo}
          />
        ))}
      </div>
    );
  }

  // 2. Plant Performance
  if (performance.kind === "plant") {
    const metrics = performance.metrics;
    const plantStats = [
      {
        title: "Total Projects",
        value: (
          <div className="space-y-1">
            <div className="text-3xl font-semibold">
              {metrics.totalProjects ?? 32}
            </div>
            <div className="text-xs uppercase tracking-[0.2em] opacity-80">
              View Projects →
            </div>
          </div>
        ),
        color: "bg-blue-700",
        icon: <FolderKanban className="h-5 w-5 text-blue-700" />,
        navigateTo: "/plant/projects",
      },
      {
        title: "Drawings Uploaded",
        value: (
          <span className="text-3xl font-semibold">
            {metrics.drawingsUploaded ?? 28}
          </span>
        ),
        color: "bg-green-600",
        icon: <Upload className="h-5 w-5 text-green-600" />,
      },
      {
        title: "Drawing Approval Rates",
        value: (
          <span className="text-3xl font-semibold">
            {metrics.drawingApprovalRate ?? 95}%
          </span>
        ),
        color: "bg-orange-400",
        icon: <Percent className="h-5 w-5 text-orange-400" />,
      },
      {
        title: "BOM Submission Pending",
        value: (
          <span className="text-3xl font-semibold">
            {metrics.bomSubmissionPending ?? 12}
          </span>
        ),
        color: "bg-yellow-500",
        icon: <ClipboardList className="h-5 w-5 text-yellow-500" />,
      },
      {
        title: "BOM Submission Approved",
        value: (
          <span className="text-3xl font-semibold">
            {metrics.bomSubmissionApproved ?? 30}
          </span>
        ),
        color: "bg-sky-500",
        icon: <CheckCircle2 className="h-5 w-5 text-sky-500" />,
      },
      {
        title: "BOM Submission Rejected",
        value: (
          <span className="text-3xl font-semibold">
            {metrics.bomSubmissionRejected ?? 2}
          </span>
        ),
        color: "bg-orange-600",
        icon: <CircleSlash className="h-5 w-5 text-orange-600" />,
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {plantStats.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            color={card.color}
            icon={card.icon}
            navigateTo={card.navigateTo}
          />
        ))}
      </div>
    );
  }

  // 3. Construction Performance
  if (performance.kind === "construction") {
    const metrics = performance.metrics;
    const projectStats = [
      {
        title: "Total Projects",
        value: (
          <div className="space-y-1">
            <div className="text-3xl font-semibold">
              {metrics.totalDeliveries ?? 0}
            </div>
            <div className="text-xs uppercase tracking-[0.2em] opacity-80">
              View Deliveries →
            </div>
          </div>
        ),
        color: "bg-blue-700",
        icon: <FolderKanban className="h-5 w-5 text-blue-700" />,
        navigateTo: "/plant/all-deliveries",
      },
      {
        title: "Deliveries Handled",
        value: (
          <span className="text-3xl font-semibold">
            {metrics.completedDeliveries ?? metrics.totalDeliveries ?? 0}
          </span>
        ),
        color: "bg-yellow-500",
        icon: <Truck className="h-5 w-5 text-yellow-500" />,
      },
      {
        title: "Invoices Raised",
        value: (
          <span className="text-3xl font-semibold">
            0
          </span>
        ),
        color: "bg-green-600",
        icon: <Receipt className="h-5 w-5 text-green-600" />,
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {projectStats.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            color={card.color}
            icon={card.icon}
            navigateTo={card.navigateTo}
          />
        ))}
      </div>
    );
  }

  // 4. Account Performance
  if (performance.kind === "account") {
    const metrics = performance.metrics;
    const accountStats = [
      {
        title: "Invoices Raised",
        value: (
          <span className="text-3xl font-semibold">
            {metrics.totalInvoices ?? 0}
          </span>
        ),
        color: "bg-green-600",
        icon: <Receipt className="h-5 w-5 text-green-600" />,
      },
      {
        title: "Paid Invoices",
        value: (
          <span className="text-3xl font-semibold">
            {metrics.paidInvoices ?? 0}
          </span>
        ),
        color: "bg-blue-600",
        icon: <CheckCircle className="h-5 w-5 text-blue-600" />,
      },
      {
        title: "Pending Invoices",
        value: (
          <span className="text-3xl font-semibold">
            {metrics.pendingInvoices ?? 0}
          </span>
        ),
        color: "bg-yellow-500",
        icon: <Clock className="h-5 w-5 text-yellow-500" />,
      },
      {
        title: "Revenue Processed",
        value: (
          <div className="text-2xl font-semibold">
            {formatCurrency(metrics.totalRevenueProcessed ?? 0)}
          </div>
        ),
        color: "bg-rose-400",
        icon: <DollarSign className="h-5 w-5 text-rose-400" />,
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {accountStats.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            color={card.color}
            icon={card.icon}
          />
        ))}
      </div>
    );
  }

  return null;
}
