import { useMemo } from "react";
import CustomSelect from "./CustomSelect";
import { useAdminEmployeesQuery } from "@/modules/employees/employees.hooks";
import { Loader2 } from "lucide-react";

type EmployeeSelectorProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
};

export default function EmployeeSelector({
  value,
  onValueChange,
  placeholder = "Select Assignee",
}: EmployeeSelectorProps) {
  const { data: employeesData, isLoading } = useAdminEmployeesQuery();

  const options = useMemo(() => {
    if (!employeesData?.data?.employees) return [];
    return employeesData.data.employees.map((employee) => ({
      label: `${employee.name}${employee.role ? ` (${employee.role})` : ""}`,
      value: employee._id,
    }));
  }, [employeesData]);

  if (isLoading && options.length === 0) {
    return (
      <div className="w-full bg-white px-4 h-[40px] rounded-[8px] border flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span>Loading assignees...</span>
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
