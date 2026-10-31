import { useParams } from "react-router";
import { useAppBack } from "@/modules/navigation";
import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";
import { ArrowLeft, Building2, MapPin, Mail, Phone, User, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import LeadQuotationsTab from "@/pages/leads/lead-quotations-tab";

export default function ProjectQuotationPage() {
  const { id, projectId } = useParams<{ id: string; projectId: string }>();
  // Use projectId if available, otherwise fallback to id
  const leadId = projectId || id || "";

  const { data: leadData, isLoading: isLeadLoading } = useLeadDetailQuery(leadId);
  const lead = leadData?.data?.lead;
  const customer = leadData?.data?.customer;
  const customerId = lead?.customerId || id || "";
  const defaultFallback =
    customerId && leadId ? `/customers/${customerId}/project-details/${leadId}` : "/customers";
  const { goBack } = useAppBack(defaultFallback);

  const customerFullName = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  const locationStr =
    [lead?.city, lead?.state].filter(Boolean).join(", ") ||
    lead?.location ||
    customer?.location ||
    "—";

  const dimensionsStr =
    lead?.width || lead?.length || lead?.height
      ? `${lead?.width || 0}' × ${lead?.length || 0}' × ${lead?.height || 0}'`
      : "—";

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={() => goBack()}
            className="px-4 bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white rounded-[6px]"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">
              {isLeadLoading ? (
                <span className="flex items-center gap-2">
                  Project <Skeleton className="h-7 w-48 rounded inline-block" /> Quotation
                </span>
              ) : (
                `${lead?.projectName || "Project"} - Quotation`
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {lead?.jobId ||
                lead?.projectId ||
                (lead?._id ? `PRJ-${lead._id.slice(-6).toUpperCase()}` : "PRJ-001")}
            </p>
          </div>
        </div>
      </div>

      {/* Project Overview Card */}
      <Card className="rounded-xl border border-slate-200/80 shadow-sm bg-white">
        <CardContent className="p-5">
          {isLeadLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-50 text-[#1D51A4] flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Customer</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {customerFullName || "—"}
                  </p>
                  {customer?.email && (
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </p>
                  )}
                  {customer?.phone?.number && (
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{customer.phone.number}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Building Type</p>
                  <p className="text-sm font-semibold text-slate-800 capitalize truncate">
                    {lead?.buildingType || "—"}
                  </p>
                  {lead?.roofStyle && (
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">
                      Roof: {lead.roofStyle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Ruler className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Dimensions</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {dimensionsStr}
                  </p>
                  {lead?.sqft && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lead.sqft} sqft
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Location</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {locationStr}
                  </p>
                  {lead?.lifecycleStatus && (
                    <div className="mt-1">
                      <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none text-[10px] px-2 py-0 font-medium capitalize">
                        {lead.lifecycleStatus.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quotations Section */}
      <div className="rounded-xl border border-slate-200/80 shadow-sm bg-white p-6">
        <LeadQuotationsTab
          leadId={leadId}
          customerName={customerFullName || lead?.projectName}
        />
      </div>
    </div>
  );
}
