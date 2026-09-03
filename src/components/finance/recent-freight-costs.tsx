import { useState } from "react";
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
import { Download, Loader2 } from "lucide-react";
import {
  useRecentFreightCostsQuery,
  useExportFreightCostsMutation,
} from "@/modules/financials/financials.hooks";

const statusStyles: Record<string, string> = {
  Invoiced: "bg-emerald-100 text-emerald-800",
  Pending: "bg-amber-100 text-amber-800",
  Paid: "bg-sky-100 text-sky-800",
};

export default function RecentFreightCosts() {
  const [page] = useState(1);
  const [limit] = useState(20);

  const { data: response, isLoading } = useRecentFreightCostsQuery({ page, limit });
  const exportMutation = useExportFreightCostsMutation();

  const costsList = response?.data?.costs ?? [];

  const handleExport = () => {
    exportMutation.mutate(undefined, {
      onSuccess: (data) => {
        const blob = new Blob([data], {
          type: "text/csv;charset=utf-8;",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `freight-costs-export-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      },
    });
  };

  return (
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <Download className="h-4 w-4 mr-1.5" />
            )}
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span>Loading recent freight costs...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : costsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  No freight costs found
                </TableCell>
              </TableRow>
            ) : (
              costsList.map((f, index) => {
                const freightId = f.freightId || f.id || f._id || `FR-${index + 1}`;
                const projectName = f.projectName || f.project || "-";
                const carrierName = f.carrierName || f.carrier || "-";
                const deliveryId = f.deliveryId || "-";
                const dateVal = f.date ? new Date(f.date).toLocaleDateString() : "-";
                const costVal =
                  typeof f.cost === "number"
                    ? `$${f.cost.toLocaleString()}`
                    : f.cost || (typeof f.amount === "number" ? `$${f.amount.toLocaleString()}` : "-");
                const statusStr = f.status || "Pending";
                const badgeClass = statusStyles[statusStr] || "bg-gray-100 text-gray-800";

                return (
                  <TableRow key={f._id || index} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="text-sm font-semibold text-blue-600">
                        {freightId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold text-gray-900">
                        {projectName}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {carrierName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {deliveryId}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {dateVal}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900">
                      {costVal}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${badgeClass}`}
                      >
                        {statusStr}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
