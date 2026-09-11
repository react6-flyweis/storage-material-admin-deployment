import { useState, useEffect } from "react";
import SearchIcon from "../assets/searchIcon.svg";
import PlusIcon from "../assets/plusicon.svg";
import PdfIcon from "../assets/pdficon.svg";
import EyeIcon from "../assets/EyeIcon.svg";
import DownloadIcon from "../assets/downloadicon.svg";
import DrawingModel from "../components/drawingModel";
import DrawingPreviewModal from "../components/drawingPreviewModel";
import SuccessModal from "../components/common/SuccessModal";
import { useSearchParams } from "react-router";
import { getDrawings } from "../construction.api";
import type { DrawingDocument, DrawingProjectGroup } from "../construction.api";
import { Skeleton } from "@/components/ui/skeleton";

type UploadedFile = {
  id: string;
  name: string;
  size: string;
  status: string;
  key?: string;
  fileUrl?: string;
  rawDoc?: DrawingDocument;
  buildingLabel?: string;
};

type Project = {
  id: string;
  name: string;
  code: string;
  uploadedBy: string;
  location: string;
  updatedOn: string;
  files: UploadedFile[];
};

const statusStyle: Record<string, string> = {
  "Pending Review": "bg-yellow-100 text-yellow-700",
  Pending: "bg-yellow-100 text-yellow-700",
  "Under Review": "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  "Revision Required": "bg-red-100 text-red-600",
};

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatStatus(status?: string): { text: string; key: string } {
  if (!status) return { text: "Pending Review", key: "Pending" };
  const s = status.toLowerCase();
  if (s === "approved") return { text: "Approved", key: "Approved" };
  if (s === "under_review") return { text: "Under Review", key: "Pending" };
  if (s === "pending") return { text: "Pending Review", key: "Pending" };
  if (s === "revision_requested" || s === "revision_required") return { text: "Revision Required", key: "Revision" };
  return { text: status, key: status };
}

