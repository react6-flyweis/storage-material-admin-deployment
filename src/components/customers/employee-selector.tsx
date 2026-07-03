import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminEmployeesQuery } from "@/modules/employees/employees.hooks";
import { Loader2 } from "lucide-react";

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  roleFilter?: string;
  className?: string;
  error?: boolean;
  initialName?: string;
};

export default function EmployeeSelector({
  value,
  onValueChange,
  placeholder = "Select an employee...",
  roleFilter,
  className = "w-full",
  error,
  initialName,
}: Props) {
  // Fetch employees from API
  const { data: employeesData, isLoading } = useAdminEmployeesQuery();

  const employees = useMemo(() => {
    if (!employeesData?.data?.employees) return [];
    
    let filteredEmployees = employeesData.data.employees;
    
    // Filter by role if specified
    if (roleFilter) {
      filteredEmployees = filteredEmployees.filter(
        employee => employee.role?.toLowerCase() === roleFilter.toLowerCase()
      );
    }
    
    return filteredEmployees.map(employee => ({
      id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role || 'sales',
      isActive: employee.isActive !== false,
    }));
  }, [employeesData, roleFilter]);

  return (
    <Select value={value} onValueChange={(v) => {
      if (v) onValueChange(v);
    }}>
      <SelectTrigger className={className} aria-invalid={error}>
        <SelectValue placeholder={placeholder}>
          {value ? (
            <div className="flex items-center gap-1.5 line-clamp-1">
              {employees.find((e) => e.id === value)?.name || initialName || placeholder}
            </div>
          ) : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {/* Fallback SelectItem is CRITICAL for Radix UI. If it mounts and doesn't find the selected value, it will wipe the state! */}
        {value && !employees.some((e) => e.id === value) && (
          <SelectItem value={value} className="hidden">
            {initialName || "Loading..."}
          </SelectItem>
        )}

        {isLoading && employees.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading employees...</span>
          </div>
        ) : employees.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-500">
            No employees found
          </div>
        ) : (
          <>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{employee.name}</span>
                  <span className="text-xs text-gray-500">
                    {employee.role} • {employee.email}
                  </span>
                </div>
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
}