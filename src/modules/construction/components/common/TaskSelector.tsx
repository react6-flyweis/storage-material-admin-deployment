import { useMemo } from "react";
import CustomSelect from "./CustomSelect";
import { useTasksQuery } from "../../construction.hooks";
import type { ApiTaskItem } from "../../construction.api";
import { Loader2 } from "lucide-react";

type TaskSelectorProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
};

export default function TaskSelector({
  value,
  onValueChange,
  placeholder = "Select Task",
}: TaskSelectorProps) {
  const { data: tasksResponse, isLoading } = useTasksQuery();

  const options = useMemo(() => {
    const allTasks = tasksResponse?.data?.tasks || [];
    return allTasks.map((t: ApiTaskItem) => ({
      label: t.title,
      value: t._id,
    }));
  }, [tasksResponse]);

  if (isLoading && options.length === 0) {
    return (
      <div className="w-full bg-white px-4 h-[40px] rounded-[8px] border flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span>Loading tasks...</span>
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
