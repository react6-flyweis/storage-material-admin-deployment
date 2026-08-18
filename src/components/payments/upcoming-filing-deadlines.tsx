import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

type Deadline = {
  title: string;
  subtitle: string;
  detail?: string;
  date?: string;
  cta?: string;
};

export default function UpcomingFilingDeadlines({
  cards,
}: {
  cards: Deadline[];
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 text-lg">
          Upcoming Filing Deadlines
        </h3>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card, index) => (
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
    </div>
  );
}
