import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProjectsApi } from "@/api/projects.api";
import CustomSelect from "./CustomSelect";
import type { Project } from "@/types/projects.types";

export interface ProjectSelectorProps {
  value: string;
  onChange?: (val: string, project?: Project) => void;
  onValueChange?: (val: string, project?: Project) => void;
  showAllOption?: boolean;
  includeAllOption?: boolean;
  placeholder?: string;
  error?: boolean;
  width?: string;
  hasDelivery?: boolean;
}

export default function ProjectSelector({
  value,
  onChange,
  onValueChange,
  showAllOption = false,
  includeAllOption = false,
  placeholder = "Select Project",
  width = "100%",
  hasDelivery,
}: ProjectSelectorProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["projects-selector-list", hasDelivery],
    queryFn: () => getProjectsApi({ page: 1, limit: 100, hasDelivery }),
  });

  const projects: Project[] = useMemo(() => {
    return data?.data?.data?.projects || [];
  }, [data]);

  const effectiveValue =
    projects.find((p) => p._id === value || (p.leadId && p.leadId === value))?._id || value;

  const shouldIncludeAll = showAllOption || includeAllOption;

  const options = useMemo(() => {
    const list = projects.map((proj) => ({
      label:
        proj.projectName ||
        `${proj.buildingType || "Project"} - ${proj.location || "Site"}${
          proj.jobId ? ` (${proj.jobId})` : ""
        }`,
      value: proj._id,
    }));

    if (shouldIncludeAll) {
      return [{ label: "All Projects", value: "" }, ...list];
    }
    return list;
  }, [projects, shouldIncludeAll]);

  const handleChange = (val: string) => {
    const selectedProj = projects.find(
      (p: Project) => p._id === val || (p.leadId && p.leadId === val)
    );
    if (onChange) {
      onChange(val, selectedProj);
    }
    if (onValueChange) {
      onValueChange(val, selectedProj);
    }
  };

  return (
    <CustomSelect
      title={placeholder}
      options={options}
      value={effectiveValue}
      onChange={handleChange}
      width={width}
      searchable
      loading={isLoading}
    />
  );
}
