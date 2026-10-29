import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { TrendingUp } from "lucide-react";
import EmptyState from "@/components/ui/empty-state";
import { FileCheck } from "lucide-react";

export interface TaxFiling {
  id: string;
  company: string;
  date: string;
  state: string;
  taxAmount: string;
  contractValue: string;
}

export default function SalesTaxFiling({
  filings = [],
}: {
  filings?: TaxFiling[];
}) {
  const taxFilings = filings;
  const navigate = useNavigate();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b flex flex-row items-center justify-between">
        <CardTitle>Sales Tax Filing</CardTitle>
        <Button
          variant="link"
          size="sm"
          onClick={() => navigate("/payments/sales-tax-filing")}
        >
          View All
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 pt-6 flex-1 flex flex-col justify-start">
        {taxFilings.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <EmptyState
              title="No tax filings"
              description="No recent sales tax filing records found."
              icon={FileCheck}
            />
          </div>
        ) : (
          taxFilings.map((filing) => (
            <div
              key={filing.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {filing.company}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {filing.date} • {filing.state}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-bold text-red-500">
                  {filing.taxAmount}
                </p>
                <p className="text-xs text-gray-400">{filing.contractValue}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
