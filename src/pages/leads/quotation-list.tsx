import { useState } from "react";
import { Link } from "react-router";
import { Eye, Download, Upload } from "lucide-react";
import TitleSubtitle from "@/components/TitleSubtitle";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Pagination from "@/components/Pagination";

interface QuotationItem {
  id: string;
  customer: string;
  project: string;
  status: "Project Converted" | "Rejected" | "Quote sent";
  value: string;
  dateSent: string;
}

const mockQuotations: QuotationItem[] = [
  {
    id: "Q-1023",
    customer: "ABC Corp",
    project: "Warehouse",
    status: "Project Converted",
    value: "$12,500",
    dateSent: "25-01-2025",
  },
  {
    id: "Q-1023",
    customer: "XYZ Ltd",
    project: "Storage",
    status: "Rejected",
    value: "$12,500",
    dateSent: "25-01-2025",
  },
  {
    id: "Q-1023",
    customer: "ABC Corp",
    project: "Warehouse",
    status: "Quote sent",
    value: "$12,500",
    dateSent: "25-01-2025",
  },
  {
    id: "Q-1023",
    customer: "XYZ Ltd",
    project: "Storage",
    status: "Quote sent",
    value: "$12,500",
    dateSent: "25-01-2025",
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  "Project Converted": { bg: "bg-green-100", text: "text-green-700" },
  Rejected: { bg: "bg-orange-100", text: "text-orange-700" },
  "Quote sent": { bg: "bg-purple-100", text: "text-purple-700" },
};

export default function QuotationListPage() {
  const [selectedFilters, setSelectedFilters] = useState({
    buildingType: "",
    projectValue: "",
    status: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalQuotations = 24;
  const approvedQuotations = 8;
  const pendingApproval = 12;
  const rejectedQuotations = 5;

  const handleFilterChange = (filterName: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const statBoxes = [
    {
      label: "Total Quotation",
      value: totalQuotations,
      bgColor: "bg-blue-600",
    },
    {
      label: "Approved Quotation",
      value: approvedQuotations,
      bgColor: "bg-green-500",
    },
    {
      label: "Pending Approval",
      value: pendingApproval,
      bgColor: "bg-yellow-400",
    },
    {
      label: "Rejected Quotation",
      value: rejectedQuotations,
      bgColor: "bg-orange-400",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <TitleSubtitle
        title="Quotation/New Inquiry List"
        subtitle="Manage your assigned leads and track their progress."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statBoxes.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-lg p-6 text-white shadow-md`}
          >
            <p className="text-sm font-medium opacity-90">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button
            className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 flex items-center gap-2"
            size="sm"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <Button
            className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 flex items-center gap-2"
            size="sm"
          >
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>

        <div className="flex gap-4 ">
          <Select
            value={selectedFilters.buildingType}
            onValueChange={(v) => handleFilterChange("buildingType", v)}
          >
            <SelectTrigger className="w-44 bg-white">
              <SelectValue placeholder="Building Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="warehouse">Warehouse</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={selectedFilters.projectValue}
            onValueChange={(v) => handleFilterChange("projectValue", v)}
          >
            <SelectTrigger className="w-44 bg-white">
              <SelectValue placeholder="Project Value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-10000">$0 - $10,000</SelectItem>
              <SelectItem value="10000-50000">$10,000 - $50,000</SelectItem>
              <SelectItem value="50000+">$50,000+</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={selectedFilters.status}
            onValueChange={(v) => handleFilterChange("status", v)}
          >
            <SelectTrigger className="w-44 bg-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="converted">Project Converted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="quote-sent">Quote sent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <tr>
                <TableHead className="">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead className=" text-gray-600 text-xs">
                  QUOTE ID
                </TableHead>
                <TableHead className=" text-gray-600 text-xs">
                  CUSTOMER
                </TableHead>
                <TableHead className=" text-gray-600 text-xs">
                  PROJECT
                </TableHead>
                <TableHead className=" text-gray-600 text-xs">STATUS</TableHead>
                <TableHead className=" text-gray-600 text-xs">
                  QUOTATION VALUE
                </TableHead>
                <TableHead className=" text-gray-600 text-xs">
                  DATE SENT
                </TableHead>
                <TableHead className=" text-gray-600 text-xs">
                  ACTIONS
                </TableHead>
              </tr>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {mockQuotations.map((quotation, idx) => {
                const colors = statusColors[quotation.status];
                return (
                  <TableRow key={idx} className="hover:bg-gray-50">
                    <TableCell className="px-6 py-4">
                      <input type="checkbox" className="rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-900">
                      {quotation.id}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-900">
                      {quotation.customer}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-900">
                      {quotation.project}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-0.5 whitespace-nowrap rounded-full text-xs ${colors.bg} ${colors.text}`}
                      >
                        {quotation.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-900">
                      {quotation.value}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-900">
                      {quotation.dateSent}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm">
                      <Link
                        to={`/leads/quotation-details/${quotation.id}`}
                        className="text-purple-500 inline-block"
                      >
                        <Eye className="size-4 " />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white">
        <Pagination
          totalItems={totalQuotations}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
          onRowsPerPageChange={(r) => {
            setRowsPerPage(r);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
