import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
} from "lucide-react";

export type PendingFilingRow = {
  state: string;
  stateColor: string;
  rate: string;
  period: string;
  periodType: string;
  dueDate: string;
  dueIn: string;
  taxDue: string;
  status: string;
};

export type FilingHistoryRow = {
  state: string;
  stateColor: string;
  rate: string;
  period: string;
  filedDate: string;
  filedTime: string;
  taxPaid: string;
  method: string;
  status: string;
  receiptId: string;
  receiptDate: string;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Due Soon":
      return (
        <Badge className="bg-orange-400 hover:bg-orange-500 text-white font-normal rounded-sm">
          Due Soon
        </Badge>
      );
    case "Pending":
      return (
        <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white font-normal rounded-sm">
          Pending
        </Badge>
      );
    case "No tax due":
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-normal rounded-sm">
          No tax due
        </Badge>
      );
    case "Filed":
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-normal rounded-sm">
          Filed
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

function PaginationFooter() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="flex items-center text-sm text-gray-500">
        Showing
        <Select defaultValue="10">
          <SelectTrigger className="h-8 mx-2 bg-white" style={{ width: 60 }}>
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
          className="h-8 w-8 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 p-0 rounded-md"
        >
          1
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 text-gray-600 border-gray-200 p-0 rounded-md hover:bg-gray-50"
        >
          2
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 text-gray-600 border-gray-200 p-0 rounded-md hover:bg-gray-50"
        >
          3
        </Button>
        <div className="px-2 text-gray-400">
          <MoreHorizontal className="h-4 w-4" />
        </div>
        <Button
          variant="outline"
          className="h-8 w-8 text-gray-600 border-gray-200 p-0 rounded-md hover:bg-gray-50"
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
  );
}

export function PendingFilingTab({ rows }: { rows: PendingFilingRow[] }) {
  return (
    <div className="bg-white">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 text-lg">Pending Fillings</h3>
      </div>
      <Table>
        <TableHeader className="bg-[#f8fafc]">
          <TableRow className="border-none">
            <TableHead className="font-semibold text-gray-600 h-11">State</TableHead>
            <TableHead className="font-semibold text-gray-600 h-11">Filling Period</TableHead>
            <TableHead className="font-semibold text-gray-600 h-11">Due Date ▾</TableHead>
            <TableHead className="font-semibold text-gray-600 h-11">Tax Due</TableHead>
            <TableHead className="font-semibold text-gray-600 h-11">Status</TableHead>
            <TableHead className="font-semibold text-gray-600 h-11">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow
              key={idx}
              className="border-b last:border-none hover:bg-gray-50/50"
            >
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${row.stateColor}`}
                  >
                    <span className="text-xs font-bold">{row.state.charAt(0)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{row.state}</span>
                    <span className="text-xs text-gray-500">{row.rate}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{row.period}</span>
                  <span className="text-xs text-gray-500">{row.periodType}</span>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col">
                  <span className="text-gray-900">{row.dueDate}</span>
                  <span className="text-xs text-gray-500">{row.dueIn}</span>
                </div>
              </TableCell>
              <TableCell className="py-4 text-gray-600 text-sm">{row.taxDue}</TableCell>
              <TableCell className="py-4">{getStatusBadge(row.status)}</TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-4">
                  {row.status === "No tax due" ? (
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      View Details
                    </button>
                  ) : (
                    <>
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        Review Details
                      </button>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs px-4">
                        Prepare Filling
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PaginationFooter />
    </div>
  );
}

export function FilingHistoryTab({
  rows,
  onDownload,
}: {
  rows: FilingHistoryRow[];
  onDownload: () => void;
}) {
  return (
    <div className="bg-white">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 text-lg">Filing History</h3>
      </div>
      <Table>
        <TableHeader className="bg-[#f8fafc]">
          <TableRow className="border-none">
            <TableHead className="font-semibold text-gray-600 h-11">State</TableHead>
            <TableHead className="font-semibold text-gray-600 h-11">Filling Period</TableHead>
            <TableHead className="font-semibold text-gray-600 h-11">Filed Date</TableHead>
            <TableHead className="font-semibold text-gray-600 h-11">Tax Paid</TableHead>
            <TableHead className="font-semibold text-gray-600 h-11">Method</TableHead>
            <TableHead className="font-semibold text-gray-600 h-11">Status</TableHead>
            <TableHead className="font-semibold text-gray-600 h-11">Receipt</TableHead>
            <TableHead className="font-semibold text-gray-600 h-11">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow
              key={idx}
              className="border-b last:border-none hover:bg-gray-50/50"
            >
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${row.stateColor}`}
                  >
                    <span className="text-xs font-bold">{row.state.charAt(0)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{row.state}</span>
                    <span className="text-xs text-gray-500">{row.rate}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{row.period}</span>
                  <span className="text-xs text-gray-500">Monthly</span>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col">
                  <span className="text-gray-900">{row.filedDate}</span>
                  <span className="text-xs text-gray-500">{row.filedTime}</span>
                </div>
              </TableCell>
              <TableCell className="py-4 text-gray-600 text-sm">{row.taxPaid}</TableCell>
              <TableCell className="py-4 text-gray-600 text-sm">{row.method}</TableCell>
              <TableCell className="py-4">{getStatusBadge(row.status)}</TableCell>
              <TableCell className="py-4">
                <a className="text-blue-600 font-medium" href="#">
                  {row.receiptId}
                </a>
                <div className="text-xs text-gray-400">{row.receiptDate}</div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    className="rounded font-medium text-blue-600 hover:text-blue-800"
                  >
                    View Filing
                  </Button>
                  <Button
                    size="icon"
                    className="flex items-center justify-center rounded"
                    onClick={onDownload}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PaginationFooter />
    </div>
  );
}