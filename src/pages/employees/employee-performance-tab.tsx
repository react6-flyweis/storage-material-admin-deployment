import StatCard from "@/components/ui/stat-card";
import {
  Users,
  CheckSquare,
  Smile,
  DollarSign,
  FileText,
  AlertTriangle,
  Percent,
  // HandPlatter,
  // ReceiptText,
  // FolderKanban,
  // Upload,
  // ClipboardList,
  // CircleSlash,
  // CheckCircle2,
} from "lucide-react";
import type { AdminEmployeeProfileStats } from "@/modules/employees/employees.api";

type PerformanceTabProps = {
  stats?: AdminEmployeeProfileStats;
};

const formatCurrency = (amount?: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

export function EmployeePerformanceTab({ stats }: PerformanceTabProps) {
  // const projectStats = [
  //   {
  //     title: "Total Projects",
  //     value: (
  //       <span className="text-3xl font-semibold">
  //         {stats?.totalProjects ?? 0}
  //       </span>
  //     ),
  //     color: "bg-blue-700",
  //     icon: <FolderKanban className="h-5 w-5 text-blue-700" />,
  //   },
  //   {
  //     title: "Deliveries Handled",
  //     value: (
  //       <span className="text-3xl font-semibold">
  //         {stats?.deliveriesHandled ?? 0}
  //       </span>
  //     ),
  //     color: "bg-yellow-500",
  //     icon: <HandPlatter className="h-5 w-5 text-yellow-500" />,
  //   },
  //   {
  //     title: "Invoices Raised",
  //     value: (
  //       <span className="text-3xl font-semibold">
  //         {stats?.invoicesRaised ?? 0}
  //       </span>
  //     ),
  //     color: "bg-green-600",
  //     icon: <ReceiptText className="h-5 w-5 text-green-600" />,
  //   },
  // ];

  // const plantStats = [
  //   {
  //     title: "Total Projects",
  //     value: <span className="text-3xl font-semibold">32</span>,
  //     color: "bg-blue-700",
  //     icon: <FolderKanban className="h-5 w-5 text-blue-700" />,
  //   },
  //   {
  //     title: "Drawings Uploaded",
  //     value: <span className="text-3xl font-semibold">28</span>,
  //     color: "bg-green-600",
  //     icon: <Upload className="h-5 w-5 text-green-600" />,
  //   },
  //   {
  //     title: "Drawing Approval Rates",
  //     value: <span className="text-3xl font-semibold">95%</span>,
  //     color: "bg-orange-400",
  //     icon: <Percent className="h-5 w-5 text-orange-400" />,
  //   },
  //   {
  //     title: "BOM Submission Pending",
  //     value: <span className="text-3xl font-semibold">12</span>,
  //     color: "bg-yellow-500",
  //     icon: <ClipboardList className="h-5 w-5 text-yellow-500" />,
  //   },
  //   {
  //     title: "BOM Submission Approved",
  //     value: <span className="text-3xl font-semibold">30</span>,
  //     color: "bg-sky-500",
  //     icon: <CheckCircle2 className="h-5 w-5 text-sky-500" />,
  //   },
  //   {
  //     title: "BOM Submission Rejected",
  //     value: <span className="text-3xl font-semibold">30</span>,
  //     color: "bg-orange-600",
  //     icon: <CircleSlash className="h-5 w-5 text-orange-600" />,
  //   },
  // ];

  const salesStats = [
    {
      title: "Leads Closed",
      value: (
        <div className="space-y-1">
          <div className="text-3xl font-semibold">
            {stats?.closedLeads ?? 0}
          </div>
          <div className="text-xs uppercase tracking-[0.2em] opacity-80">
            View →
          </div>
        </div>
      ),
      color: "bg-blue-600",
      icon: <Users className="h-5 w-5 text-blue-600" />,
    },
    {
      title: "Conversion Rate",
      value: (
        <span className="text-3xl font-semibold">
          {stats?.conversionRate ?? 0}%
        </span>
      ),
      color: "bg-yellow-400",
      icon: <Percent className="h-5 w-5 text-yellow-400" />,
    },
    {
      title: "Follow-ups Completed",
      value: (
        <span className="text-3xl font-semibold">
          {stats?.followUpsCompleted ?? 0}%
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
            {formatCurrency(stats?.revenueGenerated)}
          </div>
          <div className="text-xs opacity-80">This Year</div>
        </div>
      ),
      color: "bg-rose-400",
      icon: <DollarSign className="h-5 w-5 text-rose-400" />,
    },
    {
      title: "Quotes Created",
      value: <span className="text-3xl font-semibold">45</span>,
      color: "bg-sky-400",
      icon: <FileText className="h-5 w-5 text-sky-400" />,
    },
    {
      title: "Escalations Raised",
      value: <span className="text-3xl font-semibold">25</span>,
      color: "bg-orange-600",
      icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {salesStats.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            color={card.color}
            icon={card.icon}
          />
        ))}
      </div>
    </div>
  );
}
