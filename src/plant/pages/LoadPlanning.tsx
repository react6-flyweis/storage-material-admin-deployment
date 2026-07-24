import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Eye } from "lucide-react";
import { useLoadPlanningProjectsQuery } from "@/modules/plant/load-planning.hooks";
import Pagination from "@/components/Pagination";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadPlanning() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search term to prevent excessive API requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch projects data using react-query hook
  const { data, isLoading, error } = useLoadPlanningProjectsQuery(
    currentPage,
    rowsPerPage,
    debouncedSearch
  );

  const projects = data?.data?.projects || [];
  const totalItems = data?.data?.total || 0;

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#fbfbfe] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Load Planning</h1>
          <p className="text-sm text-gray-500 mt-1">
            Plan shipments by uploading shipper data, optimizing bundles, and building truckloads.
          </p>
        </div>
        <Button variant="outline" className="bg-white">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      <Card className="shadow-sm border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-gray-700 font-semibold border-b">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-4">Project ID</th>
                <th className="px-6 py-4">Project Name</th>
                <th className="px-6 py-4">File Received ⇅</th>
                <th className="px-6 py-4">Total Loads ⇅</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                Array.from({ length: rowsPerPage }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 text-center">
                      <Skeleton className="h-4 w-4 mx-auto rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Skeleton className="h-8 w-8 ml-auto rounded" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-red-500">
                    Failed to load load planning projects. Please try again.
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No load planning projects found.
                  </td>
                </tr>
              ) : (
                projects.map((row) => (
                  <tr key={row.projectId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-center">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-6 py-4 text-gray-600">{row.projectId}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{row.projectName}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(row.fileReceivedAt)}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{row.totalLoads}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100 text-gray-600">
                        <Link to={`/plant/load-planning/${row.projectId}/details/${row.bundlePlanId}`}>
                          <Eye className="w-5 h-5" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && !error && projects.length > 0 && (
          <Pagination
            totalItems={totalItems}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
          />
        )}
      </Card>
    </div>
  );
}
