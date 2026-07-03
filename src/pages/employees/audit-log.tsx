import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useState } from "react";
import { format } from "date-fns";
import { useEmployeeAuditLogQuery } from "@/modules/employees/employees.hooks";
import { Loader2 } from "lucide-react";
import Pagination from "@/components/Pagination";

export default function EmployeeAuditLog() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  
  const { data: auditLogData, isLoading } = useEmployeeAuditLogQuery(page, limit);
  const auditRows = auditLogData?.data?.employees || [];

  const getRoleClasses = (role: string) => {
    switch (role?.toLowerCase()) {
      case "manager":
        return "bg-blue-100 text-blue-700";
      case "admin":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-emerald-100 text-emerald-700";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-2xl">
          Add, edit, and manage employees, teams, roles, and permissions.
        </p>
      </div>

      <div className="bg-white">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="px-4 py-3">Employee</TableHead>
              <TableHead className="px-4 py-3">Role</TableHead>
              <TableHead className="px-4 py-3">Panel</TableHead>
              <TableHead className="px-4 py-3">Status</TableHead>
              <TableHead className="px-4 py-3">Last Activity</TableHead>
              <TableHead className="px-4 py-3">Time&amp;Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">Loading audit logs...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : auditRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              auditRows.map((row) => (
                <TableRow key={row.userId} className="">
                  <TableCell className="px-4 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarFallback>{getInitials(row.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900">
                        {row.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 align-middle">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getRoleClasses(row.role)}`}
                    >
                      {row.role || "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-4 align-middle text-sm text-gray-600 capitalize">
                    {row.panel || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-4 align-middle">
                    <Badge className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${row.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {row.status || (row.isActive ? "Active" : "Inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4 align-middle text-sm text-gray-600">
                    {row.lastActivity || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-4 align-middle text-sm text-gray-600">
                    {row.lastActivityAt ? format(new Date(row.lastActivityAt), "MM/dd/yyyy hh:mm a") : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {auditLogData?.data?.total ? (
          <Pagination
            totalItems={auditLogData.data.total}
            currentPage={page}
            rowsPerPage={limit}
            onPageChange={setPage}
            onRowsPerPageChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
