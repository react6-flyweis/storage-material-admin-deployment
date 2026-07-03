import { useMemo, useState, useEffect } from "react";
import { CheckCircle, Eye, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Pagination from "@/components/Pagination";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router";
import { useTerminatedLeadsQuery } from "@/modules/leads/leads.hooks";

export default function TerminatedProjectsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  const { data, isLoading, isError } = useTerminatedLeadsQuery(
    currentPage,
    rowsPerPage,
    debouncedQuery
  );

  const projects = data?.data?.projects || [];
  const totalItems = data?.data?.total || 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Terminated Projects {totalItems > 0 && `- ${totalItems}`}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Projects Terminated by Admin
        </p>
      </div>

      <div className="w-full max-w-xs bg-white rounded-lg">
        <label className="sr-only" htmlFor="search-terminated-projects">
          Search terminated projects
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="search-terminated-projects"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder="Search"
            className="pl-10"
          />
        </div>
      </div>

      <Card className="p-3">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="px-4 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                />
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Lead Info
              </TableHead>
              <TableHead className="px-4 py-3 text-sm font-medium text-slate-600">
                Assigned Sales
              </TableHead>
              <TableHead className="px-4 py-3 text-sm font-medium text-slate-600">
                Terminated Date
              </TableHead>
              <TableHead className="px-4 py-3 text-sm font-medium text-slate-600">
                Reason
              </TableHead>
              <TableHead className="px-4 py-3 text-sm font-medium text-slate-600">
                Status
              </TableHead>
              <TableHead className="px-4 py-3 text-sm font-medium text-slate-600">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-500">Loading projects...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-red-500">
                  Failed to load terminated projects.
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-gray-500">
                  No terminated projects found.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project._id} className="hover:bg-slate-50">
                  <TableCell className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                    />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-slate-900">
                        {project.customerId ? `${project.customerId.firstName || ""} ${project.customerId.lastName || ""}`.trim() || "Unknown Customer" : "Unknown Customer"}
                      </span>
                      {project.projectName && (
                        <span className="text-[12px] text-slate-500 mt-0.5">
                          {project.projectName}
                        </span>
                      )}
                      <span className="text-[12px] text-slate-500 mt-0.5">
                        {project.jobId || project._id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-slate-600">
                    {project.assignedSales?.name || "Unassigned"}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-slate-600">
                    {formatDate(project.terminatedAt)}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-slate-600 truncate max-w-xs">
                    {project.terminationReason || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <span className="inline-flex items-center rounded-md bg-orange-100 px-2 py-0.5 text-xs text-orange-600 border border-orange-600">
                      {project.lifecycleStatus ? project.lifecycleStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Terminated"}
                      <CheckCircle className="ml-1 h-3 w-3 text-orange-600" />
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        navigate(`/customers/${project._id}/project-details`)
                      }
                      aria-label={`View ${project.projectName}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {totalItems > 0 && (
        <div className="bg-white rounded-b-lg">
          <Pagination
            totalItems={totalItems}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={(pageNumber) => setCurrentPage(pageNumber)}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
