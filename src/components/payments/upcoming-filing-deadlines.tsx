import { format, isValid } from "date-fns";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useStateWiseTaxUpcomingDeadlinesQuery } from "@/modules/payments/payments.hooks";
import type { StateWiseTaxDeadlineItem } from "@/modules/payments/payments.api";

function formatDateDisplay(dateStr?: string) {
  if (!dateStr) return "-";
  const dateObj = new Date(dateStr);
  if (!isValid(dateObj)) return dateStr;
  return format(dateObj, "dd MMM yyyy").toUpperCase();
}

interface UpcomingFilingDeadlinesProps {
  projectId?: string;
  scope?: "state" | "project";
  limit?: number;
  onSelectDeadline?: (deadline: StateWiseTaxDeadlineItem) => void;
}

export default function UpcomingFilingDeadlines({
  projectId,
  scope = "state",
  limit = 6,
  onSelectDeadline,
}: UpcomingFilingDeadlinesProps) {
  const { data, isLoading, isError } = useStateWiseTaxUpcomingDeadlinesQuery({
    limit,
    projectId,
    scope,
  });

  const deadlines: StateWiseTaxDeadlineItem[] = data?.data?.deadlines || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">
          Upcoming Filing Deadlines
        </h3>
        {isLoading && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading deadlines...
          </span>
        )}
      </div>

      {isLoading && deadlines.length === 0 ? (
        <div className="p-8 flex items-center justify-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading upcoming filing deadlines...
        </div>
      ) : isError ? (
        <div className="p-6 text-center text-rose-500 text-sm">
          Failed to load upcoming filing deadlines.
        </div>
      ) : deadlines.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          No upcoming filing deadlines found.
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {deadlines.map((item, index) => {
            const title = item.projectName
              ? `${item.projectName} (${item.state})`
              : item.state || "Tax Filing";
            const subtitle = item.filingType || "Monthly Return";
            const daysLeftText =
              item.daysUntilDueLabel ||
              (item.daysLeft !== undefined
                ? `${item.daysLeft} days left`
                : item.daysUntilDue !== undefined
                ? `${item.daysUntilDue} days left`
                : "Upcoming");
            const dateDisplay = formatDateDisplay(item.dueDate);

            return (
              <Card
                key={item.taxRecordId || item._id || index}
                className={`p-5 border border-slate-200 shadow-sm transition-all ${
                  onSelectDeadline
                    ? "cursor-pointer hover:border-blue-500 hover:shadow-md"
                    : ""
                }`}
                onClick={() => onSelectDeadline?.(item)}
              >
                <div className="flex flex-col gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">
                      {title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-500 font-medium text-sm">
                      <ArrowUpRight className="w-4 h-4" />
                      {daysLeftText}
                    </div>
                    <span className="text-sm text-slate-500">{dateDisplay}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
