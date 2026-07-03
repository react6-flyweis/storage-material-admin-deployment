import { ArrowLeft, Download, Eye, FileText } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/ui/stat-card";

const summaryCards = [
  {
    title: "Total Shipper Files",
    value: "58 Files",
    icon: <FileText className="h-5 w-5 text-[#1D51A4]" />,
    bgColor: "bg-[#1D51A4]",
    iconBg: "bg-white",
  },
  {
    title: "Pending Upload",
    value: "12 Files",
    icon: <FileText className="h-5 w-5 text-[#22C55E]" />,
    bgColor: "bg-[#22C55E]",
    textColor: "text-white",
    iconBg: "bg-white",
  },
  {
    title: "Ready for Validation",
    value: "26 Files",
    icon: <FileText className="h-5 w-5 text-[#EAB308]" />,
    bgColor: "bg-[#FACC15]",
    textColor: "text-white",
    iconBg: "bg-white",
  },
  {
    title: "Issues Detected",
    value: "8 Files",
    icon: <FileText className="h-5 w-5 text-[#F97316]" />,
    bgColor: "bg-[#F97316]",
    iconBg: "bg-white",
  },
];

const attachedDrawings = [
  {
    name: "Architectural Plans.pdf",
    size: "15.2 MB",
    status: "Pending Review",
    statusColor: "bg-[#FEF9C3] text-[#CA8A04]",
  },
  {
    name: "Structural Drawings.dwg",
    size: "15.2 MB",
    status: "Approved",
    statusColor: "bg-[#DCFCE7] text-[#16A34A]",
  },
  {
    name: "Specifications.docx",
    size: "15.2 MB",
    status: "Revision Required",
    statusColor: "bg-[#FEE2E2] text-[#DC2626]",
  },
];

const attachedPhotos = [
  {
    name: "Architectural Plans.pdf",
    size: "15.2 MB",
    status: "Pending Review",
    statusColor: "bg-[#FEF9C3] text-[#CA8A04]",
    imageUrl: "https://placehold.co/400x300/E2E8F0/A1A1AA?text=Building+1",
  },
  {
    name: "Structural Building.dwg",
    size: "15.2 MB",
    status: "Approved",
    statusColor: "bg-[#DCFCE7] text-[#16A34A]",
    imageUrl: "https://placehold.co/400x300/E2E8F0/A1A1AA?text=Building+2",
  },
  {
    name: "Specifications.docx",
    size: "15.2 MB",
    status: "Revision Required",
    statusColor: "bg-[#FEE2E2] text-[#DC2626]",
    imageUrl: "https://placehold.co/400x300/E2E8F0/A1A1AA?text=Building+3",
  },
];

export default function ProjectDrawingsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="default"
          onClick={() => navigate('/customers')}
          className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-md px-4 py-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-[#1E293B]">
          Project 1 - Drawings
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.bgColor}
            titleClassName="text-sm font-medium mb-1 opacity-90"
            valueClassName="text-2xl font-semibold"
            iconWrapperClassName={card.iconBg}
          />
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Attached Drawings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attachedDrawings.map((file, i) => (
              <div
                key={i}
                className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 relative"
              >
                <div className="absolute -top-3 right-4">
                  <span
                    className={`text-[10px] px-3 py-1 font-medium rounded-full ${file.statusColor}`}
                  >
                    {file.status}
                  </span>
                </div>
                <div className="h-10 w-10 shrink-0 bg-red-50 text-red-500 rounded flex items-center justify-center border border-red-100">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold text-slate-800 truncate"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{file.size}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <button className="hover:text-[#1D51A4] transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="hover:text-[#1D51A4] transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Attached Building Photos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attachedPhotos.map((file, i) => (
              <div
                key={i}
                className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 relative"
              >
                <div className="absolute -top-3 right-4">
                  <span
                    className={`text-[10px] px-3 py-1 font-medium rounded-full ${file.statusColor}`}
                  >
                    {file.status}
                  </span>
                </div>
                <div className="h-12 w-12 shrink-0 rounded overflow-hidden">
                  <img
                    src={file.imageUrl}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold text-slate-800 truncate"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{file.size}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <button className="hover:text-[#1D51A4] transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="hover:text-[#1D51A4] transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
