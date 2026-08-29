import type { NotificationType } from "./notifications.types";

export function getNotificationRoute(
  refModel?: string | null,
  refId?: string | null,
  type?: NotificationType | string
): string {
  const model = (refModel || type || "").toLowerCase();

  switch (model) {
    case "delivery":
      return refId ? `/plant/delivery-details/${refId}` : "/plant/all-deliveries";
    case "lead":
      return refId ? `/leads/${refId}` : "/leads";
    case "task":
      return "/construction/tasks";
    case "meeting":
      return "/customers/meetings";
    case "escalation":
      return "/leads/escalated";
    case "payment":
      return "/payments/payment-approvals";
    case "drawing":
      return "/construction/drawing-attachment";
    case "material_request":
    case "materialrequest":
      return "/construction/materials";
    case "quotation":
      return refId ? `/leads/quotation-details/${refId}` : "/leads/quotation-list";
    case "invoice":
      return refId ? `/invoice/${refId}` : "/invoice/list";
    case "freight_bid":
    case "freightbid":
    case "freightload":
    case "freight_load":
      return refId ? `/plant/freight-request-details/${refId}` : "/plant/freight-loads";
    case "chat":
      return "/communication";
    case "followup":
      return "/leads/follow-up";
    case "system":
    default:
      return "/notifications";
  }
}
