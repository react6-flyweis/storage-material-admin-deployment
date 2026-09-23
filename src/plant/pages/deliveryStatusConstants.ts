export type DeliveryStatusType =
  | "material_prepared"
  | "loaded"
  | "picked_up"
  | "in_transit"
  | "staged"
  | "dispatched_to_site";

export interface StatusDefinition {
  value: DeliveryStatusType;
  label: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
}

export const DELIVERY_STATUS_SEQUENCE: DeliveryStatusType[] = [
  "material_prepared",
  "loaded",
  "picked_up",
  "in_transit",
  "staged",
  "dispatched_to_site",
];

export const STATUS_DEFINITIONS: Record<DeliveryStatusType, StatusDefinition> = {
  material_prepared: {
    value: "material_prepared",
    label: "Material Prepared",
    description: "Materials are prepared and ready for loading",
    badgeBg: "bg-[#EEF2FF]",
    badgeText: "text-[#4F46E5]",
    badgeBorder: "border-[#EEF2FF]",
    dotColor: "#4F46E5",
  },
  loaded: {
    value: "loaded",
    label: "Loaded",
    description: "Cargo is loaded onto transport vehicle",
    badgeBg: "bg-[#FDF4FF]",
    badgeText: "text-[#C026D3]",
    badgeBorder: "border-[#FDF4FF]",
    dotColor: "#C026D3",
  },
  picked_up: {
    value: "picked_up",
    label: "Picked Up",
    description: "Shipment has been picked up by the carrier",
    badgeBg: "bg-[#FFF7ED]",
    badgeText: "text-[#EA580C]",
    badgeBorder: "border-[#FFF7ED]",
    dotColor: "#EA580C",
  },
  in_transit: {
    value: "in_transit",
    label: "In Transit",
    description: "Delivery is currently in transit to destination",
    badgeBg: "bg-[#EFF6FF]",
    badgeText: "text-[#2563EB]",
    badgeBorder: "border-[#EFF6FF]",
    dotColor: "#2563EB",
  },
  staged: {
    value: "staged",
    label: "Staged",
    description: "Delivery is staged at facility/staging area",
    badgeBg: "bg-[#FEFCE8]",
    badgeText: "text-[#CA8A04]",
    badgeBorder: "border-[#FEFCE8]",
    dotColor: "#CA8A04",
  },
  dispatched_to_site: {
    value: "dispatched_to_site",
    label: "Dispatched To Site",
    description: "Shipment has been dispatched directly to site",
    badgeBg: "bg-[#ECFDF5]",
    badgeText: "text-[#059669]",
    badgeBorder: "border-[#ECFDF5]",
    dotColor: "#059669",
  },
};

export const statusBadgeConfig: Record<string, { bg: string; text: string; border: string }> = {
  Scheduled: { bg: "bg-[#E6F0FF]", text: "text-[#155DFC]", border: "border-[#E6F0FF]" },
  Confirmed: { bg: "bg-[#E6FFEF]", text: "text-[#00C853]", border: "border-[#E6FFEF]" },
  "In Transit": { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]", border: "border-[#EFF6FF]" },
  Delivered: { bg: "bg-[#E6FFEF]", text: "text-[#00C853]", border: "border-[#E6FFEF]" },
  Rescheduled: { bg: "bg-[#FFF9E6]", text: "text-[#D08700]", border: "border-[#FFF9E6]" },
  carrier_selected: { bg: "bg-[#E6F0FF]", text: "text-[#155DFC]", border: "border-[#E6F0FF]" },
  scheduled: { bg: "bg-[#E6F0FF]", text: "text-[#155DFC]", border: "border-[#E6F0FF]" },
  confirmed: { bg: "bg-[#E6FFEF]", text: "text-[#00C853]", border: "border-[#E6FFEF]" },
  material_prepared: { bg: "bg-[#EEF2FF]", text: "text-[#4F46E5]", border: "border-[#EEF2FF]" },
  loaded: { bg: "bg-[#FDF4FF]", text: "text-[#C026D3]", border: "border-[#FDF4FF]" },
  picked_up: { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]", border: "border-[#FFF7ED]" },
  in_transit: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]", border: "border-[#EFF6FF]" },
  staged: { bg: "bg-[#FEFCE8]", text: "text-[#CA8A04]", border: "border-[#FEFCE8]" },
  dispatched_to_site: { bg: "bg-[#ECFDF5]", text: "text-[#059669]", border: "border-[#ECFDF5]" },
  delivered: { bg: "bg-[#E6FFEF]", text: "text-[#00C853]", border: "border-[#E6FFEF]" },
  rescheduled: { bg: "bg-[#FFF9E6]", text: "text-[#D08700]", border: "border-[#FFF9E6]" },
};

export const normalizeStatusKey = (status?: string): string => {
  if (!status) return "";
  return status.trim().toLowerCase().replace(/\s+/g, "_");
};

export const formatStatusLabel = (status: string): string => {
  const norm = normalizeStatusKey(status) as DeliveryStatusType;
  if (STATUS_DEFINITIONS[norm]) {
    return STATUS_DEFINITIONS[norm].label;
  }
  return status
    .split(/_|\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const getStatusBadgeStyle = (status: string) => {
  const norm = normalizeStatusKey(status);
  return (
    statusBadgeConfig[status] ||
    statusBadgeConfig[norm] ||
    statusBadgeConfig["Scheduled"]
  );
};

export const getStatusIndex = (status?: string): number => {
  const norm = normalizeStatusKey(status);
  return DELIVERY_STATUS_SEQUENCE.indexOf(norm as DeliveryStatusType);
};

export const getNextStatus = (currentStatus?: string): DeliveryStatusType | null => {
  const norm = normalizeStatusKey(currentStatus);
  const idx = DELIVERY_STATUS_SEQUENCE.indexOf(norm as DeliveryStatusType);
  if (idx === -1) {
    return DELIVERY_STATUS_SEQUENCE[0];
  }
  if (idx < DELIVERY_STATUS_SEQUENCE.length - 1) {
    return DELIVERY_STATUS_SEQUENCE[idx + 1];
  }
  return null;
};

export const isFinalStatus = (status?: string): boolean => {
  const norm = normalizeStatusKey(status);
  return norm === "dispatched_to_site" || norm === "delivered";
};
