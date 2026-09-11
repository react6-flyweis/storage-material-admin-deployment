import { Filter, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { FilterSelect, type FilterSelectOption } from "./budget-actual-filter-select";
import DateRangeFilter from "@/components/ui/date-range-filter";
import { Button } from "@/components/ui/button";

interface BudgetActualFiltersProps {
  groupBy: string;
  setGroupBy: (val: string) => void;
  department: string;
  setDepartment: (val: string) => void;
  costCategory: string;
  setCostCategory: (val: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (val: DateRange | undefined) => void;
  onClearFilters?: () => void;
  isFiltered?: boolean;
}

const groupByOptions: FilterSelectOption[] = [
  { label: "Group by: Cost Head", value: "costHead" },
  { label: "Group by: Department", value: "department" },
  { label: "Group by: Cost Category", value: "costCategory" },
  { label: "Group by: Project", value: "project" },
  { label: "Group by: Vendor", value: "vendor" },
];

const departmentOptions: FilterSelectOption[] = [
  { label: "Department: All", value: "all" },
  { label: "Department: Plant", value: "Plant" },
  { label: "Department: Procurement", value: "Procurement" },
  { label: "Department: Operations", value: "Operations" },
  { label: "Department: Finance", value: "Finance" },
  { label: "Department: Logistics", value: "Logistics" },
  { label: "Department: Engineering", value: "Engineering" },
];

const costCategoryOptions: FilterSelectOption[] = [
  { label: "Cost Category: All", value: "all" },
  { label: "Cost Category: Freight", value: "Freight" },
  { label: "Cost Category: Direct", value: "Direct" },
  { label: "Cost Category: Indirect", value: "Indirect" },
  { label: "Cost Category: Materials", value: "Materials" },
  { label: "Cost Category: Labor", value: "Labor" },
  { label: "Cost Category: Equipment", value: "Equipment" },
  { label: "Cost Category: Contingency", value: "Contingency" },
];

export function BudgetActualFilters({
  groupBy,
  setGroupBy,
  department,
  setDepartment,
  costCategory,
  setCostCategory,
  dateRange,
  setDateRange,
  onClearFilters,
  isFiltered,
}: BudgetActualFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterSelect
        label="Group by"
        value={groupBy}
        onValueChange={setGroupBy}
        options={groupByOptions}
        icon={Filter}
      />
      <FilterSelect
        label="Department"
        value={department}
        onValueChange={setDepartment}
        options={departmentOptions}
        icon={Filter}
      />
      <FilterSelect
        label="Cost Category"
        value={costCategory}
        onValueChange={setCostCategory}
        options={costCategoryOptions}
        icon={Filter}
      />
      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        className="w-full sm:w-60 bg-white"
      />
      {isFiltered && onClearFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="h-10 gap-1.5 border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50 bg-white"
        >
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}

