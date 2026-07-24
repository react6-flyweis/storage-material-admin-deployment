import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileCheck,
  Send,
  RefreshCw,
} from "lucide-react";
import { useShipperStatsQuery, useShipperProjectsQuery } from "@/modules/plant/shipper.hooks";
import type { FileReceivedStatus } from "@/modules/plant/shipper.api";
import { Skeleton } from "@/components/ui/skeleton";
import SummaryCard from "@/plant/components/SummaryCard";

export default function ShipperQuotation() {
  const navigate = useNavigate();

  // Pagination & Filtering State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch Stats & Projects
  const { data: statsResponse, isLoading: isStatsLoading } = useShipperStatsQuery();
  const { data: projectsResponse, isLoading: isProjectsLoading } = useShipperProjectsQuery(page, limit);

  const stats = statsResponse?.data || {
    totalFiles: 0,
    filesReceived: 0,
    ordersSent: 0,
    revisionsSent: 0,
  };

  const projectsData = projectsResponse?.data;
  const projectsList = projectsData?.projects || [];
  const totalEntries = projectsData?.total || 0;

  const getProjectDisplayName = (project: typeof projectsList[0]) => {
    if (project.projectName) return project.projectName;
    const parts = [];
    if (project.customerName) parts.push(project.customerName);
    if (project.buildingType) parts.push(project.buildingType);
    if (project.location) parts.push(project.location);
    return parts.join(" • ") || "-";
  };

  // Filter projects client-side based on search input
  const filteredProjects = projectsList.filter((project) => {
    const query = search.toLowerCase();
    const name = getProjectDisplayName(project);
    return (
      name.toLowerCase().includes(query) ||
      project.customerName.toLowerCase().includes(query) ||
      project.projectId.toLowerCase().includes(query) ||
      project.location.toLowerCase().includes(query)
    );
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProjects.map((p) => p.projectId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, projectId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== projectId));
    }
  };

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

  const renderStatusBadge = (status: FileReceivedStatus) => {
    switch (status) {
      case "all":
        return (
          <Badge className="bg-[#ecfdf5] hover:bg-[#ecfdf5] text-[#10b981] border border-[#a7f3d0] rounded-full px-3 py-1 font-medium text-[12px] gap-1.5">
            All
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-[#fff8e1] hover:bg-[#fff8e1] text-[#f59e0b] border border-[#fde68a] rounded-full px-3 py-1 font-medium text-[12px] gap-1.5">
            Partial
          </Badge>
        );
      case "none":
      default:
        return (
          <Badge className="bg-[#fef2f2] hover:bg-[#fef2f2] text-[#ef4444] border border-[#fecaca] rounded-full px-3 py-1 font-medium text-[12px] gap-1.5">
            None
          </Badge>
        );
    }
  };

  const totalPages = Math.ceil(totalEntries / limit) || 1;

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#eef2fa] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">Shipper Quotation</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage vendor shipment files and prepare for validation
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Files"
          value={`${stats.totalFiles} Files`}
          isLoading={isStatsLoading}
          bgClass="bg-[#1e5baf]"
          titleTextClass="text-blue-100"
          icon={<FileText className="w-6 h-6 text-[#1e5baf]" />}
        />

        <SummaryCard
          title="Files Received"
          value={`${stats.filesReceived} Files`}
          isLoading={isStatsLoading}
          bgClass="bg-[#34a853]"
          titleTextClass="text-green-100"
          icon={<FileCheck className="w-6 h-6 text-[#34a853]" />}
        />

        <SummaryCard
          title="Orders Sent"
          value={`${stats.ordersSent} Orders`}
          isLoading={isStatsLoading}
          bgClass="bg-[#fbbc04]"
          titleTextClass="text-yellow-100"
          icon={<Send className="w-6 h-6 text-[#fbbc04]" />}
        />

        <SummaryCard
          title="Revisions Sent"
          value={`${stats.revisionsSent} Revisions`}
          isLoading={isStatsLoading}
          bgClass="bg-[#ff7a50]"
          titleTextClass="text-orange-100"
          icon={<RefreshCw className="w-6 h-6 text-[#ff7a50]" />}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[240px] h-10 bg-white border-0 shadow-sm rounded-lg"
            />
          </div>
          <Button variant="outline" className="bg-white border-0 shadow-sm h-10 px-4 rounded-lg text-slate-700 gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
        <div>
          <Select defaultValue="latest">
            <SelectTrigger className="w-[160px] h-10 bg-white border-0 shadow-sm rounded-lg text-slate-700 font-medium">
              <SelectValue placeholder="Sort by : Latest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Sort by : Latest</SelectItem>
              <SelectItem value="oldest">Sort by : Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <Card className="shadow-sm border-gray-100 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#f8f9fc] border-b border-slate-100">
                <th className="py-4 pl-6 pr-4 w-12 text-center">
                  <Checkbox
                    className="rounded border-slate-300"
                    checked={filteredProjects.length > 0 && selectedIds.length === filteredProjects.length}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-slate-900">Project ID</th>
                <th className="py-4 px-4 text-[13px] font-bold text-slate-900">Project Name</th>
                <th className="py-4 px-4 text-[13px] font-bold text-slate-900">Files Received</th>
                <th className="py-4 px-4 text-[13px] font-bold text-slate-900">Total Shippers Files</th>
                <th className="py-4 px-4 text-[13px] font-bold text-slate-900">Latest Submission</th>
                <th className="py-4 px-4 text-[13px] font-bold text-slate-900">Status</th>
                <th className="py-4 px-6 text-right w-32">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isProjectsLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`loading-row-${index}`}>
                    <td className="py-5 pl-6 pr-4 text-center">
                      <Skeleton className="h-4 w-4 bg-slate-200 mx-auto" />
                    </td>
                    <td className="py-5 px-4">
                      <Skeleton className="h-4 w-20 bg-slate-200" />
                    </td>
                    <td className="py-5 px-4">
                      <Skeleton className="h-4 w-40 bg-slate-200" />
                    </td>
                    <td className="py-5 px-4">
                      <Skeleton className="h-4 w-12 bg-slate-200" />
                    </td>
                    <td className="py-5 px-4">
                      <Skeleton className="h-4 w-12 bg-slate-200" />
                    </td>
                    <td className="py-5 px-4">
                      <Skeleton className="h-4 w-24 bg-slate-200" />
                    </td>
                    <td className="py-5 px-4">
                      <Skeleton className="h-7 w-20 rounded-full bg-slate-200" />
                    </td>
                    <td className="py-5 px-6 text-right">
                      <Skeleton className="h-8 w-8 rounded-full bg-slate-200 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-slate-500 font-medium">
                    No projects found
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const isChecked = selectedIds.includes(project.projectId);
                  return (
                    <tr key={project.projectId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 pl-6 pr-4 text-center">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => handleSelectOne(project.projectId, !!checked)}
                          className={`rounded border-slate-300 ${isChecked ? 'bg-[#7c3aed] border-[#7c3aed]' : ''}`}
                        />
                      </td>
                      <td className="py-5 px-4 text-[14px] text-slate-600 font-medium">
                        {project.projectId}
                      </td>
                      <td className="py-5 px-4 text-[14px] text-slate-900 font-medium">
                        {getProjectDisplayName(project)}
                      </td>
                      <td className="py-5 px-4 text-[14px] text-slate-600">
                        {project.receivedShipperFiles}
                      </td>
                      <td className="py-5 px-4 text-[14px] text-slate-600 font-medium">
                        {project.totalShipperFiles}
                      </td>
                      <td className="py-5 px-4 text-[14px] text-slate-600">
                        {formatDate(project.latestSubmittedAt)}
                      </td>
                      <td className="py-5 px-4">
                        {renderStatusBadge(project.fileReceivedStatus)}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-gray-100 text-gray-700"
                          onClick={() => navigate(`/plant/shipper-quotation/${project.leadId}`)}
                        >
                          <Eye className="w-5 h-5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t bg-white flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>Row Per Page</span>
            <Select
              value={limit.toString()}
              onValueChange={(val) => {
                setLimit(Number(val));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[70px] h-9 bg-white border border-slate-200">
                <SelectValue placeholder="20" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>Entries</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="w-8 h-8 p-0 text-slate-400 hover:text-slate-900 disabled:opacity-50 flex items-center justify-center"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "ghost"}
                  className={`w-8 h-8 p-0 rounded-full ${page === pageNum
                      ? "bg-[#f59e0b] hover:bg-[#d97706] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="ghost"
              className="w-8 h-8 p-0 text-slate-400 hover:text-slate-900 disabled:opacity-50 flex items-center justify-center"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
