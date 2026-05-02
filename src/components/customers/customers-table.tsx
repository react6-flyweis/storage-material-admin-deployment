import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CustomerListItem = {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  email: string;
  inquiryFor: string;
  status: string;
};

type CustomersTableProps = {
  customers: CustomerListItem[];
  isLoading: boolean;
  isError: boolean;
  totalItems: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onViewCustomer: (customerId: string) => void;
};

export default function CustomersTable({
  customers,
  isLoading,
  isError,
  totalItems,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onViewCustomer,
}: CustomersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [plantFilter, setPlantFilter] = useState("all");
  const [projectStatusFilter, setProjectStatusFilter] = useState("all");

  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  const getAssignedPlant = (customer: CustomerListItem, index: number) => {
    if (customer.inquiryFor?.trim()) {
      return customer.inquiryFor;
    }

    return index % 2 === 0 ? "Houston Plant" : "Dallas Plant";
  };

  const getProjectCount = (customer: CustomerListItem, index: number) => {
    const parsed = Number.parseInt(customer.customerId?.replace(/\D/g, ""), 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return (parsed % 5) + 1;
    }

    return (index % 5) + 1;
  };

  const getProjectStatus = (customer: CustomerListItem, index: number) => {
    const customerStatus = customer.status.toLowerCase();
    if (customerStatus === "active") {
      return "In Execution";
    }

    if (customerStatus === "inactive") {
      return index % 2 === 0 ? "Not Started" : "Completed";
    }

    return "Not Started";
  };

  const getStatusBadgeClass = (projectStatus: string) => {
    if (projectStatus === "In Execution") {
      return "bg-blue-100 text-blue-700";
    }

    if (projectStatus === "Completed") {
      return "bg-emerald-100 text-emerald-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return customers.filter((customer, index) => {
      const assignedPlant = getAssignedPlant(customer, index);
      const projectStatus = getProjectStatus(customer, index);

      const matchesSearch =
        !q ||
        customer.customerId.toLowerCase().includes(q) ||
        customer.customerName.toLowerCase().includes(q) ||
        customer.phone.toLowerCase().includes(q) ||
        customer.email.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        customer.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesPlant =
        plantFilter === "all" || assignedPlant.toLowerCase() === plantFilter;

      const matchesProjectStatus =
        projectStatusFilter === "all" ||
        projectStatus.toLowerCase() === projectStatusFilter;

      return (
        matchesSearch && matchesStatus && matchesPlant && matchesProjectStatus
      );
    });
  }, [customers, plantFilter, projectStatusFilter, searchQuery, statusFilter]);

  const getPages = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);
    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  const startRow = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <Card className="rounded-lg border border-gray-200 bg-white p-0">
      <CardContent className="p-0">
        <div className="border-b border-gray-200 px-4 py-2.5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-lg font-semibold leading-none text-gray-900">
              Customer List
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-57.5">
                <Input
                  value=""
                  readOnly
                  placeholder="dd/mm/yyyy - dd/mm/yyyy"
                  className="h-8 border-gray-200 bg-white pr-9 text-sm text-gray-600"
                />
                <Calendar className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 min-w-28.75 border-gray-200 bg-white text-sm text-gray-700">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={plantFilter} onValueChange={setPlantFilter}>
                <SelectTrigger className="h-8 min-w-27.5 border-gray-200 bg-white text-sm text-gray-700">
                  <SelectValue placeholder="All Plants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plants</SelectItem>
                  <SelectItem value="houston plant">Houston Plant</SelectItem>
                  <SelectItem value="dallas plant">Dallas Plant</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={projectStatusFilter}
                onValueChange={setProjectStatusFilter}
              >
                <SelectTrigger className="h-8 min-w-36.25 border-gray-200 bg-white text-sm text-gray-700">
                  <SelectValue placeholder="All Project Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Project Status</SelectItem>
                  <SelectItem value="in execution">In Execution</SelectItem>
                  <SelectItem value="not started">Not Started</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-500">Row Per Page</span>
            <select
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
              className="h-8 rounded-md border border-gray-200 px-2 text-sm text-gray-700 outline-none focus:border-gray-300"
            >
              {[10, 20, 50].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span>Entries</span>
          </div>

          <div className="relative w-full sm:w-63.75">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="h-8 border-gray-200 bg-white pl-9 text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-gray-500">Loading customers...</div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-600">
            Failed to load customers. Please try again.
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No customers found for the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-300">
              <thead className="border-b border-gray-200 bg-[#ECEEF2]">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-left text-sm font-semibold text-gray-700">
                    Customer ID
                  </th>
                  <th className="px-3 py-2.5 text-left text-sm font-semibold text-gray-700">
                    Customer Name
                  </th>
                  <th className="px-3 py-2.5 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-3 py-2.5 text-left text-sm font-semibold text-gray-700">
                    Phone No.
                  </th>
                  <th className="px-3 py-2.5 text-left text-sm font-semibold text-gray-700">
                    Assigned Plant
                  </th>
                  <th className="px-3 py-2.5 text-left text-sm font-semibold text-gray-700">
                    Projects
                  </th>
                  <th className="px-3 py-2.5 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-3 py-2.5 text-left text-sm font-semibold text-gray-700">
                    Not Assign
                  </th>
                  <th className="px-3 py-2.5 text-left text-sm font-semibold text-gray-700"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredCustomers.map((customer, index) => {
                  const assignedPlant = getAssignedPlant(customer, index);
                  const projects = getProjectCount(customer, index);
                  const projectStatus = getProjectStatus(customer, index);

                  return (
                    <tr
                      key={`${customer.id}-${index}`}
                      className="h-12 hover:bg-gray-50"
                    >
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm font-semibold text-gray-700">
                        {customer.customerId}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-600">
                        {customer.customerName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-600">
                        {customer.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-600">
                        {customer.phone}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-600">
                        {assignedPlant}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-600">
                        {projects}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                            projectStatus,
                          )}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {projectStatus}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-600">
                        {projects}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 rounded-full border border-gray-300 p-0 text-gray-600 hover:bg-gray-100"
                          onClick={() => onViewCustomer(customer.id)}
                        >
                          <Ellipsis className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && totalItems > 0 ? (
          <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing {startRow} to {endRow} of {totalItems} entries
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPages().map((page, index) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-1 text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    onClick={() => onPageChange(page)}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                      page === currentPage
                        ? "bg-[#FF7A3D] font-semibold text-white"
                        : "border border-gray-200 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
