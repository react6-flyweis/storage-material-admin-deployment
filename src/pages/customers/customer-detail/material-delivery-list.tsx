import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  Eye,
  Search,
  Filter,
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
import { Card } from "@/components/ui/card";
import Pagination from "@/components/Pagination";

export const deliveryStats = [
  { label: "Total", value: "12", bg: "bg-white", text: "text-slate-900" },
  { label: "Scheduled", value: "4", bg: "bg-white", text: "text-[#1D51A4]" },
  { label: "Confirmed", value: "3", bg: "bg-white", text: "text-[#16A34A]" },
  { label: "Delayed", value: "1", bg: "bg-white", text: "text-[#DC2626]" },
  { label: "Delivered", value: "2", bg: "bg-white", text: "text-slate-900" },
];

export const deliveryRows = [
  {
    id: "DEL-1012",
    status: "Scheduled",
    statusLabel: "Scheduled",
    statusIcon: Clock,
    date: "Apr 1, 2026",
    time: "07:30 - 11:30",
    item: "Roofing Materials",
    project: "ABC Logistics Warehouse",
    customer: "John Doe",
    vendor: "Roof Masters Ltd.",
    carrier: "Rapid Delivery Services",
    poc: "John Site Manager",
    phone: "+1 555-123-9876",
    email: "john.manager@example.com",
    stagingArea: "Staging Bay B3",
    quantity: "24 Bundles (4,800 lbs)",
    priority: "High Priority",
    driver: "Robert Davis",
    truck: "TRK-9042 (Flatbed 48ft)",
    origin: "Roof Masters Plant (Austin, TX)",
    destination: "ABC Logistics Site (Building A)",
  },
  {
    id: "DEL-1010",
    status: "Scheduled",
    statusLabel: "Scheduled",
    statusIcon: Clock,
    date: "Mar 31, 2026",
    time: "11:00 - 15:00",
    item: "HVAC Equipment",
    project: "Metro Cast Factory",
    customer: "John Doe",
    vendor: "Climate Control Inc.",
    carrier: "FastFreight Logistics",
    poc: "Mike Johnson",
    phone: "+1 555-987-6543",
    email: "mike.johnson@example.com",
    stagingArea: "Staging Bay A1",
    quantity: "12 Units (8,200 lbs)",
    priority: "Medium Priority",
    driver: "Sam Wilson",
    truck: "TRK-5521 (Box Truck 26ft)",
    origin: "Climate Control Plant (Dallas, TX)",
    destination: "Metro Cast Factory Site",
  },
  {
    id: "DEL-1008",
    status: "Confirmed",
    statusLabel: "Confirmed",
    statusIcon: CheckCircle2,
    date: "Mar 30, 2026",
    time: "10:00 - 14:00",
    item: "Wall Panels",
    project: "Warehouse Phase 2",
    customer: "John Doe",
    vendor: "Panel Systems Inc.",
    carrier: "Premier Transport Co.",
    poc: "Lisa Anderson",
    phone: "+1 555-721-4489",
    email: "lisa.anderson@example.com",
    stagingArea: "Staging Bay C2",
    quantity: "45 Panels (14,500 lbs)",
    priority: "High Priority",
    driver: "James Miller",
    truck: "TRK-7710 (Flatbed 53ft)",
    origin: "Panel Systems Factory (Houston, TX)",
    destination: "Warehouse Phase 2 Site",
  },
  {
    id: "DEL-1003",
    status: "Delayed",
    statusLabel: "Delayed",
    statusIcon: AlertTriangle,
    date: "Mar 27, 2026",
    time: "07:00 - 11:00",
    item: "Insulation Materials",
    project: "Warehouse Phase 2",
    customer: "John Doe",
    vendor: "Insul-Pro Systems",
    carrier: "Rapid Delivery Services",
    poc: "Lisa Anderson",
    phone: "+1 555-432-1098",
    email: "lisa.anderson@example.com",
    stagingArea: "Staging Bay B1",
    quantity: "80 Rolls (2,100 lbs)",
    priority: "Normal Priority",
    driver: "Carl Peterson",
    truck: "TRK-3349 (Cargo Van)",
    origin: "Insul-Pro Depot (San Antonio, TX)",
    destination: "Warehouse Phase 2 Site",
  },
  {
    id: "DEL-1004",
    status: "Draft",
    statusLabel: "Draft",
    statusIcon: Clock,
    date: "Mar 28, 2026",
    time: "09:00 - 13:00",
    item: "Secondary Steel Beams",
    project: "Industrial Park A",
    customer: "John Doe",
    vendor: "Steel Shippers Inc.",
    carrier: "FastFreight Logistics",
    poc: "Tom Wilson",
    phone: "+1 555-654-3210",
    email: "tom.wilson@example.com",
    stagingArea: "Staging Bay D4",
    quantity: "18 Beams (22,000 lbs)",
    priority: "High Priority",
    driver: "David Clark",
    truck: "TRK-1088 (Stepdeck Trailer)",
    origin: "Steel Shippers Mill (Fort Worth, TX)",
    destination: "Industrial Park A Site",
  },
];

