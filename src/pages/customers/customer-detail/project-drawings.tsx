import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowDown,
  Eye,
  FileText,
  Search,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import StatCard from "@/components/ui/stat-card";
import UploadDrawingsModal from "@/plant/components/UploadDrawingsModal";
import SuccessDialog from "@/components/success-dialog";
import { useLeadDetailQuery, useUploadLeadDocumentMutation } from "@/modules/leads/leads.hooks";
import {
  useGetProjectDrawingsQuery,
  useGetPlantProjectDetailQuery,
} from "@/modules/plant/bom.hooks";
import ViewDrawingModal, { type DrawingFile } from "./view-drawing-modal";
import { downloadFile } from "@/lib/utils";

// --- Types & Data Interfaces ---

function mapStatusString(rawStatus?: string): string {
  const s = rawStatus ? rawStatus.toLowerCase() : "";
  if (s.includes("approved")) return "Approved";
  if (s.includes("revision") || s.includes("required") || s.includes("rejected")) return "Revision Requested";
  if (s.includes("pending")) return "Pending Review";
  return rawStatus || "Pending Review";
}

interface BuildingDrawingsGroup {
  buildingId: string;
  buildingNumber: number;
  latestDrawingStatus?: string;
  drawings: DrawingFile[];
  photos: DrawingFile[];
}

// --- Helpers ---

const mapStatusInfo = (status: string) => {
  const s = status ? status.toLowerCase() : "";
  if (s.includes("approved")) {
    return {
      text: "Approved",
      value: "approved",
      badgeClass: "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]",
    };
  }
  if (s.includes("revision") || s.includes("required") || s.includes("rejected")) {
    return {
      text: "Revision Requested",
      value: "revision-requested",
      badgeClass: "bg-[#FFF7ED] text-[#FF9409] border-[#FFEDD5]",
    };
  }
  return {
    text: "Pending Review",
    value: "pending-review",
    badgeClass: "bg-[#FEFAE2] text-[#F0CC16] border-[#FEFAE2]",
  };
};

const isPhotoFile = (fileName: string) => {
  const ext = fileName ? fileName.split(".").pop()?.toLowerCase() : "";
  return ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext || "");
};

// --- Sub-Components ---

