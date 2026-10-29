import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import EmptyState from "@/components/ui/empty-state";
import { Receipt } from "lucide-react";

export interface StateData {
  state: string;
  abbreviation: string;
  contracts: number;
  rate: string;
  sales: number;
  taxDue: number;
}

const US_STATE_MAP: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
};

function formatStateAbbr(abbr?: string, name?: string) {
  const candidate = (abbr || name || "").trim();
  if (candidate.length <= 2) return candidate.toUpperCase();
  const lower = candidate.toLowerCase();
  if (US_STATE_MAP[lower]) return US_STATE_MAP[lower];
  const nameLower = (name || "").trim().toLowerCase();
  if (US_STATE_MAP[nameLower]) return US_STATE_MAP[nameLower];
  return candidate
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatUSD(amount?: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

export default function StateTaxCard({
  data = [],
}: {
  data?: StateData[];
}) {
  const stateData = data;

  return (
    <Card className="bg-white h-full flex flex-col">
      <CardHeader className="border-b flex flex-row items-center justify-between">
        <CardTitle>Tax Due by State</CardTitle>
        <Link to="/sales-tax">
          <Button variant="link" size="sm">
            View
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-6 flex-1 flex flex-col justify-start">
        {stateData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <EmptyState
              title="No state tax records"
              description="No tax liability records available by state."
              icon={Receipt}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {stateData.map((state, idx) => {
              const abbr = formatStateAbbr(state.abbreviation, state.state);
              return (
                <div
                  key={`${state.state}-${state.abbreviation}-${idx}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                      {abbr}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {state.contracts} contract{state.contracts > 1 ? "s" : ""}
                      </div>
                      <div className="text-xs text-gray-500">
                        {state.state} ({state.rate} rate)
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-red-600">
                      {formatUSD(state.taxDue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatUSD(state.sales)} sales
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
