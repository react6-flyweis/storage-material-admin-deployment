import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Eye, Search, Briefcase, RefreshCw, AlertCircle } from "lucide-react";
import TitleSubtitle from "@/components/TitleSubtitle";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/Pagination";
import { useBudgetVsActualProjectsQuery } from "@/modules/financials/financials.hooks";

export default function BudgetActual() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError, refetch } = useBudgetVsActualProjectsQuery();

  const filteredProjects = useMemo(() => {
    const projects = data?.data?.projects ?? [];
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase().trim();
    return projects.filter(
      (p) =>
        p.jobId.toLowerCase().includes(query) ||
        (p.projectName && p.projectName.toLowerCase().includes(query))
    );
  }, [data?.data?.projects, searchQuery]);

  const totalItems = filteredProjects.length;

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  return (
    <div className="min-h-full p-5">
      <div className="mx-auto flex max-w-350 flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TitleSubtitle
            title="Budget v/s Actual Projects"
            subtitle="Select a project to review cost head breakdown, variances, and financial performance."
          />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by Job ID or Project Name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 bg-white border-slate-200"
            />
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 bg-white">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Table Card */}
        <Card className="p-0 gap-0">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
                <RefreshCw className="h-7 w-7 animate-spin text-slate-400" />
                <p className="text-sm font-medium">Loading projects...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-16 text-rose-500 gap-3">
                <AlertCircle className="h-7 w-7 text-rose-500" />
                <p className="text-sm font-medium">Failed to load projects</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
                <Briefcase className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium">No projects found</p>
                {searchQuery && (
                  <p className="text-xs text-slate-400">
                    No results matching &quot;{searchQuery}&quot;
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5 w-16">#</th>
                      <th className="px-6 py-3.5">Job ID</th>
                      <th className="px-6 py-3.5">Project Name</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {paginatedProjects.map((project, index) => {
                      const rowNum = (currentPage - 1) * pageSize + index + 1;
                      const displayName = project.projectName?.trim() || "Untitled Project";

                      return (
                        <tr
                          key={project._id}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          onClick={() => navigate(`/finance/budget-actual/${project._id}`)}
                        >
                          <td className="px-6 py-4 font-medium text-slate-400">{rowNum}</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-mono">
                              {project.jobId}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800">
                            {displayName}
                          </td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 gap-1.5"
                              onClick={() => navigate(`/finance/budget-actual/${project._id}`)}
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>

          {!isLoading && !isError && filteredProjects.length > 0 && (
            <CardFooter className="border-t p-0">
              <Pagination
                totalItems={totalItems}
                currentPage={currentPage}
                rowsPerPage={pageSize}
                onPageChange={setCurrentPage}
                onRowsPerPageChange={(newSize: number) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
              />
            </CardFooter>
          )}
        </Card>
      </div>
    </div >
  );

}
