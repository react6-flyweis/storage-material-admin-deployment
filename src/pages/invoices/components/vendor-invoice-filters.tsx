import { useMemo } from "react";
import DateRangePicker from "@/components/ui/date-range-picker";
import type { DateRange as RDateRange } from "react-day-picker";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBudgetVsActualProjectsQuery } from "@/modules/financials/financials.hooks";

export type VendorInvoiceFiltersProps = {
  dateRange: RDateRange | undefined;
  setDateRange: (range: RDateRange | undefined) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  payableStatusFilter?: string;
  setPayableStatusFilter?: (status: string) => void;
  projectFilter: string;
  setProjectFilter: (project: string) => void;
};

export function VendorInvoiceFilters({
  dateRange,
  setDateRange,
  statusFilter,
  setStatusFilter,
  payableStatusFilter = "All",
  setPayableStatusFilter,
  projectFilter,
  setProjectFilter,
}: VendorInvoiceFiltersProps) {
  const { data: projectsData } = useBudgetVsActualProjectsQuery();

  const projects = useMemo(() => {
    const list = projectsData?.data?.projects ?? [];
    return list.map((p) => ({
      id: p._id,
      name: p.projectName ? `${p.projectName} (${p.jobId})` : p.jobId,
    }));
  }, [projectsData?.data?.projects]);

  return (
    <Card>
      <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Date Range Picker */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Date
          </label>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* Payable Status Filter (New AP workflow) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payable Status
          </label>
          <Select
            value={payableStatusFilter}
            onValueChange={(val) => setPayableStatusFilter?.(val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Payable Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Payable Statuses</SelectItem>
              <SelectItem value="pending_admin_approval">
                Pending Admin Approval
              </SelectItem>
              <SelectItem value="approved_for_payment">
                Approved for Payment
              </SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Legacy Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Invoice Status
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Project Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project
          </label>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {projects.map((proj) => (
                <SelectItem key={proj.id} value={proj.id}>
                  {proj.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