const statusClasses: Record<string, string> = {
  Scheduled:
    "inline-flex items-center gap-2 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#1D4ED8] border border-[#BFDBFE]",
  Confirmed:
    "inline-flex items-center gap-2 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-medium text-[#166534] border border-[#BBF7D0]",
  Delayed:
    "inline-flex items-center gap-2 rounded-full bg-[#FEE2E2] px-3 py-1 text-xs font-medium text-[#B91C1C] border border-[#FECACA]",
  Draft:
    "inline-flex items-center gap-2 rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-medium text-[#92400E] border border-[#FDE68A]",
};

export default function MaterialDeliveryListPage() {
  const navigate = useNavigate();
  const { id, projectId } = useParams<{ id: string; projectId: string }>();
  const customerId = id || "";
  const currentProjectId = projectId || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return deliveryRows;

    return deliveryRows.filter((row) =>
      [
        row.id,
        row.status,
        row.item,
        row.project,
        row.customer,
        row.vendor,
        row.carrier,
        row.poc,
        row.date,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [searchTerm]);

  const currentRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleRowClick = (deliveryId: string) => {
    if (customerId) {
      if (currentProjectId) {
        navigate(`/customers/${customerId}/material-delivery/${deliveryId}`);
      } else {
        navigate(`/customers/${customerId}/material-delivery/${deliveryId}`);
      }
    } else {
      navigate(`/customers/1/material-delivery/${deliveryId}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={() =>
              navigate(
                customerId
                  ? currentProjectId
                    ? `/customers/${customerId}/project-details/${currentProjectId}`
                    : `/customers/${customerId}`
                  : "/customers"
              )
            }
            className="px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-[#0F172A]">
            Material Delivery List
          </h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {deliveryStats.map((stat) => (
          <Card
            key={stat.label}
            className="rounded-[18px] border border-slate-200 shadow-sm p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className={`mt-2 text-3xl font-semibold ${stat.text}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search deliveries..."
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

      {/* Table Card */}
      <Card className="overflow-hidden p-0 border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#1D51A4] text-white hover:bg-[#1D51A4]">
                <TableHead className="py-4 text-left text-sm font-semibold text-white">
                  ID
                </TableHead>
                <TableHead className="py-4 text-left text-sm font-semibold text-white">
                  Status
                </TableHead>
                <TableHead className="py-4 text-left text-sm font-semibold text-white">
                  <div className="flex items-center gap-1">
                    Date & Time
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
                  </div>
                </TableHead>
                <TableHead className="py-4 text-left text-sm font-semibold text-white">
                  Item
                </TableHead>
                <TableHead className="py-4 text-left text-sm font-semibold text-white">
                  Project
                </TableHead>
                <TableHead className="py-4 text-left text-sm font-semibold text-white">
                  Customer
                </TableHead>
                <TableHead className="py-4 text-left text-sm font-semibold text-white">
                  Vendor
                </TableHead>
                <TableHead className="py-4 text-left text-sm font-semibold text-white">
                  Carrier
                </TableHead>
                <TableHead className="py-4 text-left text-sm font-semibold text-white">
                  POC
                </TableHead>
                <TableHead className="py-4 text-center text-sm font-semibold text-white w-20">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRows.map((row) => {
                const Icon = row.statusIcon;
                return (
                  <TableRow
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(row.id)}
                  >
                    <TableCell className="py-4 text-slate-900 font-bold">
                      {row.id}
                    </TableCell>
                    <TableCell>
                      <span className={statusClasses[row.status] ?? ""}>
                        <Icon className="h-3.5 w-3.5" />
                        {row.statusLabel}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-slate-600">
                      <div className="font-medium text-slate-800">
                        {row.date}
                      </div>
                      <div className="text-sm text-slate-500">{row.time}</div>
                    </TableCell>
                    <TableCell className="py-4 text-slate-700 font-medium">
                      {row.item}
                    </TableCell>
                    <TableCell className="py-4 text-slate-700">
                      {row.project}
                    </TableCell>
                    <TableCell className="py-4 text-slate-700">
                      {row.customer}
                    </TableCell>
                    <TableCell className="py-4 text-slate-700">
                      {row.vendor}
                    </TableCell>
                    <TableCell className="py-4 text-slate-700">
                      {row.carrier}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-medium text-slate-800 text-sm">
                          {row.poc}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="h-3.5 w-3.5" />
                          <a
                            href={`tel:${row.phone}`}
                            className="hover:text-slate-900"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {row.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="h-3.5 w-3.5" />
                          <a
                            href={`mailto:${row.email}`}
                            className="hover:text-slate-900"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {row.email}
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full h-8 w-8 p-0"
                        onClick={() => handleRowClick(row.id)}
                        title="View Delivery Details"
                      >
                        <Eye className="h-4 w-4 text-[#1D51A4]" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-slate-200">
        <Pagination
          totalItems={filteredRows.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
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
