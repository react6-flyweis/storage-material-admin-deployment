import { useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router";
import { useAppBack } from "@/modules/navigation";
import BackArrow from "../assets/backarrowicon.svg";
import EyeIcon from "../assets/EyeIcon.svg";
import EditIcon from "../assets/EditIcon.svg";
import CustomSelect from "../components/common/CustomSelect";
import DownloadIcon from "../assets/downloadicon.svg";
import PdfIcon from "../assets/pdficon.svg";

const projectFilterOptions = [
  { label: "Downtown Office Complex", value: "PRJ-001" },
  { label: "Residential Tower A", value: "PRJ-002" },
  { label: "Shopping Mall Renovation", value: "PRJ-003" },
  { label: "Industrial Warehouse", value: "PRJ-004" },
];

const PROJECT_DATA: any = {
  "PRJ-001": {
    projectName: "Downtown Office Complex",
    manager: "John Smith",
    managerCode: "MR-001",
    initials: "JS",
    start: "2024-01-15",
    end: "2024-08-30",
    duration: "7.5",
    scope:
      "Construction of a 15-story office complex with underground parking, modern HVAC systems, and sustainable energy solutions.",
    deliverables: [
      { id: 1, text: "Foundation and structural framework" },
      { id: 2, text: "HVAC and electrical systems installation" },
      { id: 3, text: "Interior finishing and fixtures" },
      { id: 4, text: "Parking garage construction" },
      { id: 5, text: "Landscaping and exterior work" },
    ],
    phases: [
      {
        title: "Foundation",
        date: "2024-01-15 - 2024-03-15",
        status: "Completed",
      },
      {
        title: "Structure",
        date: "2024-03-16 - 2024-05-30",
        status: "Inprogress",
      },
      { title: "Systems", date: "2024-06-01 - 2024-07-15", status: "Upcoming" },
      {
        title: "Finishing",
        date: "2024-07-16 - 2024-08-30",
        status: "Upcoming",
      },
    ],
    files: [
      { name: "Architectural Plans.pdf", size: "15.2 MB" },
      { name: "Structural Drawings.dwg", size: "15.2 MB" },
      { name: "Specifications.docx", size: "15.2 MB" },
    ],
  },

  "PRJ-002": {
    projectName: "Residential Tower A",
    manager: "Sarah Wilson",
    managerCode: "MR-002",
    initials: "SW",
    start: "2024-02-01",
    end: "2024-09-15",
    duration: "7.5",
    scope: "High-rise residential tower construction.",
    deliverables: [
      { id: 1, text: "Tower core structure" },
      { id: 2, text: "Residential unit finishing" },
    ],
    phases: [
      {
        title: "Structure",
        date: "2024-02-01 - 2024-06-30",
        status: "Completed",
      },
      {
        title: "Finishing",
        date: "2024-07-01 - 2024-09-15",
        status: "Upcoming",
      },
    ],
    files: [
      { name: "Tower Plan.pdf", size: "10.5 MB" },
      { name: "Interior Layout.pdf", size: "8.9 MB" },
    ],
  },

  "PRJ-003": {
    projectName: "Shopping Mall Renovation",
    manager: "David Lee",
    managerCode: "MR-003",
    initials: "DL",
    start: "2023-11-10",
    end: "2024-04-20",
    duration: "5.5",
    scope:
      "Renovation of an existing shopping mall including interior redesign, electrical upgrades, and facade improvement.",
    deliverables: [
      { id: 1, text: "Interior redesign" },
      { id: 2, text: "Electrical and lighting upgrade" },
      { id: 3, text: "Facade renovation" },
    ],
    phases: [
      {
        title: "Planning",
        date: "2023-11-10 - 2023-12-15",
        status: "Completed",
      },
      {
        title: "Renovation",
        date: "2023-12-16 - 2024-03-15",
        status: "Completed",
      },
      {
        title: "Final Touches",
        date: "2024-03-16 - 2024-04-20",
        status: "Inprogress",
      },
    ],
    files: [
      { name: "Renovation Layout.pdf", size: "9.4 MB" },
      { name: "Electrical Plan.dwg", size: "11.1 MB" },
    ],
  },

  "PRJ-004": {
    projectName: "Industrial Warehouse",
    manager: "Andrew Scott",
    managerCode: "MR-004",
    initials: "AS",
    start: "2024-03-05",
    end: "2024-12-10",
    duration: "9",
    scope:
      "Construction of a large-scale industrial warehouse with logistics facilities and safety-compliant infrastructure.",
    deliverables: [
      { id: 1, text: "Warehouse structural build" },
      { id: 2, text: "Logistics bay setup" },
      { id: 3, text: "Fire safety & compliance systems" },
    ],
    phases: [
      {
        title: "Foundation",
        date: "2024-03-05 - 2024-04-30",
        status: "Completed",
      },
      {
        title: "Structure",
        date: "2024-05-01 - 2024-08-15",
        status: "Inprogress",
      },
      { title: "Systems", date: "2024-08-16 - 2024-10-30", status: "Upcoming" },
      {
        title: "Handover",
        date: "2024-11-01 - 2024-12-10",
        status: "Upcoming",
      },
    ],
    files: [
      { name: "Warehouse Layout.pdf", size: "13.7 MB" },
      { name: "Safety Compliance.docx", size: "6.2 MB" },
    ],
  },
};

const statusStyle: Record<string, string> = {
  Completed: "bg-[#DCFCE7] text-[#16A34A]",
  Inprogress: "bg-[#DCFCE7] text-[#16A34A]",
  Upcoming: "bg-[#F3F3F3] text-[#404040]",
};

export default function ProjectViewPage() {
  const { goBack } = useAppBack("/construction/projects");
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const q = search.trim().toLowerCase();

  const [status, setStatus] = useState("all");
  const [projectName, setProjectName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  console.log(projectName);
  useEffect(() => {
    if (location.state?.projectCode) {
      setStatus(location.state.projectCode);
      setProjectName(location.state.projectName);
    }
  }, [location.state]);

  const [activeProject, setActiveProject] = useState<any>(null);
  const filteredDeliverables = activeProject?.deliverables?.filter(
    (d: any) => !q || d.text.toLowerCase().includes(q)
  );
  const filteredFiles = activeProject?.files?.filter(
    (f: any) => !q || f.name.toLowerCase().includes(q)
  );
  const filteredPhases = activeProject?.phases?.filter(
    (p: any) =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q)
  );

  useEffect(() => {
    if (status !== "all") {
      setActiveProject(PROJECT_DATA[status]);
    } else {
      setActiveProject(null);
    }
  }, [status]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProject) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed");
      e.target.value = "";
      return;
    }

    const newFile = {
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    };

    setActiveProject((prev: any) => ({
      ...prev,
      files: [...(prev.files || []), newFile],
    }));

    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-2 mb-8">
        <div className="flex sm:flex-row flex-col sm:items-center justify-start gap-5">
          <button
            onClick={() => goBack()}
            className="flex items-center gap-2 bg-[#3F63E1] text-white px-3 w-fit h-[36px] rounded-[8px] text-[14px] font-medium hover:opacity-90"
          >
            <img src={BackArrow} alt="" />
            <span>Back</span>
          </button>

          <h1 className="text-[#111827] lg:text-[30px] text-[24px] font-bold leading-[36px]">
            Statement of Work (SOW)
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <CustomSelect
            title="All Projects"
            options={projectFilterOptions}
            value={status}
            onChange={(v) => {
              setStatus(v);
              setProjectName(
                projectFilterOptions.find((p) => p.value === v)?.label || ""
              );
            }}
            width="250px"
            searchable
          />

          <button className="flex items-center gap-2 bg-[#3F63E1] text-white px-5 rounded-lg h-[36px] min-w-fit text-sm font-medium hover:opacity-90">
            Edit SOW
          </button>
        </div>
      </div>

      <div className="rounded-[8px] lg:p-6 p-3 border bg-white shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-sm uppercase text-[#6B7280] mb-3">
              Project Details
            </p>

            <p className="text-sm mb-3">
              <span className="font-medium">ID:</span>{" "}
              {status !== "all" ? status : "-"}
            </p>

            <p className="text-sm mb-4">
              <span className="font-medium">Project:</span>{" "}
              {activeProject?.projectName || "-"}
            </p>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Status:</span>
              <span className="px-4 py-1 rounded-full text-sm bg-green-100 text-green-700">
                Approved
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm uppercase text-[#6B7280] mb-3">
              Assigned Manager
            </p>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#1D51A4] flex items-center justify-center text-white text-lg font-medium">
                {activeProject?.initials || "--"}
              </div>

              <div>
                <p className="text-sm font-medium text-[#111827]">
                  {activeProject?.manager || "-"}
                </p>
                <p className="text-sm text-[#6B7280] mt-1">
                  {activeProject?.managerCode || "-"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm uppercase text-[#6B7280] mb-3">Timeline</p>

            <p className="text-sm mb-3">
              <span className="font-bold">Start:</span>{" "}
              {activeProject?.start || "-"}
            </p>

            <p className="text-sm mb-3">
              <span className="font-bold">End:</span>{" "}
              {activeProject?.end || "-"}
            </p>

            <p className="text-sm text-[#6B7280]">
              Duration: {activeProject?.duration || "-"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-[#111827]">Job Scope</p>
          <p className="text-sm text-[#6B7280] mt-1">
            {activeProject?.scope || "-"}
          </p>
        </div>
      </div>

      <div className="rounded-[8px] lg:p-6 p-3 border bg-white shadow">
        <h3 className="text-lg font-semibold mb-6">Key Deliverables</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredDeliverables?.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-[#F9FAFB] rounded-[8px] px-5 py-4"
            >
              <div className="w-8 h-8 rounded-full bg-[#1D51A4] flex items-center justify-center text-white">
                {item.id}
              </div>
              <p className="text-sm text-[#111827]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[8px] lg:p-6 p-3 border bg-white shadow">
        <h3 className="text-lg font-semibold mb-6">
          Project Phases & Timeline
        </h3>

        <div className="space-y-5">
          {filteredPhases?.map((phase: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-[8px] shadow px-5 py-4"
            >
              <div>
                <p className="text-sm font-bold">{phase.title}</p>
                <p className="text-sm text-[#6B7280] mt-1">{phase.date}</p>
              </div>
              <div className="flex items-end flex-col gap-3">
                <div
                  className={`px-4 py-1 rounded-full text-sm ${
                    statusStyle[phase.status]
                  }`}
                >
                  {phase.status}
                </div>
                <div className="flex gap-4">
                  {" "}
                  <button className="hover:opacity-70">
                    {" "}
                    <img src={EyeIcon} alt="" />{" "}
                  </button>{" "}
                  <button className="hover:opacity-70">
                    {" "}
                    <img src={EditIcon} alt="" />{" "}
                  </button>{" "}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[8px] lg:p-6 p-3 border bg-white shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Attachments & Documents</h3>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#3F63E1] text-white px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90"
          >
            Upload File
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-3">
          {filteredFiles
            ?.slice()
            .reverse()
            .map((file: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border px-5 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                    <img src={PdfIcon} alt="" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#111827]">
                      {file.name}
                    </p>
                    <p className="text-sm text-[#6B7280] mt-1">{file.size}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button className="hover:opacity-70">
                    <img src={DownloadIcon} alt="" />
                  </button>
                  <button className="hover:opacity-70">
                    <img src={EyeIcon} alt="" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
