import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCustomersProjectsListQuery } from "@/modules/customers/customers.hooks";
import { Link } from "react-router";


export default function TotalProjectsView() {
  const [scope, setScope] = useState("total");
  const { data: response, isLoading } = useCustomersProjectsListQuery(scope);
  const projects = response?.data?.projects || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Total Projects</h2>
        <select
          value={scope}
          onChange={e => setScope(e.target.value)}
          className="rounded border border-gray-300 bg-white p-2"
        >
          <option value="total">Total</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="not-assigned">Not Assigned</option>
        </select>
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
                  <th className="px-4 py-3 font-medium text-slate-500">Budget</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Loading projects...
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No projects found.
                    </td>
                  </tr>
                ) : (
                  projects.map((item, index) => {
                    const status = item.lifecycleStatus 
                      ? item.lifecycleStatus.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
                      : "Unknown";
                    
                    // Simple logic to map status to colors
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

                    return (
                      <tr key={item.leadId} className="border-b border-[#E5E7EB] text-[13px] text-slate-700 last:border-b-0 hover:bg-slate-50">
                        <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">Project {index + 1}</td>
                        <td className="px-4 py-4 text-slate-500 font-mono text-xs">{item.jobId || "N/A"}</td>
                        <td className="px-4 py-4 text-slate-700">
                          {item.projectName 
                            ? item.projectName.replace(/\s*\d{4}-\d{2}-\d{2}T[\d-]*Z?\s*/gi, "").trim() || "Unnamed Project"
                            : "Unnamed Project"}
                        </td>
                        <td className="px-4 py-4 text-slate-700">{item.customerName || "Unknown"}</td>
                        <td className="px-4 py-4 text-slate-700">
                          {item.quoteValue ? `$${item.quoteValue.toLocaleString()}` : "$0"}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${statusStyles}`}>
                            <span className={`h-2 w-2 rounded-full ${statusDotStyles}`} />
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Link to={`/leads/${item.leadId}`}>
                            <Button variant="ghost" className="h-6 w-6 rounded-full p-0 text-[#3B82F6] hover:bg-blue-50 hover:text-blue-700">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
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
  );
}
