import { Link } from "react-router";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Freight = {
  id: string;
  project: string;
  carrier: string;
  deliveryId: string;
  date: string;
  cost: string;
  status: "Invoiced" | "Pending" | "Paid";
};

const freights: Freight[] = [
  {
    id: "FR-1001",
    project: "ABC Logistics Warehouse",
    carrier: "FastFreight Logistics",
    deliveryId: "DEL-1001",
    date: "Mar 25, 2026",
    cost: "$4,500.00",
    status: "Invoiced",
  },
  {
    id: "FR-1002",
    project: "ABC Logistics Warehouse",
    carrier: "QuickTransport Co.",
    deliveryId: "DEL-1002",
    date: "Mar 26, 2026",
    cost: "$2,800.00",
    status: "Pending",
  },
  {
    id: "FR-1003",
    project: "Downtown Office Complex",
    carrier: "Regional Freight",
    deliveryId: "DEL-1003",
    date: "Mar 27, 2026",
    cost: "$5,200.00",
    status: "Invoiced",
  },
  {
    id: "FR-1004",
    project: "Industrial Park Phase 2",
    carrier: "Local Delivery Services",
    deliveryId: "DEL-1004",
    date: "Mar 28, 2026",
    cost: "$1,950.00",
    status: "Paid",
  },
  {
    id: "FR-1005",
    project: "ABC Logistics Warehouse",
    carrier: "Local Delivery Services",
    deliveryId: "DEL-1005",
    date: "Mar 22, 2026",
    cost: "$1,200.00",
    status: "Paid",
  },
];

const statusStyles: Record<Freight["status"], string> = {
  Invoiced: "bg-emerald-100 text-emerald-800",
  Pending: "bg-amber-100 text-amber-800",
  Paid: "bg-sky-100 text-sky-800",
};

export default function RecentFreightCosts() {
  return (
    <Link to="/finance/freight-costs" className="block">
      <Card className="bg-[#FAFBFF] rounded-sm py-4 gap-0">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Freight Costs
            </h3>
            <p className="text-sm text-gray-500">
              Latest freight billing and invoice records
            </p>
          </div>

          <div className="mt-3 sm:mt-0 flex items-center gap-2">
            <Button variant="outline" size="sm">
              Filter
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Link to="/finance/freight-costs" className="inline-block">
              <Button size="sm">View All Costs</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Freight ID
                </TableHead>
                <TableHead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Project
                </TableHead>
                <TableHead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Carrier
                </TableHead>
                <TableHead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Delivery ID
                </TableHead>
                <TableHead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Date
                </TableHead>
                <TableHead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Cost
                </TableHead>
                <TableHead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-100">
              {freights.map((f) => (
                <TableRow key={f.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="text-sm font-semibold text-blue-600">
                      {f.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-semibold text-gray-900">
                      {f.project}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {f.carrier}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {f.deliveryId}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {f.date}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-gray-900">
                    {f.cost}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[f.status]}`}
                    >
                      {f.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Link>
  );
}
