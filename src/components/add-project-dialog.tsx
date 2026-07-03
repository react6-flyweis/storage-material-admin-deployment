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
  name: string;
  code?: string;
  location?: string;
};

type Props = {
  children?: React.ReactNode;
  projects?: Project[];
  isLoading?: boolean;
  initialSelected?: string | null;
  onDone: (project: Project | null) => void;
};

const defaultProjects: Project[] = [
  { id: "1", name: "Riverside Site A", code: "PRJ-001" },
  { id: "2", name: "Riverside Site B", code: "PRJ-002" },
  { id: "3", name: "Oakridge Expansion", code: "PRJ-003" },
  { id: "4", name: "North Depot Buildout", code: "PRJ-004" },
  { id: "5", name: "Harbor Steel Yard", code: "PRJ-005" },
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
  const [menuOpen, setMenuOpen] = React.useState(false);
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
      setMenuOpen(false);
    }
  }, [open]);

  const filteredItems = items.filter((project) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      project.name.toLowerCase().includes(query) ||
      project.code?.toLowerCase().includes(query) ||
      project.location?.toLowerCase().includes(query)
    );
  });

  const selectedProject =
    items.find((project) => project.id === selectedId) ?? items[0] ?? null;

  const handleDone = () => {
    onDone(selectedProject);
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

              <Select value={selectedId || undefined} onValueChange={(val) => setSelectedId(val)}>
                <SelectTrigger className="w-full h-11 rounded-xl border-gray-300 bg-white px-4 text-left text-sm text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {isLoading ? (
                    <div className="p-3 text-sm text-gray-500 flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} {project.code && <span className="ml-2 text-xs text-gray-400">{project.code}</span>}
                      </SelectItem>
                    ))
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
