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
  options?: Array<{ label: string; value: string }>;
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
  options: propOptions,
}: ProjectSelectorProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["projects-selector-list", hasDelivery],
    queryFn: () => getProjectsApi({ page: 1, limit: 100, hasDelivery }),
    enabled: !propOptions,
  });

  const projects: Project[] = useMemo(() => {
    return data?.data?.data?.projects || [];
  }, [data]);

  const shouldIncludeAll = showAllOption || includeAllOption;

  const options = useMemo(() => {
    if (propOptions && propOptions.length > 0) {
      if (shouldIncludeAll && !propOptions.some((o) => o.value === "" || o.value === "all")) {
        return [{ label: "All Projects", value: "all" }, ...propOptions];
      }
      return propOptions;
    }
    const list = projects.map((proj) => ({
      label:
        proj.projectName ||
        `${proj.buildingType || "Project"} - ${proj.location || "Site"}${
          proj.jobId ? ` (${proj.jobId})` : ""
        }`,
      value: proj._id,
    }));

    if (shouldIncludeAll) {
      return [{ label: "All Projects", value: "all" }, ...list];
    }
    return list;
  }, [projects, shouldIncludeAll, propOptions]);

  const effectiveValue =
    value === "" || value === "all"
      ? (options.find((o) => o.value === value || o.value === "" || o.value === "all")?.value ?? value)
      : projects.find((p) => p._id === value || (p.leadId && p.leadId === value))?._id || value;

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
      loading={!propOptions && isLoading}
    />
  );
}
