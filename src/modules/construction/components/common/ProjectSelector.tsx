import { useMemo } from "react";
import CustomSelect from "./CustomSelect";
import { useLeadsQuery } from "@/modules/leads/leads.hooks";
import { Loader2 } from "lucide-react";

type ProjectSelectorProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
};

export default function ProjectSelector({
  value,
  onValueChange,
  placeholder = "Select Project",
}: ProjectSelectorProps) {
  const { data: leadsData, isLoading } = useLeadsQuery(1, 100);

  const options = useMemo(() => {
    if (!leadsData?.data?.leads) return [];
    return leadsData.data.leads.map((lead) => {
      let label = "";
      if (lead.projectName) {
        label = lead.projectName;
      } else if (lead.buildingType) {
        label = lead.buildingType;
      } else {
        label = `Lead ${lead._id.substring(0, 6)}`;
      }
      return {
        label,
        value: lead._id,
      };
    });
  }, [leadsData]);

  if (isLoading && options.length === 0) {
    return (
      <div className="w-full bg-white px-4 h-[40px] rounded-[8px] border flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span>Loading projects...</span>
      </div>
    );
  }

  return (
    <CustomSelect
      title={placeholder}
      options={options}
      value={value}
      onChange={onValueChange}
      width="100%"
      searchable
    />
  );
}
