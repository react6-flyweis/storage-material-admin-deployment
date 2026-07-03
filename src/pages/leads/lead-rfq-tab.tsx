import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Ruler,
  Wind,
  CloudSnow,
  Truck,
  DollarSign,
  CheckCircle2,
  Plus,
  FileDown,
} from "lucide-react";
import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";

const INCLUDED_ITEMS = [
  "Primary Frame Structure (Rigid Frame)",
  "Secondary Framing (Purlins & Girts)",
  "Roof & Wall Panels (26-gauge, 30-year warranty)",
  "Trim & Fasteners Package",
  "Detailed Engineering Drawings",
  "Engineer-Stamped Structural Calculations",
  "Foundation Anchor Bolts",
];

const OPTIONAL_ADDONS = [
  { label: "Roll-up / Overhead Doors", price: "+$1,200 each" },
  { label: "Walk-in Doors & Windows", price: "+$450 each" },
  { label: "Skylights (4×4 polycarbonate)", price: "+$320 each" },
  { label: "Insulation Package (roof + wall)", price: "+$2,800" },
  { label: "Color Upgrade (custom RAL)", price: "+$450" },
  { label: "Gutter & Downspout System", price: "+$1,800" },
  { label: "Concrete Foundation Prep", price: "By quote" },
];

export default function LeadRfqTab({ leadId }: { leadId: string }) {
  const { data: leadQueryData } = useLeadDetailQuery(leadId || "");
  const lead = leadQueryData?.data?.lead;
  const ai = lead?.aiQuoteData;

  const buildingType = lead?.buildingType || "—";
  const location = lead?.location || "—";
  const width = lead?.width || "—";
  const length = lead?.length || "—";
  const height = lead?.height || "—";
  const roofStyle = lead?.roofStyle || "—";
  const delivery = ai?.details?.deliveryWeeks || "8–12 weeks";
  const priceMin = ai?.priceMin ? `$${Number(ai.priceMin).toLocaleString()}` : "—";
  const priceMax = ai?.priceMax ? `$${Number(ai.priceMax).toLocaleString()}` : "—";
  const sqft = ai?.details?.sqft || (lead?.width && lead?.length ? `${Number(lead.width) * Number(lead.length)}` : "—");
  const windLoad = ai?.details?.windLoad || "90 mph";
  const snowLoad = ai?.details?.snowLoad || "20 psf";
  const complexity = ai?.complexity;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-200 uppercase tracking-wider font-medium mb-1">Request For Quotation</p>
            <h2 className="text-xl font-bold">Custom Steel Building Quote</h2>
            {lead?.jobId && (
              <p className="text-blue-200 text-sm mt-0.5">{lead.jobId} · {lead.projectName || "Project"}</p>
            )}
          </div>
          {complexity && (
            <div className="text-center">
              <div className="text-3xl font-bold">{complexity}</div>
              <div className="text-xs text-blue-200">Complexity</div>
              <div className="text-xs text-blue-200">/ 5</div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Building Specs */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Building Specifications</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2.5 p-4 bg-gray-50 rounded-xl border">
              <Building2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-gray-400 uppercase font-medium">Building Type</p>
                <p className="text-sm font-semibold text-gray-800 capitalize">{buildingType}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-4 bg-gray-50 rounded-xl border">
              <MapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-gray-400 uppercase font-medium">Location</p>
                <p className="text-sm font-semibold text-gray-800">{location}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-4 bg-gray-50 rounded-xl border">
              <Ruler className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-gray-400 uppercase font-medium">Dimensions (W × L × H)</p>
                <p className="text-sm font-semibold text-gray-800">{width}' × {length}' × {height}'</p>
                {sqft !== "—" && <p className="text-xs text-gray-400">{sqft} sq ft</p>}
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-4 bg-gray-50 rounded-xl border">
              <Building2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-gray-400 uppercase font-medium">Roof Style</p>
                <p className="text-sm font-semibold text-gray-800 capitalize">{roofStyle}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-4 bg-gray-50 rounded-xl border">
              <Wind className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-gray-400 uppercase font-medium">Wind Load</p>
                <p className="text-sm font-semibold text-gray-800">{windLoad}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-4 bg-gray-50 rounded-xl border">
              <CloudSnow className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-gray-400 uppercase font-medium">Snow Load</p>
                <p className="text-sm font-semibold text-gray-800">{snowLoad}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <h4 className="text-sm font-bold text-green-800">Estimated Price Range</h4>
            {ai && <Badge className="bg-green-100 text-green-700 border-none text-xs">AI Estimate</Badge>}
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {priceMin} – {priceMax}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            This is an AI-assisted estimate based on project inputs. Final pricing will be confirmed after engineering review and site survey.
          </p>
          {ai?.basis && (
            <p className="text-sm text-green-700 font-medium mt-2 italic">"{ai.basis}"</p>
          )}
          <div className="flex items-center gap-2 mt-4">
            <Truck className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Estimated Delivery: <strong className="text-gray-700">{delivery}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What's Included */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" /> What's Included
            </h3>
            <div className="space-y-3">
              {INCLUDED_ITEMS.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Add-Ons */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-500" /> Optional Add-Ons
            </h3>
            <div className="space-y-3">
              {OPTIONAL_ADDONS.map((addon, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">{addon.label}</span>
                  <span className="text-sm font-semibold text-blue-600">{addon.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-sm text-yellow-700 mt-4">
          <strong>Note:</strong> This RFQ summary is based on the lead's project data and AI estimate. The formal quotation must be created separately using the "Create Quotation" form.
        </div>
      </div>

      <div className="px-6 py-5 border-t bg-gray-50 flex items-center gap-3">
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 px-6">
          <FileDown className="h-4 w-4" />
          Download PDF Quote
        </Button>
      </div>
    </div>
  );
}
