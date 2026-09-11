export const PLANT_LIFECYCLE_STAGES = [
  "released_to_plant",
  "drawings_received",
  "bom_received",
  "bom_review",
  "material_check",
  "production_planning",
  "fabrication_started",
  "quality_inspection",
  "packing_bundling",
  "shipper_prepared",
  "ready_for_delivery",
  "dispatched",
  "delivered",
] as const;

export type PlantLifecycleStage = (typeof PLANT_LIFECYCLE_STAGES)[number];

export interface PlantLifecycleStatusConfig {
  value: PlantLifecycleStage;
  label: string;
  badgeClassName: string;
}

const normalizePlantLifecycleStatus = (status?: string) =>
  status
    ?.trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_") as PlantLifecycleStage | undefined;

export const formatPlantLifecycleStatusLabel = (status: string) =>
  status
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const PLANT_LIFECYCLE_STATUS_CONFIG: Record<
  PlantLifecycleStage,
  PlantLifecycleStatusConfig
> = {
  released_to_plant: {
    value: "released_to_plant",
    label: "Released to Plant",
    badgeClassName: "bg-[#E0F2FE] text-[#0369A1] border-[#E0F2FE]",
  },
  drawings_received: {
    value: "drawings_received",
    label: "Drawings Received",
    badgeClassName: "bg-[#F3E8FF] text-[#7C3AED] border-[#F3E8FF]",
  },
  bom_received: {
    value: "bom_received",
    label: "BOM Received",
    badgeClassName: "bg-[#E6FFFA] text-[#047857] border-[#E6FFFA]",
  },
  bom_review: {
    value: "bom_review",
    label: "BOM Review",
    badgeClassName: "bg-[#FEF3C7] text-[#B45309] border-[#FEF3C7]",
  },
  material_check: {
    value: "material_check",
    label: "Material Check",
    badgeClassName: "bg-[#FEE2E2] text-[#DC2626] border-[#FEE2E2]",
  },
  production_planning: {
    value: "production_planning",
    label: "Production Planning",
    badgeClassName: "bg-[#EEF2FF] text-[#4338CA] border-[#EEF2FF]",
  },
  fabrication_started: {
    value: "fabrication_started",
    label: "Fabrication Started",
    badgeClassName: "bg-[#DCFCE7] text-[#15803D] border-[#DCFCE7]",
  },
  quality_inspection: {
    value: "quality_inspection",
    label: "Quality Inspection",
    badgeClassName: "bg-[#DBEAFE] text-[#1D4ED8] border-[#DBEAFE]",
  },
  packing_bundling: {
    value: "packing_bundling",
    label: "Packing Bundling",
    badgeClassName: "bg-[#FAE8FF] text-[#A21CAF] border-[#FAE8FF]",
  },
  shipper_prepared: {
    value: "shipper_prepared",
    label: "Shipper Prepared",
    badgeClassName: "bg-[#FEF3C7] text-[#D97706] border-[#FEF3C7]",
  },
  ready_for_delivery: {
    value: "ready_for_delivery",
    label: "Ready for Delivery",
    badgeClassName: "bg-[#E0E7FF] text-[#4F46E5] border-[#E0E7FF]",
  },
  dispatched: {
    value: "dispatched",
    label: "Dispatched",
    badgeClassName: "bg-[#FDE68A] text-[#B45309] border-[#FDE68A]",
  },
  delivered: {
    value: "delivered",
    label: "Delivered",
    badgeClassName: "bg-[#F3F4F6] text-[#374151] border-[#F3F4F6]",
  },
};

export const PLANT_LIFECYCLE_STATUS_OPTIONS = PLANT_LIFECYCLE_STAGES.map(
  (status) => PLANT_LIFECYCLE_STATUS_CONFIG[status],
);

export const getPlantLifecycleStatusConfig = (status?: string) => {
  const normalizedStatus = normalizePlantLifecycleStatus(status);

  if (normalizedStatus && normalizedStatus in PLANT_LIFECYCLE_STATUS_CONFIG) {
    return PLANT_LIFECYCLE_STATUS_CONFIG[normalizedStatus];
  }

  const fallbackLabel = status
    ? formatPlantLifecycleStatusLabel(status)
    : "Unknown";

  return {
    value: normalizedStatus ?? "delivered",
    label: fallbackLabel,
    badgeClassName: "bg-gray-100 text-gray-600 border-gray-100",
  } satisfies PlantLifecycleStatusConfig;
};

export const getPlantLifecycleStageIndex = (status?: string) => {
  const normalizedStatus = normalizePlantLifecycleStatus(status);
  if (!normalizedStatus) return 1;
  const index = PLANT_LIFECYCLE_STAGES.indexOf(normalizedStatus);
  return index >= 0 ? index + 1 : 1;
};
