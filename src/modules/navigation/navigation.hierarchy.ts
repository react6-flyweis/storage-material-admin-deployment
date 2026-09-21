/**
 * Route hierarchy fallback resolver.
 * When a user enters a page directly (e.g. from bookmark, direct link, or after browser refresh)
 * and has no previous history in this session, this resolver determines the logical parent route.
 */
export function getHierarchicalFallback(pathname: string): string {
  // Normalize pathname (remove trailing slash)
  const path = pathname.replace(/\/+$/, "") || "/";

  // --- PLANT MODULE ---
  // Plant Project Details
  if (path.startsWith("/plant/projects/")) {
    return "/plant/projects";
  }
  // Plant Load Planning sub-tabs/details
  if (path.includes("/plant/load-planning/") && path.includes("/details/")) {
    const match = path.match(/^(\/plant\/load-planning\/[^/]+)/);
    return match ? match[1] : "/plant/load-planning";
  }
  if (path.includes("/plant/load-planning/") && path.includes("/comparison-result")) {
    return "/plant/load-planning";
  }
  if (/^\/plant\/load-planning\/[^/]+/.test(path)) {
    return "/plant/load-planning";
  }
  // Shipper Quotation
  if (path.includes("/plant/shipper-quotation/") && path.includes("/file/")) {
    const match = path.match(/^(\/plant\/shipper-quotation\/[^/]+)/);
    return match ? match[1] : "/plant/shipper-quotation";
  }
  if (/^\/plant\/shipper-quotation\/[^/]+/.test(path)) {
    return "/plant/shipper-quotation";
  }
  // Order Verification
  if (path.startsWith("/plant/order-verification/")) {
    return "/plant/projects";
  }
  // Packing List
  if (path.includes("/plant/packing-list/") && path.includes("/details/")) {
    const match = path.match(/^(\/plant\/packing-list\/[^/]+)/);
    return match ? match[1] : "/plant/packing-list";
  }
  if (/^\/plant\/packing-list\/[^/]+/.test(path)) {
    return "/plant/packing-list";
  }
  // QR Labels
  if (/^\/plant\/qr-labels\/[^/]+/.test(path)) {
    return "/plant/qr-labels";
  }
  // Shippers
  if (path.startsWith("/plant/shippers/")) {
    return "/plant/shippers";
  }
  // Freight Carriers
  if (path.startsWith("/plant/freight-carriers/")) {
    return "/plant/freight-carriers";
  }
  // Freight Loads & Requests
  if (path.startsWith("/plant/freight-loads/details/") || path.startsWith("/plant/freight-request/")) {
    return "/plant/freight-loads";
  }
  // BOM details & Uploaded BOMs
  if (path.startsWith("/plant/bom-details/") || path.startsWith("/plant/uploaded-bom-files/")) {
    return "/plant/uploaded-bom-files";
  }
  // Deliveries
  if (path.startsWith("/plant/delivery-details/")) {
    return "/plant/all-deliveries";
  }
  // General plant subpages
  if (path.startsWith("/plant/") && path !== "/plant") {
    return "/plant";
  }

  // --- CUSTOMER MODULE ---
  // Sub-pages of project details
  // Pattern: /customers/:id/project-:subpath/:projectId
  const custSubMatch = path.match(/^(\/customers\/[^/]+)\/project-[^/]+\/([^/]+)/);
  if (custSubMatch) {
    const [, custBase, projId] = custSubMatch;
    return `${custBase}/project-details/${projId}`;
  }
  // Project details: /customers/:id/project-details/:projectId -> /customers/:id/projects
  const custProjMatch = path.match(/^(\/customers\/[^/]+)\/project-details\/[^/]+/);
  if (custProjMatch) {
    return `${custProjMatch[1]}/projects`;
  }
  // Customer Add project: /customers/:id/projects/new -> /customers/:id/projects
  const custNewProjMatch = path.match(/^(\/customers\/[^/]+)\/projects\/new/);
  if (custNewProjMatch) {
    return `${custNewProjMatch[1]}/projects`;
  }
  // Edit customer details
  const custEditMatch = path.match(/^(\/customers\/[^/]+)\/edit/);
  if (custEditMatch) {
    return custEditMatch[1];
  }
  // Customer sub-pages (projects, info, payments, status, etc.)
  const custMatch = path.match(/^(\/customers\/[^/]+)(\/|$)/);
  if (custMatch && path !== "/customers") {
    return "/customers";
  }
  // Contracts
  if (path.startsWith("/customers/contracts/")) {
    return "/customers/contracts";
  }
  // Meetings
  if (path.startsWith("/customers/meetings/")) {
    return "/customers/meetings";
  }

  // --- INVOICE MODULE ---
  if (
    path.startsWith("/invoice/preview") ||
    path.startsWith("/invoice/new") ||
    /^\/invoice\/[^/]+(\/edit)?$/.test(path)
  ) {
    return "/invoice/list";
  }
  if (path.startsWith("/invoice/vendor-preview/")) {
    return "/invoice/invoices-management";
  }
  if (path.startsWith("/invoice/carrier-preview/")) {
    return "/invoice/carrier-invoices";
  }
  if (path.startsWith("/invoice/")) {
    return "/invoice/list";
  }

  // --- LEADS MODULE ---
  if (path.startsWith("/leads/quotation/") || /^\/leads\/[^/]+\/edit$/.test(path)) {
    const match = path.match(/^\/leads\/([^/]+)/);
    return match ? `/leads/${match[1]}` : "/leads";
  }
  if (path.startsWith("/leads/")) {
    return "/leads";
  }

  // --- FINANCE MODULE ---
  if (path.startsWith("/finance/budget-actual/")) {
    return "/finance/budget-actual";
  }
  if (path.startsWith("/finance/")) {
    return "/finance";
  }

  // --- PAYMENTS MODULE ---
  if (path.startsWith("/payments/customer/") || path === "/payments/detailed-tax-report") {
    return "/payments";
  }

  // --- EMPLOYEES MODULE ---
  if (/^\/employees\/[^/]+/.test(path)) {
    return "/employees";
  }

  // --- CONSTRUCTION MODULE ---
  if (path === "/construction/project-view-page") {
    return "/construction/projects";
  }
  if (path === "/construction/material-view-page") {
    return "/construction/materials";
  }
  if (path.startsWith("/construction/")) {
    return "/construction";
  }

  // --- ACCOUNTS MODULE ---
  if (path.startsWith("/accounts/")) {
    return "/accounts";
  }

  // --- GENERIC URL FALLBACK: Pop last segment ---
  const segments = path.split("/").filter(Boolean);
  if (segments.length > 1) {
    segments.pop();
    return "/" + segments.join("/");
  }

  // Default fallback is root dashboard
  return "/";
}
