import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import AddFollowUpDialog from "@/components/follow-up/add-follow-up-dialog";
import AddMeetingDialog from "@/components/meetings/add-meeting-dialog";
import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import { useMeetingsQuery } from "@/modules/meetings/meetings.hooks";
import { useAdminEmployeesQuery } from "@/modules/employees/employees.hooks";
import dayjs from "dayjs";
import { toast } from "sonner";

export default function LeadFollowUpsTab({ leadId }: { leadId: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = useState(false);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);

  const { data: leadData, isLoading } = useLeadDetailQuery(leadId);
  const followUps = leadData?.data?.followUps || [];
  const auditLog = leadData?.data?.auditLog || [];

  const formatActionString = (action: string) => {
    if (!action) return "";
    return action
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const combinedLog = [
    ...followUps.map((f: any) => ({
      _id: f._id,
      date: f.followUpDate || f.createdAt,
      type: f.modeOfContact || "followup",
      user: f.assignedTo || f.createdBy,
      status: f.status,
      outcome: f.notes,
      nextFollowUp: f.priority,
      isFollowUp: true,
      rawAction: null,
      metadata: null
    })),
    ...auditLog.map((a: any) => ({
      _id: a._id,
      date: a.createdAt,
      type: a.type,
      user: a.performedBy,
      status: "completed",
      outcome: formatActionString(a.action),
      nextFollowUp: "—",
      isFollowUp: false,
      rawAction: a.action,
      metadata: a.metadata
    }))
  ].sort((a, b) => {
    const timeA = new Date(a.date || 0).getTime();
    const timeB = new Date(b.date || 0).getTime();
    return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
  });

  const filteredLogs = combinedLog.filter((item: any) =>
    item.outcome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadgeColor = (type: string) => {
    const lowerType = type?.toLowerCase() || "";
    if (lowerType === "invoice") return "bg-[#a855f7] hover:bg-[#9333ea] text-white"; // Purple
    if (lowerType === "meeting") return "bg-[#3b82f6] hover:bg-[#2563eb] text-white"; // Blue
    if (lowerType === "plant" || lowerType === "po" || lowerType === "lead") return "bg-[#3b82f6] hover:bg-[#2563eb] text-white"; // Blue
    return "bg-[#3b82f6] hover:bg-[#2563eb] text-white";
  };

  const getFormattedOutcome = (item: any) => {
    if (item.isFollowUp) return item.outcome || "—";

    // Format audit log outcomes to match Sales panel
    if (item.type?.toLowerCase() === "invoice" && item.metadata?.invoiceNumber) {
      const actionSuffix = item.rawAction?.split(".")[1] || "";
      return `Invoice ${item.metadata.invoiceNumber} ${actionSuffix}`;
    }
    if (item.rawAction?.startsWith("lead.")) {
      const parts = item.rawAction.split(".");
      return `Lead ${parts[1].charAt(0).toUpperCase() + parts[1].slice(1)}`;
    }
    return item.outcome || "—";
  };

  const { data: meetingsResponse } = useMeetingsQuery({ leadId });
  const leadMeetings = meetingsResponse?.data?.meetings || [];

  const { data: employeesResponse } = useAdminEmployeesQuery();
  const employees = employeesResponse?.data?.employees || [];

  const getEmployeeName = (idOrObj: any) => {
    if (!idOrObj) return "System";
    if (typeof idOrObj === "object" && idOrObj.name) return idOrObj.name;
    const id = typeof idOrObj === "object" ? idOrObj._id : idOrObj;
    const emp = employees.find((e: any) => e._id === id);
    return emp ? emp.name : "System";
  };

  const getEmployeeRole = (idOrObj: any) => {
    if (!idOrObj) return "System";
    if (typeof idOrObj === "object" && idOrObj.role) return idOrObj.role;
    const id = typeof idOrObj === "object" ? idOrObj._id : idOrObj;
    const emp = employees.find((e: any) => e._id === id);
    return emp ? emp.role : "System";
  };

  const assignedSalesId = typeof leadData?.data?.lead?.assignedSales === 'object' ? leadData?.data?.lead?.assignedSales?._id : leadData?.data?.lead?.assignedSales;

  const handleAddFollowUpClick = () => {
    if (!assignedSalesId) {
      toast.error("Please assign this lead to sales then you create a followup");
      return;
    }
    setIsAddFollowUpOpen(true);
  };

  const handleScheduleMeetingClick = () => {
    if (!assignedSalesId) {
      toast.error("Please assign this lead to sales then you schedule a meeting");
      return;
    }
    setIsAddMeetingOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Follow Up Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[250px]">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Follow Up</h3>
              <p className="text-sm text-gray-500 mt-0.5">Recent activities</p>
            </div>
            <Button
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-9 px-4 rounded-md"
              onClick={handleAddFollowUpClick}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Follow Up
            </Button>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto">
            {followUps.length > 0 ? (
              followUps.slice(0, 3).map((item: any) => (
                <div key={item._id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${item.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{item.modeOfContact || "Follow up"}</p>
                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{item.notes}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-xs text-gray-500">
                        {dayjs(item.followUpDate).format("MMM DD, YYYY h:mm A")}
                      </p>
                      <span className="text-gray-300">•</span>
                      <p className="text-xs text-gray-500 capitalize">{item.status || "Pending"}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-500">No follow-ups recorded.</p>
              </div>
            )}
          </div>
        </div>

        {/* Meetings Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[250px]">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Meetings</h3>
            </div>
            <Button
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-9 px-4 rounded-md"
              onClick={handleScheduleMeetingClick}
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto">
            {leadMeetings.length > 0 ? (
              leadMeetings.slice(0, 3).map((meeting: any) => (
                <div key={meeting._id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${meeting.status === 'completed' ? 'bg-green-500' : 'bg-purple-500'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 capitalize">{meeting.title || "Meeting"}</p>
                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{meeting.notes || "No notes provided"}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <p className="text-xs text-gray-500">
                        {dayjs(meeting.meetingTime).format("MMM DD, YYYY h:mm A")}
                      </p>
                      <span className="text-gray-300">•</span>
                      <p className="text-xs text-gray-500 capitalize">{meeting.mode || "Online"}</p>
                      <span className="text-gray-300">•</span>
                      <p className="text-xs text-gray-500 capitalize">{meeting.status || "Scheduled"}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-500">No meetings recorded.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div>
            <h3 className="text-base font-bold text-gray-900">Lead Follow up Activity Log</h3>
            <p className="text-sm text-gray-500 mt-0.5">Search and review follow up activity</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                placeholder="Search by Lead, Client or Project"
                className="w-full sm:w-[280px] h-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="ghost" className="h-9 px-4 font-medium text-gray-900 border border-transparent hover:border-gray-200">
              Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-gray-700 text-xs font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Follow up Date</th>
                <th className="px-6 py-4 whitespace-nowrap">Follow up Type</th>
                <th className="px-6 py-4 whitespace-nowrap">Followed up by</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap">Outcome</th>
                <th className="px-6 py-4 whitespace-nowrap">Next Follow up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((item: any) => (
                  <tr key={item._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{dayjs(item.date).format("MMM DD, YYYY")}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{dayjs(item.date).format("h:mm A")}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getBadgeColor(item.type)} border-none rounded-full px-3 py-0.5 text-xs font-medium capitalize`}>
                        {item.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{getEmployeeName(item.user)}</div>
                      <div className="text-gray-400 text-xs mt-0.5 capitalize">{getEmployeeRole(item.user)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={item.status === 'completed' ? "bg-[#16a34a] hover:bg-[#16a34a] text-white border-none rounded-full px-3 py-0.5 text-xs font-medium capitalize" : "bg-amber-500 hover:bg-amber-600 text-white border-none rounded-full px-3 py-0.5 text-xs font-medium capitalize"}>
                        {item.status || "Pending"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={item.isFollowUp ? "text-gray-900" : "text-amber-500 text-xs"}>{getFormattedOutcome(item)}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium capitalize">
                      {item.nextFollowUp}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No activity found for this lead.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


      </div>
      <AddFollowUpDialog
        open={isAddFollowUpOpen}
        onOpenChange={setIsAddFollowUpOpen}
        defaultLeadId={leadId}
        defaultEmployeeId={typeof leadData?.data?.lead?.assignedSales === 'object' ? leadData?.data?.lead?.assignedSales?._id : leadData?.data?.lead?.assignedSales}
        disabledLeadId={true}
      />
      <AddMeetingDialog
        open={isAddMeetingOpen}
        onOpenChange={setIsAddMeetingOpen}
        defaultLeadId={leadId}
        defaultEmployeeId={typeof leadData?.data?.lead?.assignedSales === 'object' ? leadData?.data?.lead?.assignedSales?._id : leadData?.data?.lead?.assignedSales}
        disabledLeadId={true}
      />
    </div>
  );
}
