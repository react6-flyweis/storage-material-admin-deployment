export const formatStatusText = (status: string) => {
  if (!status) return "";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
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


export const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export const convertTo24Hour = (timeStr: string) => {
  if (!timeStr) return "";
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;

  try {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return "";
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  } catch {
    return "";
  }
};
