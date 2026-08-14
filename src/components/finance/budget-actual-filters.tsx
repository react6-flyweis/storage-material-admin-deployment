import { CalendarDays, Filter } from "lucide-react";
import { FilterSelect } from "./budget-actual-filter-select";

interface BudgetActualFiltersProps {
  groupBy: string;
  setGroupBy: (val: string) => void;
  department: string;
  setDepartment: (val: string) => void;
  costCategory: string;
  setCostCategory: (val: string) => void;
  dateRange: string;
  setDateRange: (val: string) => void;
}

export function BudgetActualFilters({
  groupBy,
  setGroupBy,
  department,
  setDepartment,
  costCategory,
  setCostCategory,
  dateRange,
  setDateRange,
}: BudgetActualFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterSelect
        label="Group by"
        value={groupBy}
        onValueChange={setGroupBy}
        options={[
          "Group by: Cost Head",
          "Group by: Department",
          "Group by: Project",
          "Group by: Vendor",
        ]}
        icon={Filter}
      />
      <FilterSelect
        label="Department"
        value={department}
        onValueChange={setDepartment}
        options={[
          "Department: All",
          "Department: Procurement",
          "Department: Operations",
          "Department: Finance",
        ]}
        icon={Filter}
      />
      <FilterSelect
        label="Cost Category"
        value={costCategory}
        onValueChange={setCostCategory}
        options={[
          "Cost Category: All",
          "Cost Category: Direct",
          "Cost Category: Indirect",
          "Cost Category: Contingency",
        ]}
        icon={Filter}
      />
      <FilterSelect
        label="Date Range"
        value={dateRange}
        onValueChange={setDateRange}
        options={[
          "24 Mar 2025 - 31 Mar 2025",
          "01 Apr 2025 - 30 Apr 2025",
          "01 May 2025 - 31 May 2025",
        ]}
        icon={CalendarDays}
        className="sm:w-63.75"
      />
    </div>
  );
}
