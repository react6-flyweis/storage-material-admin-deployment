import * as React from "react";
import { ChevronDown, Search } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SuccessDialog from "@/components/success-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Project = {
  id: string;
  name?: string;
  projectName?: string;
  customerName?: string;
  buildingType?: string;
  location?: string;
  code?: string;
  jobId?: string;
  projectId?: string;
  status?: string;
  lifecycleStatus?: string;
  [key: string]: any;
};

export const getProjectDisplayName = (project: Project): string => {
  if (project.projectName?.trim()) {
    return project.projectName.trim();
  }
  const fallbackArr: string[] = [];
  if (project.customerName && String(project.customerName).trim()) {
    fallbackArr.push(String(project.customerName).trim());
  }
  if (project.buildingType && String(project.buildingType).trim()) {
    fallbackArr.push(String(project.buildingType).trim());
  }
  if (project.location && String(project.location).trim()) {
    fallbackArr.push(String(project.location).trim());
  }
  if (fallbackArr.length > 0) {
    return fallbackArr.join("-");
  }
  if (project.name && String(project.name).trim()) {
    return String(project.name).trim();
  }
  return "Project";
};

export const getProjectSecondLine = (project: Project): string => {
  const parts: string[] = [];
  if (project.customerName && String(project.customerName).trim()) {
    parts.push(String(project.customerName).trim());
  }
  const id =
    project.jobId ||
    project.code ||
    project.projectId ||
    (project.id ? (project.id.startsWith("PRO-") ? project.id : project.id) : "");
  if (id && String(id).trim()) {
    parts.push(String(id).trim());
  }
  return parts.join(" • ");
};

export const getProjectStatus = (project: Project): string => {
  const rawStatus = project.lifecycleStatus || project.status || "";
  if (!rawStatus) return "";
  const cleaned = rawStatus.replace(/_/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

type Props = {
  children?: React.ReactNode;
  projects?: Project[];
  isLoading?: boolean;
  initialSelected?: string | null;
  onDone: (project: Project | null) => void;
};

const defaultProjects: Project[] = [
  {
    id: "1",
    customerName: "Anamika",
    code: "PRO-037",
    jobId: "PRO-037",
    status: "Proposal sent",
  },
  {
    id: "2",
    customerName: "Umar",
    buildingType: "commercial garage",
    code: "PRO-036",
    jobId: "PRO-036",
    status: "Proposal sent",
  },
  {
    id: "3",
    name: "Oakridge Expansion",
    projectName: "Oakridge Expansion",
    customerName: "Acme Corp",
    code: "PRJ-003",
    jobId: "PRJ-003",
    status: "Proposal sent",
  },
  {
    id: "4",
    name: "North Depot Buildout",
    projectName: "North Depot Buildout",
    customerName: "BuildTech",
    code: "PRJ-004",
    jobId: "PRJ-004",
    status: "In progress",
  },
  {
    id: "5",
    name: "Harbor Steel Yard",
    projectName: "Harbor Steel Yard",
    customerName: "SteelYard LLC",
    code: "PRJ-005",
    jobId: "PRJ-005",
    status: "Completed",
  },
];

export default function AddProjectDialog({
  children,
  projects,
  isLoading = false,
  initialSelected = null,
  onDone,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [items, setItems] = React.useState<Project[]>(
    projects ?? defaultProjects,
  );
  const [selectedId, setSelectedId] = React.useState<string | null>(
    initialSelected ?? defaultProjects[0]?.id ?? null,
  );

  React.useEffect(() => {
    setItems(projects ?? defaultProjects);
  }, [projects]);

  React.useEffect(() => {
    setSelectedId(initialSelected ?? defaultProjects[0]?.id ?? null);
  }, [initialSelected]);

  React.useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const filteredItems = items.filter((project) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    const firstLine = getProjectDisplayName(project).toLowerCase();
    const secondLine = getProjectSecondLine(project).toLowerCase();
    const status = getProjectStatus(project).toLowerCase();
    return (
      firstLine.includes(query) ||
      secondLine.includes(query) ||
      status.includes(query) ||
      project.name?.toLowerCase().includes(query) ||
      project.code?.toLowerCase().includes(query) ||
      project.location?.toLowerCase().includes(query)
    );
  });

  const selectedProject =
    items.find((project) => project.id === selectedId) ?? items[0] ?? null;

  const handleDone = () => {
    if (selectedProject) {
      const displayName = getProjectDisplayName(selectedProject);
      onDone({
        ...selectedProject,
        name: displayName,
      });
    } else {
      onDone(null);
    }
    setOpen(false);
    setShowSuccess(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="p-0 overflow-hidden sm:max-w-lg"
      >
        <div className="p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
            <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
              Add Project
            </DialogTitle>
            <DialogDescription className="sr-only">
              Search and select a project
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-4">
            <div className="relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Projects..."
                className="h-11 rounded-xl border-gray-200 bg-[#FAFAFA] px-4 pr-12 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)] placeholder:text-gray-400"
              />
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700" />
            </div>

            <div className="space-y-4">
              <div className="text-base font-medium text-slate-900">
                Select Project
              </div>

              <Select
                value={selectedId || undefined}
                onValueChange={(val) => setSelectedId(val)}
              >
                <SelectTrigger className="w-full h-11 rounded-xl border-gray-300 bg-white px-4 text-left text-sm text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <SelectValue placeholder="Select a project">
                    {selectedProject
                      ? getProjectDisplayName(selectedProject)
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {isLoading ? (
                    <div className="p-3 text-sm text-gray-500 flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((project) => {
                      const firstLine = getProjectDisplayName(project);
                      const secondLine = getProjectSecondLine(project);
                      const status = getProjectStatus(project);

                      return (
                        <SelectItem
                          key={project.id}
                          value={project.id}
                          className="py-2.5 px-3 cursor-pointer items-start"
                        >
                          <div className="flex flex-col items-start text-left gap-1 w-full">
                            <span className="text-sm font-medium text-slate-900 leading-tight">
                              {firstLine}
                            </span>
                            {secondLine && (
                              <span className="text-sm text-slate-500 font-normal leading-tight">
                                {secondLine}
                              </span>
                            )}
                            {status && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-700 leading-none">
                                {status}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })
                  ) : (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      Data not found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 bg-white">
          <DialogClose asChild>
            <Button className="rounded-md bg-gray-200 px-5 text-sm font-medium text-black hover:bg-gray-300">
              Cancel
            </Button>
          </DialogClose>

          <Button
            onClick={handleDone}
            className="rounded-md bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>

      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Project Added Successfully!"
      />
    </Dialog>
  );
}
