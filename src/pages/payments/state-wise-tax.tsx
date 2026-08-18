import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  RefreshCcw,
  DollarSign,
  ShoppingBag,
  Handbag,
  Hourglass,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import TaxDetailsSheet from "@/components/payments/tax-details-sheet";
import StatCardV2 from "@/components/ui/stat-card-v2";
import DateRangeFilter from "@/components/ui/date-range-filter";
import UpcomingFilingDeadlines from "@/components/payments/upcoming-filing-deadlines";

const filingData = [
  {
    state: "Texas",
    stateImg: "/placeholder-texas.png", // we'll use a badge for now
    stateColor: "bg-blue-900",
    rate: "8.25% Sales Tax",
    taxCollected: "$4,50,000",
    taxableSales: "$4,50,000",
    paidFiled: "$4,50,000",
    payable: "$4,50,000",
    payableColor: "text-red-500",
    dueDate: "14/01/2024",
    status: "Payment Due",
  },
  {
    state: "Californian", // Typo in image, but we'll try to follow exactly
    stateImg: "/placeholder-cali.png",
    stateColor: "bg-orange-500",
    rate: "8.25% Sales Tax",
    taxCollected: "$3,15,000",
    taxableSales: "$3,15,000",
    paidFiled: "$3,15,000",
    payable: "$3,15,000",
    payableColor: "text-red-500",
    dueDate: "21/01/2024",
    status: "Payment Due",
  },
  {
    state: "New York",
    stateColor: "bg-blue-700",
    rate: "8.25% Sales Tax",
    taxCollected: "$8,40,000",
    taxableSales: "$8,40,000",
    paidFiled: "$8,40,000",
    payable: "$8,40,000",
    payableColor: "text-emerald-500",
    dueDate: "20/02/2024",
    status: "Filed",
  },
  {
    state: "Arizona",
    stateColor: "bg-yellow-500",
    rate: "8.25% Sales Tax",
    taxCollected: "$6,10,000",
    taxableSales: "$6,10,000",
    paidFiled: "$6,10,000",
    payable: "$6,10,000",
    payableColor: "text-emerald-500",
    dueDate: "15/03/2024",
    status: "Filed",
  },
  {
    state: "Nevada",
    stateColor: "bg-blue-800",
    rate: "8.25% Sales Tax",
    taxCollected: "$6,10,000",
    taxableSales: "$6,10,000",
    paidFiled: "$6,10,000",
    payable: "$6,10,000",
    payableColor: "text-emerald-500",
    dueDate: "12/04/2024",
    status: "No Due",
  },
];

const filingDeadlines = [
  {
    title: "Texas",
    subtitle: "Monthly Return",
    detail: "32 days left",
    date: "29 MAY 2026",
  },
  {
    title: "California",
    subtitle: "Monthly Return",
    detail: "32 days left",
    date: "29 MAY 2026",
  },
  {
    title: "Texas",
    subtitle: "Monthly Return",
    detail: "32 days left",
    date: "29 MAY 2026",
  },
  {
    title: "California",
    subtitle: "Monthly Return",
    detail: "32 days left",
    date: "29 MAY 2026",
  },
  {
    title: "Florida",
    subtitle: "Monthly Return",
    detail: "32 days left",
    date: "29 MAY 2026",
  },
  {
    title: "Never Miss A Deadline",
    subtitle: "Never miss notification",
    cta: "Manage Notifications",
  },
];

const GrowthText = ({ value }: { value: string }) => (
  <span className="flex items-center text-emerald-500 font-medium">
    <TrendingUp className="w-3 h-3 mr-1" />
    {value}{" "}
    <span className="text-gray-400 font-normal ml-1">from last month</span>
  </span>
);