export default function DrawingAttachment() {
  const [openDrawingPreviewModel, setDrawingPreviewModel] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [localSearch, setLocalSearch] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingData, setPendingData] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [openDrawingModel, setDrawingModel] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDrawings = async () => {
      setLoading(true);
      try {
        const res = await getDrawings();
        if (isMounted && res?.success && res?.data?.projects) {
          const mappedProjects: Project[] = res.data.projects.map((projGroup: DrawingProjectGroup) => {
            const lead = projGroup.lead || {};
            const uploadedByName = typeof projGroup.uploadedBy === "string" ? projGroup.uploadedBy : "Admin User";

            const filesMapped: UploadedFile[] = (projGroup.documents || []).map((doc: DrawingDocument) => {
              const statusInfo = formatStatus(doc.status);
              return {
                id: doc._id,
                name: doc.name,
                size: formatBytes(doc.fileSize),
                status: statusInfo.text,
                key: statusInfo.key,
                fileUrl: doc.fileUrl,
                rawDoc: doc,
                buildingLabel: doc.buildingLabel,
              };
            });

            return {
              id: lead._id || crypto.randomUUID(),
              name: lead.projectName || "Project",
              code: lead.jobId || "—",
              uploadedBy: uploadedByName,
              location: lead.location || "—",
              updatedOn: formatDate(projGroup.lastUpdate),
              files: filesMapped,
            };
          });

          setProjects(mappedProjects);
        }
      } catch (err) {
        console.error("Failed to fetch drawings data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDrawings();

    return () => {
      isMounted = false;
    };
  }, []);

  const onDrawingSubmit = (data: any) => {
    setPendingData(data);
    setDrawingModel(false);
    setSuccessOpen(true);
  };

  const onSuccessClose = () => {
    setSuccessOpen(false);

    if (pendingData) {
      handleUpload(pendingData);
      setPendingData(null);
    }
  };

  const filteredProjects = projects
    .map((project) => {
      const query = `${search} ${localSearch}`.trim().toLowerCase();

      if (!query) return project;

      const projectMatch =
        project.name.toLowerCase().includes(query) ||
        project.code.toLowerCase().includes(query) ||
        project.uploadedBy.toLowerCase().includes(query) ||
        project.location.toLowerCase().includes(query) ||
        project.updatedOn.toLowerCase().includes(query);

      const matchedFiles = project.files.filter((file) =>
        file.name.toLowerCase().includes(query) ||
        (file.buildingLabel && file.buildingLabel.toLowerCase().includes(query))
      );

      if (projectMatch) return project;

      if (matchedFiles.length > 0) {
        return {
          ...project,
          files: matchedFiles,
        };
      }

      return null;
    })
    .filter(Boolean) as Project[];

  const handleUpload = ({
    file,
    projectName,
    projectCode,
  }: {
    file: File;
    projectName: string;
    projectCode: string;
  }) => {
    const newFile: UploadedFile = {
      id: crypto.randomUUID(),
      name: file.name,
      size: formatBytes(file.size),
      status: "Pending Review",
      key: "Pending",
      fileUrl: URL.createObjectURL(file),
    };

    setProjects((prev) => {
      const projectExists = prev.find(
        (project) => project.code === projectCode
      );

      if (projectExists) {
        return prev.map((project) =>
          project.code === projectCode
            ? {
              ...project,
              updatedOn: new Date().toLocaleDateString("en-GB"),
              files: [newFile, ...project.files],
            }
            : project
        );
      }

      const newProject: Project = {
        id: crypto.randomUUID(),
        name: projectName,
        code: projectCode,
        uploadedBy: "Admin User",
        location: "—",
        updatedOn: new Date().toLocaleDateString("en-GB"),
        files: [newFile],
      };

      return [newProject, ...prev];
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-[#111827] lg:text-[30px] text-[24px] font-bold mb-2 leading-[36px]">
            Project Drawings
          </h1>
          <p className="text-[#4B5563] lg:text-[16px] text-[14px]">
            All structural, fabrication, and erection drawings for this project.
          </p>
        </div>
        <div
          className="rounded-[8px] bg-white border border-[#F3F4F6]
                shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.1),_0px_4px_6px_-1px_rgba(0,0,0,0.1)]
                overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 lg:px-6 px-3 py-4 border-b border-[#0000001A]">
            <p className="font-medium text-[#111827]">Projects & Drawings</p>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="flex gap-2 items-center px-2 border border-[#D1D5DB] rounded-[8px] h-[38px]">
                <img src={SearchIcon} alt="" />
                <input
                  type="text"
                  placeholder="Search leads, projects..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="text-[14px] outline-none lg:min-w-[256px] w-[150px]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:px-6 px-3 py-4">
            {loading ? (
              <div className="space-y-6">
                {Array.from({ length: 2 }).map((_, pIdx) => (
                  <div
                    key={pIdx}
                    className="rounded-[8px] lg:p-6 p-3 border !bg-white border-[#F3F4F6] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.26)]"
                  >
                    <div className="flex md:flex-row flex-col gap-6 justify-between items-start mb-6">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex flex-wrap sm:gap-10 gap-4">
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </div>
                    </div>
                    <Skeleton className="h-4 w-40 mb-4" />
                    <div className="grid grid-cols-1 xl:grid-cols-3 sm:grid-cols-2 gap-6">
                      {Array.from({ length: 3 }).map((_, fIdx) => (
                        <div
                          key={fIdx}
                          className="flex items-center justify-between gap-2 rounded-xl border border-[#E5E7EB] px-5 py-4"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <Skeleton className="w-10 h-10 rounded-lg" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/3" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="
                            rounded-[8px] lg:p-6 p-3 border !bg-white border-[#F3F4F6]
                            !shadow-[0px_0px_4px_0px_rgba(0,0,0,0.26)]
                        "
                  >
                    <div className="flex md:flex-row flex-col gap-6 justify-between items-start mb-6">
                      <div>
                        <p className="text-lg font-semibold text-[#111827]">
                          {project.name}
                        </p>
                        <p className="text-sm text-[#6B7280] mt-1">
                          {project.code}
                        </p>
                      </div>

                      <div className="flex flex-wrap sm:gap-10 gap-4 text-sm">
                        <div className="sm:w-[100px] w-full">
                          <p className="text-[#4B5563] text-xs leading-[21px]">
                            Uploaded By:
                          </p>
                          <p className="text-black text-[14px] leading-[21px]">
                            {project.uploadedBy}
                          </p>
                        </div>
                        <div className="sm:w-[100px] w-full">
                          <p className="text-[#4B5563] text-xs leading-[21px]">
                            Location:
                          </p>
                          <p className="text-black text-[14px] leading-[21px]">
                            {project.location}
                          </p>
                        </div>
                        <div className="sm:w-[100px] w-full">
                          <p className="text-[#4B5563] text-xs leading-[21px]">
                            Last Update on
                          </p>
                          <p className="text-black text-[14px] leading-[21px]">
                            {project.updatedOn}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-[#111827] md:mb-4 mb-6">
                      Attachments & Drawings
                    </p>

                    <div className="grid grid-cols-1 xl:grid-cols-3 sm:grid-cols-2 gap-6">
                      {project.files.map((file) => (
                        <div
                          key={file.id}
                          className="relative flex items-center justify-between gap-2 rounded-xl border border-[#E5E7EB] px-5 py-4"
                        >
                          <div className="flex items-center gap-4">
                            {(() => {
                              const isImage = file.fileUrl && (/\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i.test(file.fileUrl) || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name));
                              return isImage ? (
                                <div className="min-w-10 w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                                  <img src={file.fileUrl} alt={file.name} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="min-w-10 w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                                  <img src={PdfIcon} alt="PDF" />
                                </div>
                              );
                            })()}

                            <div>
                              <p
                                className="text-sm font-medium text-[#111827]"
                                style={{ wordBreak: "break-all" }}
                              >
                                {file.name}
                              </p>
                              {/* <p className="text-sm text-[#6B7280] mt-1">
                                {file.size}
                              </p> */}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 min-w-[80px]">
                            {file.fileUrl ? (
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:opacity-70"
                                download
                              >
                                <img
                                  src={DownloadIcon}
                                  alt="Download"
                                  className="min-w-fit"
                                />
                              </a>
                            ) : (
                              <button className="hover:opacity-70">
                                <img
                                  src={DownloadIcon}
                                  alt="Download"
                                  className="min-w-fit"
                                />
                              </button>
                            )}

                            <button
                              className="hover:opacity-70"
                              onClick={() => {
                                setSelectedFile({
                                  ...file,
                                  location: project.location,
                                  uploadedBy: project.uploadedBy,
                                  updatedOn: project.updatedOn,
                                  jobId: project.code,
                                });
                                setSelectedFileId(file.key ?? "Pending");
                                setDrawingPreviewModel(true);
                              }}
                            >
                              <img src={EyeIcon} alt="Preview" className="min-w-fit" />
                            </button>
                          </div>

                          <span
                            className={`absolute -top-3 right-4 px-4 py-1 rounded-full text-xs font-medium ${statusStyle[file.status] || "bg-gray-100 text-gray-700"
                              }`}
                          >
                            {file.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredProjects.length === 0 && (
                  <p className="text-center text-sm text-[#6B7280] py-8">
                    No projects found
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <DrawingModel
        open={openDrawingModel}
        onSubmit={onDrawingSubmit}
        onClose={() => setDrawingModel(false)}
      />

      <SuccessModal
        open={successOpen}
        title="File Uploaded Successfully"
        onClose={onSuccessClose}
      />

      <DrawingPreviewModal
        open={openDrawingPreviewModel}
        fileId={selectedFileId ?? ""}
        onClose={() => {
          setDrawingPreviewModel(false);
          setSelectedFile(null);
        }}
        file={selectedFile}
      />
    </>
  );
}

