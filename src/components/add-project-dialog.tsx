import * as React from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type Project = {
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

export default function AddProjectDialog({
  children,
  projects = [],
  isLoading = false,
  initialSelected = null,
  onDone,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const filteredItems = React.useMemo(() => {
    const list = projects || [];
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter((project) => {
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
  }, [projects, search]);

  const handleSelect = (project: Project) => {
    const displayName = getProjectDisplayName(project);
    onDone({
      ...project,
      name: displayName,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ? (
          children
        ) : (
          <button
            type="button"
            className="flex items-center justify-between w-full h-11 px-3 text-sm text-left bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="truncate text-gray-700">Select project (lead)</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-[320px] sm:w-95 p-0 shadow-lg border border-gray-200 rounded-lg overflow-hidden bg-white z-50"
      >
        <div className="flex items-center border-b border-gray-200 px-3 bg-[#FAFAFA]">
          <Search className="h-4 w-4 shrink-0 text-gray-400 mr-2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            autoFocus
          />
        </div>

        <div className="max-h-75 overflow-y-auto p-1 divide-y divide-gray-50">
          {isLoading ? (
            <div className="p-4 text-sm text-gray-500 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              <span>Loading projects...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">
              No projects found.
            </div>
          ) : (
            filteredItems.map((project) => {
              const isSelected = project.id === initialSelected;
              const firstLine = getProjectDisplayName(project);
              const secondLine = getProjectSecondLine(project);
              const status = getProjectStatus(project);

              return (
                <div
                  key={project.id}
                  onClick={() => handleSelect(project)}
                  className={cn(
                    "flex items-start gap-2.5 p-2.5 rounded-md cursor-pointer transition-colors text-left",
                    isSelected
                      ? "bg-blue-50/80 text-blue-900"
                      : "hover:bg-gray-100 text-gray-900",
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 mt-0.5 shrink-0 text-blue-600",
                      isSelected ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-sm font-medium leading-tight truncate">
                      {firstLine}
                    </span>
                    {secondLine && (
                      <span className="text-xs text-gray-500 truncate leading-tight">
                        {secondLine}
                      </span>
                    )}
                    {status && (
                      <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 w-fit leading-none">
                        {status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