export default function StateWiseTax() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<{
    state: string;
    status: string;
  } | null>(null);

  const handleOpenSheet = (state: string, status: string) => {
    setSelectedState({ state, status });
    setIsSheetOpen(true);
  };

  // const handleCloseSheet = () => {
  //   setIsSheetOpen(false);
  //   setSelectedState(null);
  // };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Payment Due":
        return (
          <Badge className="bg-orange-400 hover:bg-orange-500 text-white font-normal rounded-sm">
            Payment Due
          </Badge>
        );
      case "Filed":
        return (
          <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white font-normal rounded-sm px-3">
            Filed
          </Badge>
        );
      case "No Due":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-normal rounded-sm">
            No Due
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#1e1b4b]">State wise Tax</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review file and pay sales tax by state, all payments are processed
            securely through our integrated tax provider.
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-white text-gray-700 border-gray-200"
        >
          <Upload className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters and Sync */}
      <Card className="p-4 flex flex-col md:flex-row md:items-end justify-between gap-4 border-none shadow-sm">
        <div className="flex gap-4">
          <div className="space-y-1.5 w-60">
            <label className="text-sm font-medium text-gray-700">Project</label>
            <Select defaultValue="all">
              <SelectTrigger className="bg-white w-full">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 w-70">
            <label className="text-sm font-medium text-gray-700">
              Date Range
            </label>
            <DateRangeFilter />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            Last Synced: May 19, 2025 10:30{" "}
            <span className="text-emerald-500">Synced</span>
          </div>
          <Button
            variant="outline"
            className="bg-white border-gray-200 text-gray-700"
          >
            Sync Now
            <RefreshCcw className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCardV2
          title="Total Tax Collected"
          value="$1,245,600.00"
          subtitle={<GrowthText value="5.62%" />}
          icon={
            <div className="flex items-center justify-center p-1.5 rounded-md border border-purple-200 text-purple-600">
              <DollarSign className="w-4 h-4" />
            </div>
          }
          color="purple"
        />
        <StatCardV2
          title="Tota Paid"
          value="$1,500,000"
          subtitle={<GrowthText value="11.4%" />}
          icon={
            <div className="flex items-center justify-center p-1.5 rounded-md border border-emerald-200 text-emerald-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          }
          color="green"
        />
        <StatCardV2
          title="Total Payble"
          value="$2,200,000"
          subtitle={<GrowthText value="8.52%" />}
          icon={
            <div className="flex items-center justify-center p-1.5 rounded-md border border-amber-200 text-yellow-600">
              <Handbag className="w-4 h-4" />
            </div>
          }
          color="yellow"
        />
        <StatCardV2
          title="Pending Filing"
          value={<span className="text-xl font-bold">2 States</span>}
          subtitle={
            <span className="text-gray-500 text-sm">Requires Filing</span>
          }
          icon={
            <div className="flex items-center justify-center p-1.5 rounded-md border border-rose-200 text-red-500">
              <Hourglass className="w-4 h-4" />
            </div>
          }
          color="red"
        />
        <StatCardV2
          title="Next Filing Due"
          value={<span className="text-xl font-bold">Jan 20, 2025</span>}
          subtitle={
            <span className="text-emerald-500 text-sm flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Texas
            </span>
          }
          icon={
            <div className="flex items-center justify-center p-1.5 rounded-md border border-purple-200 text-purple-600">
              <Clock className="w-4 h-4" />
            </div>
          }
          color="purple"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900 text-lg">
            Sate wise tax overview
          </h3>
        </div>
        <Table>
          <TableHeader className="bg-[#f8fafc]">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="font-semibold text-gray-900 h-11">
                State
              </TableHead>
              <TableHead className="font-semibold text-gray-900 h-11">
                Tax Collected
              </TableHead>
              <TableHead className="font-semibold text-gray-900 h-11">
                Taxable Sales
              </TableHead>
              <TableHead className="font-semibold text-gray-900 h-11">
                Paid/Filed
              </TableHead>
              <TableHead className="font-semibold text-gray-900 h-11">
                Payble
              </TableHead>
              <TableHead className="font-semibold text-gray-900 h-11">
                Due Date ▾
              </TableHead>
              <TableHead className="font-semibold text-gray-900 h-11">
                Status
              </TableHead>
              <TableHead className="font-semibold text-gray-900 h-11">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filingData.map((row, idx) => (
              <TableRow
                key={idx}
                className="border-b last:border-none hover:bg-gray-50/50"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${row.stateColor}`}
                    >
                      <span className="text-xs font-bold">
                        {row.state.charAt(0)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {row.state}
                      </span>
                      <span className="text-xs text-gray-500">{row.rate}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-gray-500">
                  {row.taxCollected}
                </TableCell>
                <TableCell className="py-4 text-gray-500">
                  {row.taxableSales}
                </TableCell>
                <TableCell className="py-4 text-gray-500">
                  {row.paidFiled}
                </TableCell>
                <TableCell className={`py-4 font-medium ${row.payableColor}`}>
                  {row.payable}
                </TableCell>
                <TableCell className="py-4 text-gray-500">
                  {row.dueDate}
                </TableCell>
                <TableCell className="py-4">
                  {getStatusBadge(row.status)}
                </TableCell>
                <TableCell className="py-4">
                  {row.status === "Payment Due" ? (
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-medium px-6"
                      onClick={() => handleOpenSheet(row.state, row.status)}
                    >
                      Pay Tax
                    </Button>
                  ) : (
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800 px-2 cursor-pointer">
                      View Details
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex items-center text-sm text-gray-500">
            Showing
            <Select defaultValue="10">
              <SelectTrigger className="h-8 w-15 mx-2 bg-white">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            Results
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-gray-400 rounded-md border-gray-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 border-blue-600 text-blue-600 font-medium p-0 rounded-md"
            >
              1
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 text-gray-600 border-none p-0 rounded-md hover:bg-gray-50"
            >
              2
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 text-gray-600 border-none p-0 rounded-md hover:bg-gray-50"
            >
              3
            </Button>
            <div className="px-2 text-gray-400">
              <MoreHorizontal className="h-4 w-4" />
            </div>
            <Button
              variant="outline"
              className="h-8 w-8 text-gray-600 border-none p-0 rounded-md hover:bg-gray-50"
            >
              15
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-gray-600 rounded-md border-gray-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <UpcomingFilingDeadlines cards={filingDeadlines} />

      {/* Controlled Tax Details Sheet */}
      {selectedState && (
        <TaxDetailsSheet
          state={selectedState.state}
          status={selectedState.status}
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
        />
      )}
    </div>
  );
}
