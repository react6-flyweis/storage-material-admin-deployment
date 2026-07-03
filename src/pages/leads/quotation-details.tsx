import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/assets/the-steel-logo-dark.svg";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Send,
  Layers,
  CheckSquare,
  Info,
  Truck,
  Wrench,
} from "lucide-react";
import { useQuotationQuery, useSendQuotationMutation } from "@/modules/quotations/quotations.hooks";
import { toast } from "sonner";

function statusBadge(status: string) {
  switch (status) {
    case "draft":
      return <Badge className="bg-gray-100 text-gray-600 border-none">Draft</Badge>;
    case "sent":
      return <Badge className="bg-blue-100 text-blue-600 border-none">Sent</Badge>;
    case "accepted":
      return <Badge className="bg-green-100 text-green-600 border-none">Accepted</Badge>;
    case "rejected":
      return <Badge className="bg-red-100 text-red-600 border-none">Rejected</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export default function QuotationDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuotationQuery(id);
  const sendMutation = useSendQuotationMutation();

  const q = data?.data?.quotation;

  const handleSend = async () => {
    if (!id) return;
    try {
      await sendMutation.mutateAsync(id);
      toast.success("Quotation sent to customer successfully!");
    } catch {
      toast.error("Failed to send quotation.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isError || !q) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 text-lg">Quotation not found or failed to load.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/leads')}>
          Go Back
        </Button>
      </div>
    );
  }

  const isDraft = q.status === "draft";

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Button size="sm" variant="outline" className="flex items-center gap-2" onClick={() => navigate('/leads')}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          {statusBadge(q.status)}
          {isDraft && (
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
              onClick={handleSend}
              disabled={sendMutation.isPending}
            >
              <Send className="h-4 w-4" />
              {sendMutation.isPending ? "Sending..." : "Send to Customer"}
            </Button>
          )}
        </div>
      </div>

      {/* Main Quotation Card */}
      <div className="bg-white rounded-2xl shadow-sm w-full p-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-4">
            <img src={Logo} alt="The Steel Logo" className="w-36" />
            <div className="text-sm text-gray-500 leading-relaxed">
              <p>1851 Madison Ave Suite 300</p>
              <p>Council Bluffs, IA 51503</p>
              <p>United States</p>
              <p>travis@storagematerials.com</p>
              <p>www.storagematerials.com</p>
            </div>
          </div>

          <div className="text-sm text-gray-600 text-right space-y-2">
            <h1 className="text-2xl font-bold tracking-widest text-gray-300 mb-6">QUOTATION</h1>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left">
              <span className="font-medium text-gray-500">Quote #</span>
              <span className="font-bold text-gray-900">{q.quoteNumber}</span>
              <span className="font-medium text-gray-500">Version</span>
              <span className="font-bold text-gray-900">v{q.versionNumber}</span>
              <span className="font-medium text-gray-500">Date</span>
              <span className="text-gray-800">{q.proposalDate ? new Date(q.proposalDate).toLocaleDateString() : "—"}</span>
              <span className="font-medium text-gray-500">Valid Until</span>
              <span className="text-gray-800">{q.validTill ? new Date(q.validTill).toLocaleDateString() : "—"}</span>
              <span className="font-medium text-gray-500">Status</span>
              <span>{statusBadge(q.status)}</span>
            </div>
          </div>
        </div>

        {/* Project Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 p-6 bg-gray-50 rounded-xl">
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Building Type</p>
              <p className="text-sm font-semibold text-gray-800 capitalize">{q.buildingType || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Location</p>
              <p className="text-sm font-semibold text-gray-800">{q.location || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Layers className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Dimensions (W×L×H)</p>
              <p className="text-sm font-semibold text-gray-800">
                {q.width || "—"} × {q.length || "—"} × {q.height || "—"} ft
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Roof Style</p>
              <p className="text-sm font-semibold text-gray-800 capitalize">{q.roofStyle || "—"}</p>
            </div>
          </div>
          {q.windLoad && (
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Wind Load</p>
                <p className="text-sm font-semibold text-gray-800">{q.windLoad}</p>
              </div>
            </div>
          )}
          {q.snowLoad && (
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Snow Load</p>
                <p className="text-sm font-semibold text-gray-800">{q.snowLoad}</p>
              </div>
            </div>
          )}
          {q.estimatedDelivery && (
            <div className="flex items-start gap-2">
              <Truck className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Est. Delivery</p>
                <p className="text-sm font-semibold text-gray-800">{q.estimatedDelivery}</p>
              </div>
            </div>
          )}
          {q.paymentTerms && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Payment Terms</p>
                <p className="text-sm font-semibold text-gray-800">{q.paymentTerms}</p>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="border-t pt-6 mb-10">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Pricing Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-400 mb-1">Base Price</p>
              <p className="text-xl font-bold text-blue-700">${(q.basePrice || 0).toLocaleString()}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-400 mb-1">Max Price</p>
              <p className="text-xl font-bold text-green-700">${(q.maxPrice || 0).toLocaleString()}</p>
            </div>
            {(q.finalPrice ?? 0) > 0 && (
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-xs text-purple-400 mb-1">Final Price</p>
                <p className="text-xl font-bold text-purple-700">${(q.finalPrice || 0).toLocaleString()}</p>
              </div>
            )}
            {(q.totalArea ?? 0) > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 border">
                <p className="text-xs text-gray-400 mb-1">Total Area</p>
                <p className="text-xl font-bold text-gray-700">{q.totalArea} sqft</p>
              </div>
            )}
          </div>

          {/* COGS breakdown if available */}
          {(q.materialCost ?? 0) > 0 && (
            <div className="mt-4 border rounded-xl p-4 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Cost Breakdown</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Material Cost</p>
                  <p className="font-semibold">${(q.materialCost || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Freight Cost</p>
                  <p className="font-semibold">${(q.freightCost || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Total COGS</p>
                  <p className="font-semibold">${(q.totalCOGS || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Markup ({q.markupPercent || 0}%)</p>
                  <p className="font-semibold">${(q.markupValue || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Structure & Engineering */}
        {(q.frameType || q.girtType || q.purlinType || q.bracingType || q.roofSlope) && (
          <div className="border-t pt-6 mb-10">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Wrench className="h-4 w-4" /> Structure & Engineering
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {q.frameType && <div><p className="text-xs text-gray-400">Frame Type</p><p className="font-semibold">{q.frameType}</p></div>}
              {q.endwallType && <div><p className="text-xs text-gray-400">Endwall Type</p><p className="font-semibold">{q.endwallType}</p></div>}
              {q.girtType && <div><p className="text-xs text-gray-400">Girt Type</p><p className="font-semibold">{q.girtType}</p></div>}
              {q.purlinType && <div><p className="text-xs text-gray-400">Purlin Type</p><p className="font-semibold">{q.purlinType}</p></div>}
              {q.bracingType && <div><p className="text-xs text-gray-400">Bracing Type</p><p className="font-semibold">{q.bracingType}</p></div>}
              {q.roofSlope && <div><p className="text-xs text-gray-400">Roof Slope</p><p className="font-semibold">{q.roofSlope}</p></div>}
              {q.roofPanel && <div><p className="text-xs text-gray-400">Roof Panel</p><p className="font-semibold">{q.roofPanel}</p></div>}
              {q.wallPanelType && <div><p className="text-xs text-gray-400">Wall Panel</p><p className="font-semibold">{q.wallPanelType}</p></div>}
            </div>
          </div>
        )}

        {/* Included Components */}
        {q.includedComponents && q.includedComponents.length > 0 && (
          <div className="border-t pt-6 mb-10">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckSquare className="h-4 w-4" /> Included Components
            </h2>
            <div className="flex flex-wrap gap-2">
              {q.includedComponents.map((c, i) => (
                <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-100">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Optional Add-ons */}
        {q.optionalAddOns && q.optionalAddOns.length > 0 && (
          <div className="border-t pt-6 mb-10">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Optional Add-ons</h2>
            <div className="space-y-2">
              {q.optionalAddOns.map((addon, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                  <span className="text-sm font-medium text-gray-800">{addon.name}</span>
                  <span className="text-sm font-bold text-blue-600">${(addon.price || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {(q.specialNote || q.clientNotes || q.internalNotes) && (
          <div className="border-t pt-6 mb-10 space-y-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Notes</h2>
            {q.specialNote && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-yellow-600 mb-1">Special Note (Customer-visible)</p>
                <p className="text-sm text-gray-700">{q.specialNote}</p>
              </div>
            )}
            {q.clientNotes && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-600 mb-1">Client Notes</p>
                <p className="text-sm text-gray-700">{q.clientNotes}</p>
              </div>
            )}
            {q.internalNotes && (
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 mb-1">Internal Notes (Not sent to customer)</p>
                <p className="text-sm text-gray-700">{q.internalNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-6 text-sm text-gray-500">
          <p className="mb-4">Thank you for your business. Reach out with any questions.</p>
          <p className="mb-12 text-xs">By accepting this quotation, the customer agrees to the services and conditions outlined in this document.</p>
          <div className="flex justify-end pr-12">
            <div className="w-64">
              <hr className="border-gray-400 mb-3" />
              <p className="text-xs text-gray-500 font-medium">Client Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
