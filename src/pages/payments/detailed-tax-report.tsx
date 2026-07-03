import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowLeft, Search } from "lucide-react";

interface Row {
  date: string;
  customer: string;
  buildingType: string;
  jobId: string;
  state: string;
  city: string;
  zip: string;
  rate: string;
  amount: number;
  taxDue: number;
}

const rows: Row[] = [
  {
    date: "2024-01-15",
    customer: "Johnson Steel Works",
    buildingType: "PEMB",
    jobId: "2564",
    state: "TX",
    city: "Houston",
    zip: "55645",
    rate: "8.25%",
    amount: 45000,
    taxDue: 3712.5,
  },
  {
    date: "2024-01-18",
    customer: "Midwest Storage Solutions",
    buildingType: "Storage",
    jobId: "2564",
    state: "TX",
    city: "Des Moines",
    zip: "55645",
    rate: "6%",
    amount: 32000,
    taxDue: 1920,
  },
  {
    date: "2024-01-22",
    customer: "Louisiana Barn Co",
    buildingType: "Shed",
    jobId: "2564",
    state: "TX",
    city: "Baton Rouge",
    zip: "55645",
    rate: "9.45%",
    amount: 28500,
    taxDue: 2693.25,
  },
  {
    date: "2024-01-25",
    customer: "Commercial Properties LLC",
    buildingType: "Commercial",
    jobId: "2564",
    state: "TX",
    city: "Dallas",
    zip: "55645",
    rate: "8.25%",
    amount: 67000,
    taxDue: 5527.5,
  },
  {
    date: "2024-01-28",
    customer: "Nebraska Farm Buildings",
    buildingType: "PEMB",
    jobId: "2564",
    state: "TX",
    city: "Omaha",
    zip: "55645",
    rate: "5.5%",
    amount: 38000,
    taxDue: 2090,
  },
  {
    date: "2024-01-30",
    customer: "Oklahoma Steel Structures",
    buildingType: "Storage",
    jobId: "2564",
    state: "TX",
    city: "Oklahoma City",
    zip: "55645",
    rate: "4.5%",
    amount: 41000,
    taxDue: 1845,
  },
];

export default function DetailedTaxReportPage() {
  const navigate = useNavigate();
  const [reportPeriod, setReportPeriod] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [reportType, setReportType] = useState("Monthly Summary");
  const [searchQuery, setSearchQuery] = useState("");
  const parseDateLoose = (s: string) => {
    if (!s) return null;
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
    const parts = s.split("/").map((p) => Number(p));
    if (parts.length === 3) {
      const [m, day, y] = parts;
      const dd = new Date(y, m - 1, day);
      if (!isNaN(dd.getTime())) return dd;
    }
    return null;
  };

  const parseRange = (s: string) => {
    if (!s) return null;
    const parts = s.split("-").map((p) => p.trim());
    if (parts.length === 2) {
      const from = parseDateLoose(parts[0]);
      const to = parseDateLoose(parts[1]);
      if (from && to) return { from, to };
    }
    const single = parseDateLoose(s.trim());
    if (single) return { from: single, to: single };
    return null;
  };

  const range = parseRange(reportPeriod);

  const filteredRows = rows.filter((row) => {
    // search filter (customer, city, jobId)
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const matchesSearch =
        row.customer.toLowerCase().includes(q) ||
        row.city.toLowerCase().includes(q) ||
        row.jobId.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // state filter: allow abbreviation (TX) or city/name matches
    const sf = stateFilter.trim().toLowerCase();
    if (sf) {
      if (sf.length <= 2) {
        if (row.state.toLowerCase() !== sf) return false;
      } else {
        const match =
          row.city.toLowerCase().includes(sf) ||
          row.customer.toLowerCase().includes(sf) ||
          row.state.toLowerCase().includes(sf);
        if (!match) return false;
      }
    }

    // date range filter
    if (range) {
      const d = new Date(row.date);
      if (range.from && d < range.from) return false;
      if (range.to && d > range.to) return false;
    }

    // reportType is currently not used for filtering; placeholder for future logic
    return true;
  });

  const totals = filteredRows.reduce(
    (acc, r) => {
      acc.amount += r.amount;
      acc.tax += r.taxDue;
      return acc;
    },
    { amount: 0, tax: 0 }
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/payments')} className="">
            <ArrowLeft className="h-5 w-5" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Tax Report</h1>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded">
        <CardContent className="">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Report Period
              </label>
              <Input
                type="text"
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                State Filter
              </label>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Houston">Houston</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="LA">Louisiana</SelectItem>
                  <SelectItem value="OK">Oklahoma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Report Type
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly Summary">
                    Monthly Summary
                  </SelectItem>
                  <SelectItem value="Quarterly Summary">
                    Quarterly Summary
                  </SelectItem>
                  <SelectItem value="Annual Summary">Annual Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded">
        <CardHeader className="border-b sr-only py-0">
          <CardTitle className="sr-only">Detailed Tax Report</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Contract Date</TableHead>
                  <TableHead className="font-semibold">Customer Name</TableHead>
                  <TableHead className="font-semibold">Building Type</TableHead>
                  <TableHead className="font-semibold">Cost. Job ID</TableHead>
                  <TableHead className="font-semibold">State</TableHead>
                  <TableHead className="font-semibold">City</TableHead>
                  <TableHead className="font-semibold">Zip</TableHead>
                  <TableHead className="font-semibold">Tax Rate</TableHead>
                  <TableHead className="font-semibold text-right">
                    Contract Amount
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Tax Due
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((r, idx) => (
                  <TableRow key={`${r.jobId}-${idx}`}>
                    <TableCell>
                      {new Date(r.date).toLocaleDateString("en-US")}
                    </TableCell>
                    <TableCell className="font-medium">{r.customer}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          r.buildingType === "PEMB" &&
                            "bg-blue-50 text-blue-700",
                          r.buildingType === "Storage" &&
                            "bg-purple-50 text-purple-700",
                          r.buildingType === "Shed" &&
                            "bg-green-50 text-green-700",
                          r.buildingType === "Commercial" &&
                            "bg-orange-50 text-orange-700"
                        )}
                      >
                        {r.buildingType}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">{r.jobId}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-700">
                        {r.state}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">{r.city}</TableCell>
                    <TableCell className="text-gray-600">{r.zip}</TableCell>
                    <TableCell className="font-medium">{r.rate}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${r.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      ${r.taxDue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Totals Row */}
                <TableRow className="bg-gray-50 border-t-2 font-semibold">
                  <TableCell colSpan={8} className="text-left">
                    TOTALS:
                  </TableCell>
                  <TableCell className="text-right">
                    ${totals.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    $
                    {totals.tax.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
