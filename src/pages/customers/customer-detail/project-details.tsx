import {
  ArrowLeft,
  Upload,
  Building2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  User,
  FileText,
  DollarSign,
  Briefcase,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import { formatBusinessUnit } from "@/modules/leads/business-unit";
import { formatInstallAddress } from "@/lib/address";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SuccessDialog from "@/components/success-dialog";
import UpdateStatusDialog from "./update-status-dialog";
import TerminateProjectDialog from "./terminate-project-dialog";
import { AddNotesDialog, type AddNotesFormValues } from "./add-notes-dialog";
import { useNavigate, useParams, useLocation } from "react-router";
import { useAppBack } from "@/modules/navigation";
import { useState, useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addLeadNoteProvider } from "@/modules/leads/leads.api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  PLANT_LIFECYCLE_STAGES,
  PLANT_LIFECYCLE_STATUS_CONFIG,
  getPlantLifecycleStatusConfig,
  getPlantLifecycleStageIndex,
} from "@/modules/plant/projects.lifecycle";

import UploadBomFileDialog from "@/plant/components/UploadBomFileDialog";
import UploadDrawingsModal from "@/plant/components/UploadDrawingsModal";

const quickActionButtons1 = [
  { label: "View Invoices", path: "project-invoices" },
  { label: "View BOM", path: "project-bom" },
  { label: "View Drawings & Photos", path: "project-drawings" },
  { label: "View Payments", path: "project-payments" },
];

const quickActionButtons2 = [
  { label: "Material Delivery", path: "material-delivery" },
  { label: "View Quotation", path: "project-quotation" },
  { label: "View Agreement", path: "/customers/contracts/1" },
  { label: "View Shipper Files", path: "project-shipper-files" },
];

const plantLifecycleSteps = PLANT_LIFECYCLE_STAGES.map((stageKey, idx) => {
  const config = PLANT_LIFECYCLE_STATUS_CONFIG[stageKey];
  return {
    id: idx + 1,
    value: stageKey,
    label: config.label.replace(/\s+/g, "\n"),
    fullLabel: config.label,
  };
});

