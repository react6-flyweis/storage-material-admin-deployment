import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ProfitLossData {
  id: string;
  projectName: string;
  category: string;
  sales: string;
  cogs: string;
  grossProfit: string;
  grossMargin1: string;
  grossMargin2: string;
  grossMargin3: string;
  grossMargin4: string;
}

interface MarginProfitLossSummaryTableProps {
  data: ProfitLossData[];
  itemsPerPage?: number;
}

export default function MarginProfitLossSummaryTable({
  data,
  itemsPerPage = 10,
}: MarginProfitLossSummaryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);
  const showingCount = paginatedData.length;

  return (
    <div className="mt-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-xl font-semibold text-slate-900">
        Profit & Loss Summary
      </h3>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-32">Project Name</TableHead>
              <TableHead className="w-20">Category</TableHead>
              <TableHead className="w-32 text-right">Sales (USD)</TableHead>
              <TableHead className="w-32 text-right">COGS (USD)</TableHead>
              <TableHead className="w-40 text-right">
                Gross Profit (USD)
              </TableHead>
              <TableHead className="w-24 text-right">Gross Margin</TableHead>
              <TableHead className="w-24 text-right">Gross Margin</TableHead>
              <TableHead className="w-24 text-right">Gross Margin</TableHead>
              <TableHead className="w-24 text-right">Gross Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow
                key={row.id}
                className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
              >
                <TableCell className="font-medium text-slate-900">
                  {row.projectName}
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {row.category}
                </TableCell>
                <TableCell className="text-right text-sm text-slate-600">
                  {row.sales}
                </TableCell>
                <TableCell className="text-right text-sm text-slate-600">
                  {row.cogs}
                </TableCell>
                <TableCell className="text-right text-sm text-slate-600">
                  {row.grossProfit}
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-emerald-600">
                  {row.grossMargin1}
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-emerald-600">
                  {row.grossMargin2}
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-emerald-600">
                  {row.grossMargin3}
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-emerald-600">
                  {row.grossMargin4}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Showing <span className="font-medium">{showingCount}</span> Results
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-violet-600 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
