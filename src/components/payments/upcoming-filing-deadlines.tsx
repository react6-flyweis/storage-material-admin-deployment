import { format, isValid } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useStateWiseTaxUpcomingDeadlinesQuery } from "@/modules/payments/payments.hooks";
import type { StateWiseTaxDeadlineItem } from "@/modules/payments/payments.api";

type Deadline = {
  title: string;
  subtitle: string;
  detail?: string;
  date?: string;
  cta?: string;
};

function formatDateDisplay(dateStr?: string) {
  if (!dateStr) return "-";
  const dateObj = new Date(dateStr);
  if (!isValid(dateObj)) return dateStr;
  return format(dateObj, "dd MMM yyyy").toUpperCase();
}

export default function UpcomingFilingDeadlines({
  cards: propCards,
  limit = 5,
}: {
  cards?: Deadline[];
  limit?: number;
}) {
  const { data, isLoading, isError } = useStateWiseTaxUpcomingDeadlinesQuery({
    limit,
  });

  const apiDeadlines: StateWiseTaxDeadlineItem[] = data?.data?.deadlines || [];

  let displayCards: Deadline[] = [];

  if (apiDeadlines.length > 0) {
    displayCards = apiDeadlines.map((item) => ({
      title: item.state,
      subtitle: item.filingType || "Monthly Return",
      detail: `${item.daysLeft} days left`,
      date: formatDateDisplay(item.dueDate),
    }));

    displayCards.push({
      title: "Never Miss A Deadline",
      subtitle: "Never miss notification",
      cta: "Manage Notifications",
    });
  } else if (propCards && propCards.length > 0) {
    displayCards = propCards;
  }

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

      {isLoading && displayCards.length === 0 ? (
        <div className="p-8 flex items-center justify-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading upcoming filing deadlines...
        </div>
      ) : isError && displayCards.length === 0 ? (
        <div className="p-6 text-center text-rose-500 text-sm">
          Failed to load upcoming filing deadlines.
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayCards.map((card, index) => (
            <Card key={index} className="p-5 border border-slate-200 shadow-sm">
              <div className="flex flex-col gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">
                    {card.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
                </div>
                {card.cta ? (
                  <div className="flex items-start justify-between gap-4">
                    <Button
                      variant="ghost"
                      className="text-violet-600 hover:text-violet-700 pl-0"
                    >
                      {card.cta}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-500 font-medium text-sm">
                      <ArrowUpRight className="w-4 h-4" />
                      {card.detail}
                    </div>
                    <span className="text-sm text-slate-500">{card.date}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