export default function ProjectDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { goBack } = useAppBack();
  const { id, projectId } = useParams<{ id: string; projectId: string }>();
  // Use projectId if available, otherwise fallback to id
  const leadId = projectId || id || "";

  const { data: leadData, isLoading: isLeadLoading } =
    useLeadDetailQuery(leadId);
  const project = leadData?.data?.lead;
  const customer = leadData?.data?.customer;

  const customerId =
    id ||
    customer?._id ||
    customer?.customerId ||
    project?.customerId ||
    leadId;
  const basePath = `/customers/${customerId}`;

  const currentStatusConfig = getPlantLifecycleStatusConfig(
    project?.lifecycleStatus,
  );
  const initialStepId = getPlantLifecycleStageIndex(project?.lifecycleStatus);

  const queryClient = useQueryClient();
  const [selectedStepId, setSelectedStepId] = useState(initialStepId);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successDialogTitle] = useState("Status Updated Successfully");
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [bomModalOpen, setBomModalOpen] = useState(false);
  const [drawingsModalOpen, setDrawingsModalOpen] = useState(false);

  useEffect(() => {
    if (project?.lifecycleStatus) {
      setSelectedStepId(getPlantLifecycleStageIndex(project.lifecycleStatus));
    }
  }, [project?.lifecycleStatus]);

  const addNoteMutation = useMutation({
    mutationFn: (note: string) => addLeadNoteProvider(leadId, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", "detail", leadId] });
      queryClient.invalidateQueries({ queryKey: ["lead", "detail", leadId] });
      toast.success("Note added successfully");
    },
    onError: () => {
      toast.error("Failed to add note");
    },
  });

  const handleSaveNote = (data: AddNotesFormValues) => {
    const noteText = data.title ? `${data.title}: ${data.notes}` : data.notes;
    addNoteMutation.mutate(noteText);
  };

  const apiNotes = leadData?.data?.leadNotes || [];
  const auditLogs = leadData?.data?.auditLog || [];

  const projectPhotos = useMemo(() => {
    const directPhotos = (project as any)?.photos;
    if (Array.isArray(directPhotos) && directPhotos.length > 0) {
      return directPhotos.filter(
        (p: unknown) => typeof p === "string" && !p.includes("placehold.co"),
      );
    }
    const buildings = leadData?.data?.buildings || [];
    const extracted: string[] = [];
    buildings.forEach((b: any) => {
      (b.drawings || []).forEach((d: any) => {
        const url = d.fileUrl || "";
        const name = d.fileName || "";
        if (
          (/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(url) ||
            /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(name)) &&
          !url.includes("placehold.co")
        ) {
          extracted.push(url);
        }
      });
    });
    return extracted;
  }, [project, leadData]);

  const handleOpenStatusDialog = () => {
    setStatusDialogOpen(true);
  };

  if (isLeadLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1D51A4]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={() => goBack()}
            className="px-4 bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">
            Project Details - {project?.projectName || "Unnamed Project"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-[#1D51A4] text-[#1D51A4] hover:bg-slate-50"
            onClick={() => setBomModalOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload BOM File
          </Button>
          <Button
            variant="outline"
            className="border-[#1D51A4] text-[#1D51A4] hover:bg-slate-50"
            onClick={() => setDrawingsModalOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Building Drawings
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActionButtons1.map((btn) => (
            <Button
              key={btn.label}
              variant="default"
              className="bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white rounded-[6px] shadow-sm"
              onClick={() =>
                navigate(`${basePath}/${btn.path}/${leadId}`, {
                  state: { from: location.pathname + location.search },
                })
              }
            >
              {btn.label}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActionButtons2.map((btn) => (
            <Button
              key={btn.label}
              variant="default"
              className="bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white rounded-[6px] shadow-sm"
              onClick={() => {
                const target = btn.path.startsWith("/") ? btn.path : `${basePath}/${btn.path}/${leadId}`;
                navigate(target, {
                  state: { from: location.pathname + location.search },
                });
              }}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Basic Info Card */}
      <Card className="">
        <CardHeader className="border-b  flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#EEF2FC]">
              <Building2 className="h-6 w-6 text-[#1D51A4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-semibold text-slate-800">
                  {project?.projectName || "Unnamed Project"}
                </h2>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium border",
                    currentStatusConfig.badgeClassName,
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                  {currentStatusConfig.label}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs font-normal border-slate-200 text-slate-700 bg-slate-50"
                >
                  {project?.businessUnitLabel || formatBusinessUnit(project?.businessUnit)}
                </Badge>
              </div>
              <p className="text-[13px] text-slate-500 mt-1">
                {project?.jobId ||
                  project?.projectId ||
                  (project?._id
                    ? `PRJ-${project._id.slice(-6).toUpperCase()}`
                    : "PRJ-001")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="bg-[#F5B700] hover:bg-[#F5B700]/90 text-white rounded-[6px]"
              onClick={() =>
                navigate(`${basePath}/budget-planning/${leadId}`, {
                  state: { from: location.pathname + location.search },
                })
              }
            >
              Budget Planning
            </Button>
            <Button
              variant="secondary"
              className="bg-[#475569] text-white hover:bg-[#475569]/90 rounded-[6px]"
              onClick={() => setTerminateDialogOpen(true)}
            >
              Project Terminate
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pb-4 border-b">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] text-slate-500">Business Unit</p>
                <p className="text-[14px] font-medium text-slate-800">
                  {project?.businessUnitLabel || formatBusinessUnit(project?.businessUnit)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] text-slate-500">Building Type</p>
                <p className="text-[14px] font-medium text-slate-800">
                  {project?.buildingType || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] text-slate-500">Quote Value</p>
                <p className="text-[14px] font-medium text-slate-800">
                  {project?.quoteValue
                    ? `$${project.quoteValue.toLocaleString()}`
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] text-slate-500">Created On</p>
                <p className="text-[14px] font-medium text-slate-800">
                  {project?.createdAt
                    ? new Date(project.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] text-slate-500">Location</p>
                <p className="text-[14px] font-medium text-slate-800">
                  {formatInstallAddress(project?.installAddress, project?.location || "N/A")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-[14px] font-semibold text-slate-800">
                Contact Information
              </h3>
              <div className="bg-[#F8FAFC] rounded-[8px] p-4 flex gap-4">
                <div className="flex-1 space-y-2">
                  <p className="text-[14px] font-medium text-slate-800 mb-1">
                    {customer?.firstName || customer?.company || "Unknown Customer"}
                  </p>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex text-[13px]">
                      <span className="text-slate-500 w-16">Phone</span>
                      <span className="font-medium text-slate-800">
                        {customer?.phone?.number
                          ? `${customer.phone.countryCode || ""} ${customer.phone.number}`.trim()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex text-[13px]">
                      <span className="text-slate-500 w-16">Email</span>
                      <a
                        href={customer?.email ? `mailto:${customer.email}` : "#"}
                        className="font-medium text-[#1D51A4] hover:underline"
                      >
                        {customer?.email || "N/A"}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col text-[13px]">
                      <span className="text-slate-500 w-16">Address</span>
                      <span className="font-medium text-slate-800">
                        {customer?.location || formatInstallAddress(project?.installAddress, project?.location || "N/A")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[14px] font-semibold text-slate-800">
                Assignment
              </h3>
              <div className="bg-[#F8FAFC] rounded-[8px] p-4 flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A] shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-slate-800">
                    Assigned to: {project?.assignedSales?.name || "Unassigned"}
                  </p>
                  <p className="text-[13px] text-slate-500 mt-1">
                    1 person working on this lead
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[14px] font-semibold text-slate-800">
                Signed Contract/Agreement
              </h3>
              <div className="bg-[#F8FAFC] rounded-[8px] p-4 flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A] shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-slate-800">
                    Signed contract/Agreement
                  </p>
                  <p className="text-[13px] text-slate-500 mt-1">
                    Status: {project?.isTerminated ? "Terminated" : "Active"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Project Lifecycle */}
      <Card className="">
        <CardHeader>
          <CardTitle>Project Lifecycle</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="relative min-w-[900px] mb-8 overflow-x-auto pb-4">
            <div className="absolute top-[11px] left-3 right-3 h-[2px] bg-[#E2E8F0] -z-10"></div>
            <div
              className="absolute top-[11px] left-3 h-[2px] bg-[#1D51A4] -z-10 transition-all duration-300"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(
                    100,
                    ((selectedStepId - 1) / (plantLifecycleSteps.length - 1)) *
                      100,
                  ),
                )}%`,
              }}
            ></div>

            <div className="flex justify-between">
              {plantLifecycleSteps.map((step) => {
                const isCompleted = step.id < selectedStepId;
                const isCurrent = step.id === selectedStepId;

                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center group relative w-16 cursor-pointer"
                    onClick={() => setSelectedStepId(step.id)}
                  >
                    <div
                      className={`flex h-[24px] w-[24px] items-center justify-center rounded-full text-[12px] font-semibold mb-2 z-10 transition-colors
                      ${
                        isCompleted
                          ? "bg-[#16A34A] text-white border-2 border-white"
                          : isCurrent
                            ? "bg-[#1D51A4] text-white border-2 border-white"
                            : "bg-white border-2 border-[#E2E8F0] text-slate-400"
                      }`}
                    >
                      {step.id}
                    </div>
                    <div className="text-center font-medium">
                      <p
                        className={`text-[11px] whitespace-pre-line leading-tight ${isCurrent ? "text-[#1D51A4] font-bold" : "text-slate-600"}`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-[#F8FAFC] rounded-[8px] p-5 mb-5 border border-slate-100">
            <div>
              <p className="text-[14px] font-semibold text-slate-800 mb-1">
                {plantLifecycleSteps.find((s) => s.id === selectedStepId)
                  ?.fullLabel || "Production Planning"}{" "}
                (Step {selectedStepId} of {plantLifecycleSteps.length})
              </p>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Current manufacturing and processing phase for this project
              </p>
            </div>

            <div>
              <div className="flex items-start gap-3 mb-4">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[12px] text-slate-500">Created Date</p>
                  <p className="text-[13px] font-medium text-slate-800">
                    {project?.createdAt
                      ? new Date(project.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[12px] text-slate-500">Last Updated</p>
                  <p className="text-[13px] font-medium text-slate-800">
                    {project?.updatedAt
                      ? new Date(project.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <p className="text-[12px] text-slate-500 mb-0.5">Assigned To</p>
                <p className="text-[13px] font-medium text-slate-800">
                  {project?.assignedSales?.name || "Plant Team"}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-slate-500 mb-0.5">Stage</p>
                <span
                  className={cn(
                    "text-[12px] font-medium inline-flex items-center px-2 py-0.5 rounded-[4px] border",
                    currentStatusConfig.badgeClassName,
                  )}
                >
                  {currentStatusConfig.label}
                </span>
              </div>
            </div>

            <div>
              <p className="text-[12px] text-slate-500 mb-1">Next Step</p>
              <p className="text-[13px] font-medium text-slate-800">
                {plantLifecycleSteps.find((s) => s.id === selectedStepId + 1)
                  ?.fullLabel || "Delivered / Completed"}
              </p>
              <p className="text-[12px] text-slate-500 mt-1">
                Upcoming after completion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="default"
              className="bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white rounded-[6px]"
              onClick={handleOpenStatusDialog}
            >
              Update Step Status
            </Button>
            <AddNotesDialog onSave={handleSaveNote} />
          </div>

          <UpdateStatusDialog
            open={statusDialogOpen}
            currentStepId={selectedStepId}
            steps={plantLifecycleSteps}
            onOpenChange={setStatusDialogOpen}
            onSave={(stepId) => {
              setSelectedStepId(stepId);
              setSuccessDialogOpen(true);
            }}
          />

          <SuccessDialog
            open={successDialogOpen}
            onClose={() => setSuccessDialogOpen(false)}
            title={successDialogTitle}
          />
        </CardContent>
      </Card>

      {/* Grid: Status, Activity, Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm p-6 flex flex-col items-center justify-center text-center min-w-0">
          <div className="w-full flex justify-start mb-4">
            <h3 className="text-[16px] font-bold text-slate-800">
              Project Status
            </h3>
          </div>

          <div className="relative w-32 h-32 mb-6">
            {/* SVG Circle Progress */}
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-slate-200"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={
                  251.2 - 251.2 * (selectedStepId / plantLifecycleSteps.length)
                }
                className="text-[#1D51A4] transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[12px] text-slate-500">Step</span>
              <span className="text-[28px] font-bold text-slate-800 leading-none">
                {selectedStepId}
              </span>
              <span className="text-[11px] text-slate-500">
                of {plantLifecycleSteps.length}
              </span>
            </div>
          </div>

          <div className="w-full text-left space-y-4">
            <div>
              <p className="text-[12px] text-slate-500">Current step</p>
              <p className="text-[14px] font-medium text-[#1D51A4]">
                {plantLifecycleSteps.find((s) => s.id === selectedStepId)
                  ?.fullLabel || "In Production"}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-slate-600" />
                <p className="text-[13px] font-semibold text-slate-800">
                  Created on
                </p>
              </div>
              <p className="text-[13px] text-slate-500 ml-6">
                {project?.createdAt
                  ? new Date(project.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-800 mb-1">
                Status
              </p>
              <p className="text-[13px] text-slate-500">
                {currentStatusConfig.label}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm p-6 min-w-0 max-h-[400px] flex flex-col">
          <h3 className="text-[16px] font-bold text-slate-800 mb-6 shrink-0 border-b pb-4">
            Recent Activity
          </h3>
          <div className="space-y-6 overflow-y-auto overflow-x-hidden flex-1 pr-1">
            {auditLogs.length > 0 ? (
              <div className="relative pl-6 space-y-6">
                <div className="absolute left-[9px] top-2 bottom-2 w-[1px] bg-slate-200"></div>
                {auditLogs.slice(0, 10).map((log: any, i: number) => (
                  <div key={log._id || i} className="relative min-w-0">
                    <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-white border-[3px] border-[#8B5CF6]"></div>
                    <p className="text-[13px] font-medium text-slate-800 break-words [overflow-wrap:anywhere]">
                      {log.action}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No recent activity.</p>
            )}
          </div>
        </Card>

        <Card className="rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm p-6 flex flex-col h-full max-h-[400px] min-w-0">
          <h3 className="text-[16px] font-bold text-slate-800 mb-4 border-b pb-4 shrink-0">Notes</h3>
          <div className="space-y-3 text-[13px] text-slate-600 overflow-y-auto overflow-x-hidden flex-1 pr-1">
            {apiNotes.length === 0 ? (
              <p className="text-slate-400 italic">No notes added yet.</p>
            ) : (
              apiNotes.map((noteItem: any, index: number) => (
                <div
                  key={noteItem._id || index}
                  className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-1.5 min-w-0 overflow-hidden"
                >
                  <p className="whitespace-pre-line text-[13px] text-slate-700 break-words [overflow-wrap:anywhere]">
                    {noteItem.note}
                  </p>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1.5 border-t border-slate-200/60 gap-2">
                    <span
                      className="font-medium text-slate-500 truncate"
                      title={noteItem.addedBy?.name || "System"}
                    >
                      {noteItem.addedBy?.name || "System"}
                    </span>
                    <span className="shrink-0">
                      {noteItem.addedAt
                        ? new Date(noteItem.addedAt).toLocaleString()
                        : ""}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Project Photos */}
      <Card className="rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm p-6">
        <h3 className="text-[16px] font-bold text-slate-800 mb-6">
          Project Photos (Latest)
        </h3>
        {projectPhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {projectPhotos.map((url: string, i: number) => (
              <div
                key={i}
                className="aspect-video bg-slate-100 rounded-[8px] overflow-hidden border border-slate-200"
              >
                <img
                  src={url}
                  alt={`Project photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No project photos uploaded yet.</p>
        )}
      </Card>

      <TerminateProjectDialog
        open={terminateDialogOpen}
        onOpenChange={setTerminateDialogOpen}
        leadId={leadId}
        onSuccess={() => {
          // You could show a success dialog here if you prefer,
          // but toast is already handled in the dialog component.
        }}
      />

      <UploadBomFileDialog
        open={bomModalOpen}
        onOpenChange={setBomModalOpen}
        leadId={leadId}
        customerId={customerId}
      />

      <UploadDrawingsModal
        isOpen={drawingsModalOpen}
        onClose={() => setDrawingsModalOpen(false)}
        leadId={leadId}
      />
    </div>
  );
}
