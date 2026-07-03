import { useMemo, useState } from "react";
import { Eye, UserPlus2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AssignSalesDialog from "@/components/leads/assign-sales-dialog";
import AssignEscalationDialog from "@/components/leads/assign-escalation-dialog";
import ResolveEscalationDialog from "@/components/leads/resolve-escalation-dialog";
import LeadDetailDialog from "@/components/leads/lead-detail-dialog";
import { useEscalatedLeadsQuery } from "@/modules/leads/leads.hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EscalationStatus = "pending" | "assigned" | "resolved";

type EscalationItem = {
  _id: string;
  projectName?: string;
  lifecycleStatus?: string;
  quoteValue?: number;
  customerId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    customerName?: string;
    email?: string;
  } | null;
  assignedTo?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  customerName?: string;
  buildingType?: string;
  location?: string;
  escalation?: {
    _id: string;
    note?: string;
    status?: EscalationStatus;
    createdAt?: string;
    resolvedAt?: string;
  } | null;
  jobId?: string;
  projectId?: string;
};

interface EscalatedLead {
  id: string;
  name: string;
  projectName?: string;
  leadId: string;
  quoteId: string;
  type: string;
  assignedTo?: string;
  lifecycleStatus?: string;
  escalatedDate: string;
  escalationStatus: EscalationStatus;
  note: string;
}

const statusClasses: Record<EscalationStatus, string> = {
  pending: "bg-violet-100 text-violet-700",
  assigned: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

const statusLabels: Record<EscalationStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  resolved: "Resolved",
};

const lifecycleStatusClasses: Record<string, string> = {
  warm: "bg-violet-100 text-violet-700",
  hot: "bg-amber-100 text-amber-700",
  cold: "bg-sky-100 text-sky-700",
  "proposal sent": "bg-yellow-100 text-yellow-700",
  "released to plant": "bg-slate-100 text-slate-700",
  "sent to admin": "bg-slate-100 text-slate-700",
  "initial contact": "bg-slate-100 text-slate-700",
};

const normalizeLifecycleStatus = (value?: string | null) => {
  if (!value) return undefined;
  const v = value.toString().trim().toLowerCase();
  if (v.includes("hot")) return "Hot";
  if (v.includes("warm")) return "Warm";
  if (v.includes("cold")) return "Cold";
  
  // convert to capitalized words with spaces
  const formatted = value.split('_').map((word, i) => i === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()).join(' ');
  return formatted;
};

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

const formatLeadType = (lead?: EscalationItem | null) => {
  if (!lead) return "Not available";

  const parts = [lead.buildingType, lead.location]
    .map((part) => part?.trim())
    .filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return "Not available";
};

const getCustomerName = (customer?: EscalationItem['customerId'] | string | null) => {
  if (!customer || typeof customer === "string") {
    return null;
  }

  if (customer.customerName) return customer.customerName;

  const first = customer.firstName?.trim() || "";
  const last = customer.lastName?.trim() || "";
  const full = `${first} ${last}`.trim();
  return full || null;
};

const getAssignedName = (escalation: EscalationItem) => {
  if (escalation.assignedTo) {
    const first = escalation.assignedTo.firstName?.trim() || "";
    const last = escalation.assignedTo.lastName?.trim() || "";
    const full = `${first} ${last}`.trim();
    if (full) return full;
  }
  return null;
};

const getLeadName = (escalation: EscalationItem) =>
  escalation.customerName || getCustomerName(escalation.customerId) || "Unknown";

const getEscalationRows = (escalations: EscalationItem[]): EscalatedLead[] =>
  escalations.map((escalation) => ({
    id: escalation.escalation?._id || escalation._id,
    leadId: escalation._id,
    name: getLeadName(escalation),
    projectName: escalation.projectName || "",
    quoteId: escalation.jobId || escalation.projectId || escalation._id || "N/A",
    type: formatLeadType(escalation),
    assignedTo: getAssignedName(escalation) ?? undefined,
    lifecycleStatus: normalizeLifecycleStatus(escalation.lifecycleStatus),
    escalatedDate: formatDate(escalation.escalation?.resolvedAt || escalation.escalation?.createdAt),
    escalationStatus: escalation.escalation?.status || "pending",
    note: escalation.escalation?.note?.trim() || "No note provided.",
  }));

