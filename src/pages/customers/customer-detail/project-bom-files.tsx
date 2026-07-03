import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Eye,
  Filter,
  FileText,
  Search,
  ArrowUpDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import Pagination from "@/components/Pagination";
import { Card } from "@/components/ui/card";
import StatCard from "@/components/ui/stat-card";

const bomStats = [
  {
    title: "Total BOM Files",
    value: "58 Files",
    bg: "bg-[#1D51A4]",
    icon: <FileText className="h-5 w-5 text-[#1D51A4]" />,
  },
  {
    title: "Pending Upload",
    value: "12 Files",
    bg: "bg-[#22C55E]",
    icon: <FileText className="h-5 w-5 text-[#22C55E]" />,
  },
  {
    title: "Ready for Shipper",
    value: "26 Files",
    bg: "bg-[#FACC15]",
    icon: <FileText className="h-5 w-5 text-[#EAB308]" />,
  },
  {
    title: "Issues Detected",
    value: "8 Files",
    bg: "bg-[#FB923C]",
    icon: <FileText className="h-5 w-5 text-[#F97316]" />,
  },
];

const bomRows = [
  {
    building: "A",
    date: "22 Feb 2025",
    version: "v2 (Latest)",
    items: 125,
    status: "Draft",
  },
  {
    building: "B",
    date: "07 Feb 2025",
    version: "v1",
    items: 98,
    status: "Approved",
  },
  {
    building: "Combined",
    date: "30 Jan 2025",
    version: "v3 (Latest)",
    items: 210,
    status: "Locked",
  },
  {
    building: "A",
    date: "17 Jan 2025",
    version: "v2 (Latest)",
    items: 125,
    status: "Locked",
  },
  {
    building: "B",
    date: "04 Jan 2025",
    version: "v1",
    items: 98,
    status: "Locked",
  },
  {
    building: "Combined",
    date: "09 Dec 2024",
    version: "v3 (Latest)",
    items: 210,
    status: "Locked",
  },
];

const statusStyles: Record<string, string> = {
  Draft: "bg-[#FEF9C3] text-[#B45309] border border-[#FDE68A]",
  Approved: "bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]",
  Locked: "bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]",
};

export default function ProjectBomFilesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return bomRows;

    return bomRows.filter((row) =>
      [row.building, row.date, row.version, row.items.toString(), row.status]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchTerm]);

  const currentRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="default"
            onClick={() => navigate('/customers')}
            className="px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-[#1E293B]">
            Project 1 - BOM Files
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {bomStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            color={stat.bg}
            icon={stat.icon}
            valueClassName="text-3xl font-semibold"
          />
        ))}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search"
            className="pl-9 bg-white border-slate-200"
          />
        </div>
        <Button
          variant="outline"
          className="bg-white border-slate-200 text-slate-700"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC]">
              <TableHead className="w-12 text-center py-4">
                <Checkbox className="border-slate-300" />
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                Building
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                <div className="flex items-center gap-2">
                  Upload Date
                  <ArrowUpDown className="h-4 w-4 text-slate-400" />
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                Version
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                <div className="flex items-center gap-2">
                  Items
                  <ArrowUpDown className="h-4 w-4 text-slate-400" />
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                File Status
              </TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRows.map((row, index) => (
              <TableRow key={index} className="hover:bg-slate-50/80">
                <TableCell className="text-center py-4">
                  <Checkbox className="border-slate-300" />
                </TableCell>
                <TableCell className="font-medium text-slate-700">
                  {row.building}
                </TableCell>
                <TableCell className="text-slate-600">{row.date}</TableCell>
                <TableCell className="text-slate-600">{row.version}</TableCell>
                <TableCell className="text-slate-600">{row.items}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[row.status]}`}
                  >
                    {row.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    className="text-slate-500 hover:text-slate-900 p-2 rounded-full"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-between bg-white">
        <Pagination
          totalItems={filteredRows.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={(page) => {
            setCurrentPage(page);
          }}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setCurrentPage(1);
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </div>
    </div>
  );
}