const FileCard: React.FC<{
  file: DrawingFile;
  onView: (file: DrawingFile) => void;
  type?: "drawing" | "photo";
}> = ({ file, onView, type = "drawing" }) => {
  const statusInfo = mapStatusInfo(file.status);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative transition-all hover:shadow-md flex items-center">
      {/* Status Badge */}
      <div className="absolute -top-3 right-3 z-10">
        <span
          className={`px-3 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.badgeClass}`}
        >
          {statusInfo.text}
        </span>
      </div>

      <div className="flex items-center gap-4 w-full">
        {/* Thumbnail / Icon */}
        <div className="shrink-0">
          {type === "photo" ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
              <img
                src={file.imageUrl}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1D51A4]">
              <FileText className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pr-2">
          <h4
            className="text-sm font-semibold text-slate-800 truncate"
            title={file.name}
          >
            {file.name}
          </h4>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {file.size}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => downloadFile(file.imageUrl, file.name)}
            title="Download"
            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-full transition-colors"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => onView(file)}
            title="View Details"
            className="p-1.5 hover:bg-blue-50 text-[#1D51A4] rounded-full transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function ProjectDrawingsPage() {
  const navigate = useNavigate();
  const { id, projectId } = useParams<{ id?: string; projectId?: string }>();

  const cusotmerId = id || ""
  const leadId = projectId || ""


  const { data: leadData } = useLeadDetailQuery(leadId);
  const { data: drawingsApiData, isLoading: isDrawingsLoading } = useGetProjectDrawingsQuery(leadId, Boolean(leadId));
  const { data: projectDetailData } = useGetPlantProjectDetailQuery(leadId);
  const uploadDocMutation = useUploadLeadDocumentMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [localBuildingGroups, setLocalBuildingGroups] = useState<BuildingDrawingsGroup[]>([]);

  const [selectedDrawing, setSelectedDrawing] = useState<DrawingFile | null>(null);
  const [isViewDrawingOpen, setIsViewDrawingOpen] = useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("Building Drawings Uploaded Successfully");

  const projectName = projectDetailData?.lead?.projectName || leadData?.data?.lead?.projectName || "Project";

  // Compute building groups combining API drawings data when available
  const buildingGroups: BuildingDrawingsGroup[] = useMemo(() => {
    if (drawingsApiData?.buildings && drawingsApiData.buildings.length > 0) {
      return drawingsApiData.buildings.map((b) => {
        const drawingsList: DrawingFile[] = [];
        const photosList: DrawingFile[] = [];

        (b.drawings || []).forEach((d) => {
          const commentsList = d.comments || (d as any).comments || [];
          const latestComment =
            commentsList.length > 0
              ? [...commentsList].sort((a, b) => {
                  const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  return dateB - dateA;
                })[0]?.text
              : undefined;

          const fileObj: DrawingFile = {
            id: d._id || `DWG-${d.versionNumber || 1}`,
            name: d.fileName || `Building ${b.buildingNumber} Drawing`,
            size: `v${d.versionNumber || 1} • ${d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : "PDF"}`,
            status: mapStatusString(d.status),
            imageUrl: d.fileUrl || "https://placehold.co/800x600/E2E8F0/1E51A4?text=Drawing+Preview",
            uploadedBy: "Plant Admin",
            receivedDate: d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
            location: `Building ${b.buildingNumber}`,
            rejectionReason: d.rejectionReason,
            comments: commentsList,
            customerSuggestions:
              latestComment ||
              (d as any).customerSuggestions ||
              (d as any).suggestions,
          };

          if (isPhotoFile(d.fileName || "")) {
            photosList.push(fileObj);
          } else {
            drawingsList.push(fileObj);
          }
        });

        return {
          buildingId: b.buildingId,
          buildingNumber: b.buildingNumber,
          latestDrawingStatus: b.latestDrawingStatus,
          drawings: drawingsList,
          photos: photosList,
        };
      });
    }
    return localBuildingGroups;
  }, [drawingsApiData, localBuildingGroups]);

  // Summary Stat Cards
  const stats = useMemo(() => {
    let totalFiles = 0;
    let approved = 0;
    let pending = 0;
    let revision = 0;

    buildingGroups.forEach((b) => {
      [...b.drawings, ...b.photos].forEach((f) => {
        totalFiles++;
        if (f.status?.toLowerCase().includes("approved")) approved++;
        else if (f.status?.toLowerCase().includes("pending")) pending++;
        else if (
          f.status?.toLowerCase().includes("revision") ||
          f.status?.toLowerCase().includes("required") ||
          f.status?.toLowerCase().includes("rejected")
        ) revision++;
      });
    });

    return [
      {
        title: "Total Drawings & Photos",
        value: `${totalFiles} Files`,
        icon: <FileText className="h-5 w-5 text-[#1D51A4]" />,
        color: "bg-[#1D51A4]",
        iconWrapperClassName: "bg-white",
      },
      {
        title: "Approved Files",
        value: `${approved} Files`,
        icon: <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />,
        color: "bg-[#22C55E]",
        iconWrapperClassName: "bg-white",
      },
      {
        title: "Pending Review",
        value: `${pending} Files`,
        icon: <Clock className="h-5 w-5 text-[#EAB308]" />,
        color: "bg-[#FACC15]",
        iconWrapperClassName: "bg-white",
      },
      {
        title: "Revision Requested",
        value: `${revision} Files`,
        icon: <AlertCircle className="h-5 w-5 text-[#F97316]" />,
        color: "bg-[#F97316]",
        iconWrapperClassName: "bg-white",
      },
    ];
  }, [buildingGroups]);

  const handleOpenDrawing = (file: DrawingFile) => {
    setSelectedDrawing(file);
    setIsViewDrawingOpen(true);
  };

  const handleUpdateDrawingStatus = (
    drawingId: string,
    newStatus: DrawingFile["status"],
    comment?: string
  ) => {
    setLocalBuildingGroups((prev: BuildingDrawingsGroup[]) =>
      prev.map((group: BuildingDrawingsGroup) => ({
        ...group,
        drawings: group.drawings.map((d: DrawingFile) =>
          d.id === drawingId
            ? { ...d, status: newStatus, rejectionReason: comment || d.rejectionReason }
            : d
        ),
        photos: group.photos.map((p: DrawingFile) =>
          p.id === drawingId
            ? { ...p, status: newStatus, rejectionReason: comment || p.rejectionReason }
            : p
        ),
      }))
    );
  };

  const handleUploadSubmit = (files: File[]) => {
    if (leadId) {
      uploadDocMutation.mutate(
        { leadId, files, type: "drawing" },
        {
          onSuccess: () => {
            setSuccessTitle("Building Drawings & Photos Uploaded Successfully");
            setIsUploadModalOpen(false);
            setIsSuccessModalOpen(true);
          },
          onError: () => {
            setSuccessTitle("Failed to upload building drawings");
            setIsUploadModalOpen(false);
            setIsSuccessModalOpen(true);
          },
        }
      );
    } else {
      setSuccessTitle("Building Drawings & Photos Uploaded Successfully");
      setIsUploadModalOpen(false);
      setIsSuccessModalOpen(true);
    }
  };

  if (isDrawingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1D51A4]"></div>
        <p className="text-slate-500 font-medium text-sm font-sans">Loading drawings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="default"
            onClick={() => navigate(`/customers/${cusotmerId}/project-details/${leadId}`)}
            className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-md px-4 py-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-[#1E293B]">
            {projectName} - Drawings & Photos
          </h1>
        </div>

        <Button
          variant="default"
          className="bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white rounded-lg flex items-center gap-2"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Upload className="h-4 w-4" />
          Upload Drawings/Photos
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            titleClassName="text-sm font-medium mb-1 opacity-90 text-white"
            valueClassName="text-2xl font-semibold text-white"
            iconWrapperClassName={card.iconWrapperClassName}
          />
        ))}
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-xl border border-slate-200 shadow-xs">
        <CardContent className=" flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              type="text"
              placeholder="Search drawings or photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-slate-200 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</span>
            {[
              { label: "All Status", value: "all" },
              { label: "Approved", value: "approved" },
              { label: "Pending Review", value: "pending-review" },
              { label: "Revision Requested", value: "revision-requested" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveStatus(option.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeStatus === option.value
                  ? "bg-[#1D51A4] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Buildings Content Grid */}
      <div className="space-y-6">
        {buildingGroups.map((building) => {
          const allFiles = [...building.drawings, ...building.photos];
          const filteredFiles = allFiles.filter((file) => {
            const statusInfo = mapStatusInfo(file.status);
            const matchesStatus = activeStatus === "all" || statusInfo.value === activeStatus;
            const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
          });

          const filteredDrawings = filteredFiles.filter((f) => !isPhotoFile(f.name));
          const filteredPhotos = filteredFiles.filter((f) => isPhotoFile(f.name));

          const buildingBadge = mapStatusInfo(building.latestDrawingStatus || "Pending Review");

          return (
            <Card key={building.buildingId} className="pt-0">
              {/* Building Header */}
              <CardHeader className="bg-slate-50/80 pt-5  border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white border border-slate-200 rounded-lg text-[#1D51A4]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Building {building.buildingNumber}
                  </h3>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-medium border ${buildingBadge.badgeClass}`}>
                    {buildingBadge.text}
                  </span>
                </div>
              </CardHeader>

              {/* Building Files Content */}
              <CardContent className="space-y-6">
                {filteredFiles.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-400 font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    No drawings or photos match the current criteria for Building {building.buildingNumber}.
                  </div>
                ) : (
                  <>
                    {/* Drawings Section */}
                    {filteredDrawings.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Drawings ({filteredDrawings.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredDrawings.map((file) => (
                            <FileCard key={file.id} file={file} onView={handleOpenDrawing} type="drawing" />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Photos Section */}
                    {filteredPhotos.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Photos ({filteredPhotos.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredPhotos.map((file) => (
                            <FileCard key={file.id} file={file} onView={handleOpenDrawing} type="photo" />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
        {buildingGroups.length === 0 && (
          <Card className="rounded-xl border border-slate-200 shadow-xs p-12 text-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <Building2 className="w-10 h-10 text-slate-300" />
              <p className="text-slate-500 font-medium text-sm">
                No building drawings or photos found for this project.
              </p>
              <Button
                variant="default"
                size="sm"
                className="bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white rounded-lg mt-2"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Drawings/Photos
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* View Drawing Modal */}
      <ViewDrawingModal
        isOpen={isViewDrawingOpen}
        onClose={() => setIsViewDrawingOpen(false)}
        drawing={selectedDrawing}
        onUpdateStatus={handleUpdateDrawingStatus}
      />

      {/* Upload Modal */}
      <UploadDrawingsModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        leadId={leadId}
        isUploading={uploadDocMutation.isPending}
        onUpload={(files) => handleUploadSubmit(files)}
      />

      {/* Success Modal */}
      <SuccessDialog
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={successTitle}
      />
    </div>
  );
}