export default function EscalatedLeadsPage() {
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const {
    data: escalationsResponse,
    isLoading,
    isError,
    refetch,
  } = useEscalatedLeadsQuery();

  const escalatedLeads = useMemo(
    () => getEscalationRows(escalationsResponse?.data?.leads ?? escalationsResponse?.data?.escalations ?? []),
    [escalationsResponse],
  );

  const allSelected = useMemo(
    () =>
      escalatedLeads.length > 0 &&
      selectedLeadIds.length === escalatedLeads.length,
    [selectedLeadIds, escalatedLeads.length],
  );

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(escalatedLeads.map((lead) => lead.id));
      return;
    }
    setSelectedLeadIds([]);
  };

  const handleToggleLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeadIds((prev) => [...prev, leadId]);
      return;
    }
    setSelectedLeadIds((prev) => prev.filter((id) => id !== leadId));
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl text-gray-900">
          Escalated Leads - {isLoading ? "..." : escalatedLeads.length}
        </h1>
        <p className="text-gray-500 mt-1">Assign and view leads</p>
      </div>

      <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        {isError ? (
          <div className="px-6 py-10 text-center space-y-3">
            <p className="text-sm text-slate-600">
              Unable to load escalated leads.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-slate-50/70 border-slate-200">
                <TableHead className="w-10 px-4">
                  <input
                    aria-label="Select all escalated leads"
                    className="h-3.5 w-3.5 rounded border-slate-300"
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) => handleToggleAll(event.target.checked)}
                    disabled={escalatedLeads.length === 0}
                  />
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Lead Info
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Assigned To
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Status
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Date Escalated
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Escalation Status
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Note
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow
                    key={`escalation-skeleton-${index}`}
                    className="border-slate-100"
                  >
                    <TableCell className="px-4">
                      <div className="h-3.5 w-3.5 rounded border border-slate-200 bg-slate-100 animate-pulse" />
                    </TableCell>
                    <TableCell className="px-3 py-4" colSpan={7}>
                      <div className="h-4 rounded bg-slate-100 animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : escalatedLeads.length === 0 ? (
                <TableRow className="border-slate-100">
                  <TableCell colSpan={8} className="px-6 py-10 text-center">
                    <p className="text-sm text-slate-600">
                      No escalated leads found.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                escalatedLeads.map((lead) => {
                  const selected = selectedLeadIds.includes(lead.id);
                  const status = lead.escalationStatus;

                  return (
                    <TableRow
                      key={lead.id}
                      data-state={selected ? "selected" : undefined}
                      className="border-slate-100"
                    >
                      <TableCell className="px-4">
                        <input
                          aria-label={`Select ${lead.name}`}
                          className="h-3.5 w-3.5 rounded border-slate-300"
                          type="checkbox"
                          checked={selected}
                          onChange={(event) =>
                            handleToggleLead(lead.id, event.target.checked)
                          }
                        />
                      </TableCell>

                      <TableCell className="px-3 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                          {lead.projectName && (
                            <p className="text-[12px] text-slate-500 mt-0.5">
                              {lead.projectName}
                            </p>
                          )}
                          {/* <p className="text-[12px] text-slate-500 mt-0.5">
                            {lead.quoteId}
                          </p> */}
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {lead.type}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="px-3 py-3">
                        {lead.assignedTo ? (
                          <div>
                            <p className="text-sm text-slate-900">
                              {lead.assignedTo}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              1 person assigned
                            </p>
                          </div>
                        ) : (
                          <AssignEscalationDialog
                            escalationId={lead.id}
                            note={lead.note}
                            trigger={
                              <button
                                type="button"
                                className="inline-flex items-center gap-1.5 text-sm text-violet-700 hover:text-violet-800"
                              >
                                <UserPlus2 className="h-3.5 w-3.5 text-green-500" />
                                Assign
                              </button>
                            }
                          />
                        )}
                      </TableCell>

                      <TableCell className="px-3 py-3">
                        <Badge
                          className={`rounded-full px-2.5 py-0.5 ${
                            lifecycleStatusClasses[
                              (lead.lifecycleStatus || "").toLowerCase()
                            ] ?? "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {lead.lifecycleStatus ?? "Not available"}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-3 py-3 text-sm text-slate-700">
                        {lead.escalatedDate}
                      </TableCell>

                      <TableCell className="px-3 py-3">
                        <Badge
                          className={`rounded-full px-2.5 py-0.5 ${statusClasses[status]}`}
                        >
                          {statusLabels[status]}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-3 py-3 max-w-72 whitespace-normal text-xs text-slate-600 leading-5">
                        {lead.note}
                      </TableCell>

                      <TableCell className="px-3 py-3">
                        <div className="flex items-center justify-end gap-3 text-slate-500">
                          {status !== "resolved" && (
                            <ResolveEscalationDialog
                              escalationId={lead.id}
                              trigger={
                                <button
                                  type="button"
                                  className="text-emerald-600 hover:text-emerald-700"
                                  aria-label="Resolve escalation"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                              }
                            />
                          )}
                          <LeadDetailDialog
                            lead={{
                              id: lead.leadId,
                              name: lead.name,
                              assignedToName: lead.assignedTo,
                              quoteValue: lead.quoteId,
                              workshop: lead.type,
                            }}
                            escalationReason={lead.note}
                            trigger={
                              <button
                                type="button"
                                className="text-purple-600"
                                aria-label="View lead"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            }
                          />
                          {/* <button
                            type="button"
                            className="hover:text-emerald-600"
                            aria-label="Edit lead"
                          >
                            <Pencil className="h-4 w-4" />
                          </button> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
