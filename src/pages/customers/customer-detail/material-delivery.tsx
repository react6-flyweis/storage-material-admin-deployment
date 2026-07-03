import { useNavigate } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

const deliveryStats = [
  { label: "Total", value: "12", bg: "bg-white", text: "text-slate-900" },
  { label: "Scheduled", value: "4", bg: "bg-white", text: "text-[#1D51A4]" },
  { label: "Confirmed", value: "3", bg: "bg-white", text: "text-[#16A34A]" },
  { label: "Delayed", value: "1", bg: "bg-white", text: "text-[#DC2626]" },
  { label: "Delivered", value: "2", bg: "bg-white", text: "text-slate-900" },
];

const deliveryRows = [
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

export default function MaterialDeliveryPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={() => navigate('/customers')}
            className="px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-[#0F172A]">
            Project 1 - Material Delivery
          </h1>
        </div>
      </div>

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

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#1D51A4] text-white">
                <TableHead className="py-4 text-left text-sm font-semibold">
                  ID
                </TableHead>
                <TableHead className="py-4 text-left text-sm font-semibold">
                  Status
                </TableHead>
                <TableHead className="py-4 text-left text-sm font-semibold">
                  Date & Time
                </TableHead>
                <TableHead className="py-4 text-left text-sm font-semibold">
                  Item
                </TableHead>
                <TableHead className="py-4 text-left text-sm font-semibold">
                  Project
                </TableHead>
                <TableHead className="py-4 text-left text-sm font-semibold">
                  Customer
                </TableHead>
                <TableHead className="py-4 text-left text-sm font-semibold">
                  Vendor
                </TableHead>
                <TableHead className="py-4 text-left text-sm font-semibold">
                  Carrier
                </TableHead>
                <TableHead className="py-4 text-left text-sm font-semibold">
                  POC
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryRows.map((row) => {
                const Icon = row.statusIcon;
                return (
                  <TableRow
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="py-4 text-slate-800 font-semibold">
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
                    <TableCell className="py-4 text-slate-700">
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
                      <div className="flex flex-col gap-2">
                        <span className="font-medium text-slate-800">
                          {row.poc}
                        </span>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Phone className="h-4 w-4" />
                          <a
                            href={`tel:${row.phone}`}
                            className="hover:text-slate-900"
                          >
                            {row.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Mail className="h-4 w-4" />
                          <a
                            href={`mailto:${row.email}`}
                            className="hover:text-slate-900"
                          >
                            {row.email}
                          </a>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
