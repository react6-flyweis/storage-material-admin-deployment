export type BusinessUnitType = "steel" | "storage_material";

export const BUSINESS_UNIT_OPTIONS = [
  { value: "steel", label: "Steel Building Depot" },
  { value: "storage_material", label: "Storage Material Platform" },
] as const;

export const BUSINESS_UNIT_FILTER_OPTIONS = [
  { value: "all", label: "All Business Units" },
  { value: "steel", label: "Steel Building Depot" },
  { value: "storage_material", label: "Storage Material Platform" },
  { value: "none", label: "Not set" },
] as const;

export function normalizeBusinessUnit(value?: string | null): BusinessUnitType | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  if (
    trimmed === "storage_material" ||
    trimmed === "storage material" ||
    trimmed === "storage material platform" ||
    trimmed === "storage_material_platform"
  ) {
    return "storage_material";
  }
  if (
    trimmed === "steel" ||
    trimmed === "steel building depot" ||
    trimmed === "steel_building_depot"
  ) {
    return "steel";
  }
  return null;
}

export function formatBusinessUnit(
  value?: string | null,
  label?: string | null,
): string {
  if (label && label.trim() !== "") {
    const normalizedLabel = normalizeBusinessUnit(label);
    if (normalizedLabel) {
      const option = BUSINESS_UNIT_OPTIONS.find((opt) => opt.value === normalizedLabel);
      if (option) return option.label;
    }
    const lower = label.trim().toLowerCase();
    if (lower === "platform") {
      return "Not set";
    }
  }
  if (!value) {
    return "Not set";
  }
  const normalizedValue = normalizeBusinessUnit(value);
  if (!normalizedValue) {
    return "Not set";
  }
  const option = BUSINESS_UNIT_OPTIONS.find((opt) => opt.value === normalizedValue);
  return option ? option.label : "Not set";
}

export function getBusinessUnitBadgeClassName(unit?: string | null): string {
  const normalized = normalizeBusinessUnit(unit);
  switch (normalized) {
    case "storage_material":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "steel":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}
