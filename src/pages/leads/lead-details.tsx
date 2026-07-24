import React from "react";
import {
  Building2,
  MapPin,
  Calendar,
  CircleDollarSign,
  Phone,
  Mail,
  User,
  FileText,
  MessageSquare,
  History,
  Activity,
  File,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useParams, Link } from "react-router";
import AssignSalesDialog from "@/components/leads/assign-sales-dialog";
import QuoteSummaryDialog from "@/components/leads/quote-summary-dialog";
import LeadChatTab from "./lead-chat-tab";
import LeadLifecycleTab from "./lead-lifecycle-tab";
import LeadDocumentsTab from "./lead-documents-tab";
import LeadCallHistoryTab from "./lead-call-history-tab";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLeadDetailProvider, updateLeadLifecycleProvider, addLeadNoteProvider } from "@/modules/leads/leads.api";
import { formatPhone } from "@/lib/utils";
import { useState } from "react";
import { useLeadQuotationsQuery } from "@/modules/quotations/quotations.hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeadFollowUpsTab from "./lead-follow-ups-tab";
import AddFollowUpDialog from "@/components/follow-up/add-follow-up-dialog";
import AddMeetingDialog from "@/components/meetings/add-meeting-dialog";
import LeadPaymentsTab from "./lead-payments-tab";
import LeadRfqTab from "./lead-rfq-tab";

