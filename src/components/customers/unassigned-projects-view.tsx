import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomersProjectsListQuery } from "@/modules/customers/customers.hooks";
import { Link } from "react-router";
import AssignPlantPersonDialog from "@/components/customers/assign-plant-person-dialog";
import React from "react";

export default function UnassignedProjectsView() {
  const { data: response, isLoading } = useCustomersProjectsListQuery('not-assigned');
  const projects = response?.data?.projects || [];
  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);

  const openAssignDialog = (leadId: string) => {
    setSelectedLeadId(leadId);
    setIsAssignDialogOpen(true);
  };
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Unassigned Projects</h2>
            <p className="text-sm text-gray-500">List of pending projects that need to be assigned to a plant.</p>
          </div>
        </div>
        
        <Card className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <CardContent className="px-0 py-0">
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-gray-50 text-[12px] font-medium text-slate-500 uppercase">
                    <th className="px-4 py-3 font-medium text-slate-500">Project</th>
                    <th className="px-4 py-3 font-medium text-slate-500">Job ID</th>
                    <th className="px-4 py-3 font-medium text-slate-500">Project Name</th>
                    <th className="px-4 py-3 font-medium text-slate-500">Customer</th>
                    <th className="px-4 py-3 font-medium text-slate-500">Date Requested</th>
                    <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                    <th className="px-4 py-3 font-medium text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading projects...</td>
                    </tr>
                  ) : projects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No projects found.</td>
                    </tr>
                  ) : (
                    projects.map((item, index) => {
                      const status = item.lifecycleStatus
                        ? item.lifecycleStatus.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
                        : "Unknown";
                      const isCompleted = item.lifecycleStatus === "completed" || item.lifecycleStatus === "delivered";
                      const isWip = !isCompleted && item.lifecycleStatus !== "initial_contact";
                      const statusStyles = isCompleted
                        ? "bg-[#DCFCE7] text-[#166534]"
                        : isWip
                        ? "bg-[#FEF3C7] text-[#D97706]"
                        : "bg-[#E0F2FE] text-[#0369A1]";
                      const statusDotStyles = isCompleted
                        ? "bg-[#166534]"
                        : isWip
                        ? "bg-[#F59E0B]"
                        : "bg-[#0369A1]";
                      const cleanName = item.projectName?.replace(/\s*\d{4}-\d{2}-\d{2}T[\d-]*Z?\s*/gi, "").trim() || "Unnamed Project";
                      return (
                        <tr key={item.leadId} className="border-b border-[#E5E7EB] text-[13px] text-slate-700 last:border-b-0 hover:bg-slate-50">
                          <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">Project {index + 1}</td>
                          <td className="px-4 py-4 text-slate-500 font-mono text-xs">{item.jobId || "N/A"}</td>
                          <td className="px-4 py-4 text-slate-700">{cleanName}</td>
                          <td className="px-4 py-4 text-slate-700">{item.customerName || "Unknown"}</td>
                          <td className="px-4 py-4 text-slate-700">{item.requestedDate || "N/A"}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${statusStyles}`}>
                              <span className={`h-2 w-2 rounded-full ${statusDotStyles}`} />
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-4 flex gap-2">
                            <Link to={`/leads/${item.leadId}`}>
                              <Button variant="ghost" className="h-6 px-2 rounded-md border border-gray-200 text-xs text-[#3B82F6] hover:bg-blue-50">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" className="h-6 px-2 rounded-md border border-gray-200 text-xs text-[#3B82F6] hover:bg-blue-50" onClick={() => openAssignDialog(item.leadId)}>
                              Assign
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      <AssignPlantPersonDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        customerId={selectedLeadId}
      />
    </>
  );
}
