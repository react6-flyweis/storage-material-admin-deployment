import type { ComponentType } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterSelectOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly (string | FilterSelectOption)[];
  icon: ComponentType<{ className?: string }>;
  className?: string;
}

export function FilterSelect({
  label,
  value,
  onValueChange,
  options,
  icon: Icon,
  className,
}: FilterSelectProps) {
  const normalizedOptions: FilterSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={`h-10 w-full justify-between gap-3 rounded-md border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 sm:w-56.25 ${
          className ?? ""
        }`}
      >
        <span className="flex items-center gap-2 overflow-hidden truncate">
          <Icon className="h-4 w-4 shrink-0 text-slate-500" />
          <SelectValue placeholder={label} />
        </span>
      </SelectTrigger>
      <SelectContent>
        {normalizedOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