export default function LeadDetails() {
  const navigate = useNavigate();
  const { leadId } = useParams();
  const queryClient = useQueryClient();
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic_info");
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = useState(false);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ["lead", "detail", leadId],
    queryFn: () => getLeadDetailProvider(leadId!),
    enabled: !!leadId,
  });

  const updateLifecycleMutation = useMutation({
    mutationFn: (status: string) => updateLeadLifecycleProvider(leadId!, { lifecycleStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", "detail", leadId] });
      setIsStatusOpen(false);
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: (note: string) => addLeadNoteProvider(leadId!, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", "detail", leadId] });
      setIsNotesOpen(false);
      setNoteContent("");
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading lead details...</div>;
  }

  const leadData = response?.data;
  const lead = leadData?.lead;
  const customer = leadData?.customer;

  const scoreBreakdown = lead?.leadScoring?.scoreBreakdown || {};

  const SALES_LIFECYCLE_STAGES = [
    { id: 'initial_contact', label: 'Initial\nContact' },
    { id: 'requirements_gathered', label: 'Requirements\nGathered' },
    { id: 'proposal_sent', label: 'Proposal\nSent' },
    { id: 'negotiation', label: 'Negotiation' },
    { id: 'deal_closed', label: 'Deal\nClosed' },
    { id: 'payment_done', label: 'Payment\nDone' },
    { id: 'converted_to_po', label: 'Converted\nto PO' },
    { id: 'sent_to_admin', label: 'Sent to\nAdmin' },
    { id: 'released_to_plant', label: 'Released\nto Plant' },
  ];

  const currentStepId = leadData?.lifecycle?.status || lead?.lifecycleStatus || 'initial_contact';
  let currentStepIndex = SALES_LIFECYCLE_STAGES.findIndex(s => s.id === currentStepId);
  if (currentStepIndex === -1) currentStepIndex = 0;

  const progressPercentage = Math.max(0, Math.min(100, (currentStepIndex / Math.max(1, SALES_LIFECYCLE_STAGES.length - 1)) * 100));

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-6">
        {/* Header Section */}
        <div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-900"
              onClick={() => navigate('/leads')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-bold text-gray-900">
              Leads Details - {customer?.firstName || 'Unknown'}
            </h2>
            <Button
              onClick={() => navigate(`/leads/${leadId}/edit`)}
              className="bg-[#3b82f6] hover:bg-blue-600 text-white h-7 px-3 text-xs rounded font-medium ml-2"
            >
              Edit Lead
            </Button>
          </div>
          <p className="text-sm text-gray-400 mt-1 ml-11">{lead?.jobId || leadId || 'PRO-053'}</p>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* <Button
            variant="outline"
            className="bg-white hover:bg-gray-50 border-gray-200 text-gray-600 h-9 px-4 text-sm font-normal rounded-md"
            onClick={() => setActiveTab("rfq")}
          >
            RFQ
          </Button> */}

          <AssignSalesDialog
            leadId={leadId!}
            currentSalesId={typeof lead?.assignedSales === 'object' ? lead?.assignedSales?._id : lead?.assignedSales}
            trigger={
              <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200 text-gray-600 h-9 px-4 text-sm font-normal rounded-md">
                Assign a person
              </Button>
            }
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <TabsList className="w-full flex flex-wrap justify-between bg-transparent border-b border-gray-200 p-0 h-auto rounded-none mb-6">
          <TabsTrigger
            value="basic_info"
            className="flex-1 py-3 text-sm text-gray-500 font-medium data-[state=active]:text-gray-900 !border-t-0 !border-l-0 !border-r-0 data-[state=active]:border-b-[3px] data-[state=active]:border-b-black rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Basic info
          </TabsTrigger>
          <TabsTrigger
            value="open_chat"
            className="flex-1 py-3 text-sm text-gray-500 font-medium data-[state=active]:text-gray-900 !border-t-0 !border-l-0 !border-r-0 data-[state=active]:border-b-[3px] data-[state=active]:border-b-black rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Open Chat
          </TabsTrigger>
          <TabsTrigger
            value="lifecycle"
            className="flex-1 py-3 text-sm text-gray-500 font-medium data-[state=active]:text-gray-900 !border-t-0 !border-l-0 !border-r-0 data-[state=active]:border-b-[3px] data-[state=active]:border-b-black rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Lifecycle
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="flex-1 py-3 text-sm text-gray-500 font-medium data-[state=active]:text-gray-900 !border-t-0 !border-l-0 !border-r-0 data-[state=active]:border-b-[3px] data-[state=active]:border-b-black rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Documents
          </TabsTrigger>
          <TabsTrigger
            value="follow_ups"
            className="flex-1 py-3 text-sm text-gray-500 font-medium data-[state=active]:text-gray-900 !border-t-0 !border-l-0 !border-r-0 data-[state=active]:border-b-[3px] data-[state=active]:border-b-black rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Follow-Up History
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="flex-1 py-3 text-sm text-gray-500 font-medium data-[state=active]:text-gray-900 !border-t-0 !border-l-0 !border-r-0 data-[state=active]:border-b-[3px] data-[state=active]:border-b-black rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Payment History
          </TabsTrigger>
          {/* <TabsTrigger 
            value="rfq" 
            className="flex-1 py-3 text-sm text-gray-500 font-medium data-[state=active]:text-gray-900 !border-t-0 !border-l-0 !border-r-0 data-[state=active]:border-b-[3px] data-[state=active]:border-b-black rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            RFQ
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="basic_info" className="space-y-6">
          {/* Project Overview Card */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                  <Building2 className="w-7 h-7 text-[#2563eb]" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-[#0f172a]">Project: {lead?.projectName || lead?.buildingType || 'Warehouse'}</h2>
                    <Badge className="bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7] border-none px-3 py-1 font-medium flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></div>
                      {currentStepId.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{lead?.jobId || leadId}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Building Type</p>
                  <p className="text-sm text-gray-500 mt-1">{lead?.buildingType || 'Workshop'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CircleDollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Quote Value</p>
                  <p className="text-sm text-gray-500 mt-1">${lead?.quoteValue || 0}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Created On</p>
                  <p className="text-sm text-gray-500 mt-1">{lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Location</p>
                  <p className="text-sm text-gray-500 mt-1">{lead?.location || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="bg-gray-50/50 rounded-lg p-4 space-y-3">
                  <div className="font-semibold text-gray-900 mb-1">{customer?.firstName || 'Unknown'}</div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{formatPhone(typeof customer?.phone === 'string' ? customer.phone : customer?.phone?.number)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${customer?.email}`} className="text-blue-500 hover:underline">{customer?.email || 'N/A'}</a>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">{customer?.location || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Assignment</h3>
                <div className="bg-gray-50/50 rounded-lg p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Assigned to: {typeof lead?.assignedSales === 'object' ? (lead?.assignedSales as any)?.name : (typeof lead?.assignedSales === 'string' ? lead?.assignedSales : 'Unassigned')}</p>
                    <p className="text-xs text-gray-500 mt-1">Sales Person</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Signed Contract/Agreement</h3>
                <div className="bg-gray-50/50 rounded-lg p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Signed contact/Agreement</p>
                    <p className="text-xs text-gray-500 mt-1">Signed on: N/A</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Step Section */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#0f172a] mb-8">Progress Step</h3>

            {/* Timeline Component */}
            <div className="relative mb-12 px-4">
              <div className="absolute top-4 left-6 right-6 h-[2px] bg-gray-200">
                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <div className="relative flex justify-between">
                {SALES_LIFECYCLE_STAGES.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isPending = index > currentStepIndex;

                  let circleClass = "";
                  let statusText = "";
                  if (isCompleted) {
                    circleClass = "bg-[#16a34a] text-white";
                    statusText = "Done";
                  } else if (isCurrent) {
                    circleClass = "bg-[#2563eb] text-white ring-4 ring-blue-50";
                    statusText = "Current\nStep";
                  } else {
                    circleClass = "bg-white border-2 border-gray-200 text-gray-400";
                    statusText = "-";
                  }

                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm relative z-10 ${circleClass}`}>
                        {index + 1}
                      </div>
                      <div className="mt-3 text-center">
                        <p className={`text-xs font-semibold ${isPending ? 'text-gray-400' : 'text-gray-900'} whitespace-pre-line`}>
                          {step.label}
                        </p>
                        <p className={`text-[10px] mt-1 whitespace-pre-line ${isPending ? 'text-gray-400' : 'text-gray-500'}`}>
                          {statusText}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Step Info */}
            <div className="bg-gray-50/50 border rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="pr-6 border-r border-gray-200 border-dashed">
                <h4 className="text-sm font-semibold text-gray-900">Progress ({currentStepIndex + 1} of {SALES_LIFECYCLE_STAGES.length})</h4>
                <p className="text-sm text-gray-500 mt-2 capitalize">Current step: {currentStepId.replace(/_/g, ' ')}</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Lead Generated</p>
                    <p className="text-xs text-gray-500 mt-0.5">{lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Current Phase</p>
                    <p className="text-xs text-gray-500 mt-0.5">{lead?.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pr-6 border-r border-gray-200 border-dashed">
                <div>
                  <p className="text-sm font-medium text-gray-900">Assigned Sales</p>
                  <p className="text-sm text-gray-600 mt-0.5">{typeof lead?.assignedSales === 'object' ? (lead?.assignedSales as any)?.name : (typeof lead?.assignedSales === 'string' ? lead?.assignedSales : 'Unassigned')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Lead Status</p>
                  <Badge className="mt-1 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-50 font-normal px-2 py-0.5">
                    {lead?.leadScoring?.temperature || 'Unknown'}
                  </Badge>
                </div>
              </div>

              {/* <div className="flex flex-col">
            <h4 className="text-sm font-medium text-gray-900">Summary</h4>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed flex-1">
              {lead?.notes || lead?.aiContextSummary || 'No summary available'}
            </p>
          </div> */}
            </div>

            <div className="flex gap-3">
              <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">Update Status</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-sm font-semibold">Update Step Status</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-900">Select Current Status</Label>
                      <Select
                        onValueChange={(val) => updateLifecycleMutation.mutate(val)}
                        disabled={updateLifecycleMutation.isPending}
                        defaultValue={currentStepId}
                      >
                        <SelectTrigger className="w-full text-sm font-medium">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {SALES_LIFECYCLE_STAGES.map((stage) => (
                            <SelectItem key={stage.id} value={stage.id}>
                              {stage.label.replace('\n', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700">Add Notes</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-sm font-semibold">Add Notes</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-900">Notes</Label>
                      <Textarea
                        placeholder="Write your note here..."
                        className="h-28 resize-none text-sm"
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        disabled={addNoteMutation.isPending}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <Button variant="outline" className="border-gray-200" onClick={() => setIsNotesOpen(false)}>Cancel</Button>
                    <Button
                      className="bg-[#6366f1] hover:bg-[#4f46e5] text-white"
                      disabled={!noteContent.trim() || addNoteMutation.isPending}
                      onClick={() => addNoteMutation.mutate(noteContent)}
                    >
                      {addNoteMutation.isPending ? "Adding..." : "Add Note"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Grid for Bottom Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Project Status */}
            <div className="bg-white rounded-xl border shadow-sm p-6 flex flex-col items-center">
              <h3 className="text-lg font-bold text-[#0f172a] self-start mb-6">Project Status</h3>
              <div className="relative w-40 h-40 mb-6">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    className="text-gray-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="text-blue-600"
                    strokeDasharray={`${((currentStepIndex + 1) / SALES_LIFECYCLE_STAGES.length) * 100}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm text-gray-500 font-medium">Step</span>
                  <span className="text-3xl font-bold text-gray-900 mt-1">{currentStepIndex + 1}</span>
                  <span className="text-xs text-gray-500 mt-1">of {SALES_LIFECYCLE_STAGES.length}</span>
                </div>
              </div>

              <div className="w-full space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Current step</p>
                  <p className="text-sm font-medium text-blue-600 mt-1 capitalize">{currentStepId.replace(/_/g, ' ')}</p>
                </div>
                <div className="flex gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Started on</p>
                    <p className="text-xs text-gray-500 mt-0.5">{lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Estimate Completion</p>
                  <p className="text-xs text-gray-500 mt-0.5">N/A</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#0f172a] mb-6">Recent Activity</h3>
              <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-4">
                {leadData?.auditLog && leadData.auditLog.length > 0 ? (
                  leadData.auditLog.slice(0, 5).map((log: any, i: number) => (
                    <div key={log._id || i} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-purple-500"></div>
                      <p className="text-sm font-medium text-gray-900">Action: {log.action}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recent activity</p>
                )}
              </div>
            </div>

            {/* Notes History */}
            <div className="bg-white rounded-xl border shadow-sm p-6 flex flex-col h-full max-h-[400px]">
              <h3 className="text-lg font-bold text-[#0f172a] mb-6 border-b pb-4 shrink-0">Notes History</h3>
              <div className="space-y-4 text-sm text-gray-500 overflow-y-auto flex-1 pr-2">
                {leadData?.leadNotes && leadData.leadNotes.length > 0 ? (
                  leadData.leadNotes.map((noteItem: any) => (
                    <div key={noteItem._id} className="bg-gray-50 p-4 rounded-lg border border-gray-100 relative">
                      <p className="text-gray-800 whitespace-pre-wrap mb-2">{noteItem.note}</p>
                      <div className="flex justify-between items-center text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                        <span className="font-medium text-gray-500">{noteItem.addedBy?.name || 'System'}</span>
                        <span>{new Date(noteItem.addedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic">No notes added yet.</p>
                )}
              </div>
            </div>
          </div>


          {/* Lead Scoring Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border shadow-sm p-6 flex flex-col justify-center">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">LEAD SCORING</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-red-600">{lead?.leadScoring?.score || 0}</span>
                <span className="text-xl font-bold text-gray-900">/100</span>
              </div>
              <Badge className="bg-purple-50 text-purple-600 hover:bg-purple-50 border-none w-fit px-4 font-normal">
                {lead?.leadScoring?.temperature || 'Unknown'}
              </Badge>
            </div>

            <div className="md:col-span-3 bg-white rounded-xl border shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">SCORE BREAKDOWN</h3>

              <div className="space-y-6">
                {Object.keys(scoreBreakdown).map((key) => {
                  const item = scoreBreakdown[key];
                  const maxPoints = 25;
                  const percentage = Math.min(100, Math.max(0, (item.points / maxPoints) * 100));

                  return (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-sm font-bold text-amber-500">{item.points} pts</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-400">{item.reason}</p>
                    </div>
                  );
                })}

                {Object.keys(scoreBreakdown).length === 0 && (
                  <p className="text-sm text-gray-500">No score breakdown available.</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="open_chat" className="mt-6">
          <LeadChatTab lead={{
            id: lead?.jobId || leadId || '',
            backendId: leadId,
            name: customer?.firstName || 'Unknown',
            assignedToName: lead?.assignedSales?.name || lead?.assignedSales || 'Unassigned'
          }} />
        </TabsContent>

        <TabsContent value="call_history" className="mt-6">
          <LeadCallHistoryTab lead={{ id: lead?.jobId || leadId || '', name: customer?.firstName || lead?.name || 'Unknown' }} />
        </TabsContent>

        <TabsContent value="lifecycle" className="mt-6">
          <LeadLifecycleTab lead={{ id: lead?.jobId || leadId || '', name: customer?.firstName || lead?.name || 'Unknown', progress: currentStepIndex + 1 }} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <LeadDocumentsTab leadId={leadId!} />
        </TabsContent>

        <TabsContent value="follow_ups" className="mt-6">
          <LeadFollowUpsTab leadId={leadId!} />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <LeadPaymentsTab
            leadId={leadId!}
            invoices={leadData?.payments?.invoices || []}
          />
        </TabsContent>

        {/* <TabsContent value="rfq" className="mt-6">
          <LeadRfqTab leadId={leadId!} />
        </TabsContent> */}
      </Tabs>

      {/* Dialog Components */}
      <QuoteSummaryDialog
        open={isQuoteDialogOpen}
        onOpenChange={setIsQuoteDialogOpen}
        leadId={leadId!}
      />

      <AddFollowUpDialog
        open={isAddFollowUpOpen}
        onOpenChange={setIsAddFollowUpOpen}
        defaultLeadId={leadId}
        defaultEmployeeId={typeof lead?.assignedSales === 'object' ? lead?.assignedSales?._id : lead?.assignedSales}
        disabledLeadId={true}
      />

      <AddMeetingDialog
        open={isAddMeetingOpen}
        onOpenChange={setIsAddMeetingOpen}
        defaultLeadId={leadId}
        defaultEmployeeId={typeof lead?.assignedSales === 'object' ? lead?.assignedSales?._id : lead?.assignedSales}
        disabledLeadId={true}
      />

    </div>
  );
}
