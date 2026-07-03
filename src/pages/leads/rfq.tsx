import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown } from "lucide-react";
import { useLeadDetailQuery } from "@/modules/leads/leads.hooks";

const INCLUDED_ITEMS = [
  "Pre-engineered steel frame",
  "Roof & wall panels (26-gauge, 30-year warranty)",
  "Trim & fasteners",
  "Detailed installation drawings",
  "Engineer-stamped plans (where required)",
];

const OPTIONAL_ADDONS = [
  "Roll-up doors",
  "Walk-in doors & windows",
  "Skylights",
  "Insulation package",
  "Color customization",
];

export default function RFQPage() {
  const navigate = useNavigate();
  const { leadId } = useParams<{ leadId: string }>();

  const { data: leadQueryData, isLoading } = useLeadDetailQuery(leadId || "");
  const lead = leadQueryData?.data?.lead;
  const ai = lead?.aiQuoteData;

  const buildingType = lead?.buildingType
    ? lead.buildingType.charAt(0).toUpperCase() + lead.buildingType.slice(1)
    : "—";
  const width = lead?.width || "—";
  const length = lead?.length || "—";
  const height = lead?.height || "—";
  const roofStyle = lead?.roofStyle
    ? lead.roofStyle.charAt(0).toUpperCase() + lead.roofStyle.slice(1) + " Roof"
    : "—";
  const location = lead?.location || "—";
  const windLoad = ai?.details?.windLoad || "120 mph";
  const snowLoad = ai?.details?.snowLoad || "20 psf";
  const delivery = ai?.details?.deliveryWeeks || "4–6 weeks";
  const priceMin = ai?.priceMin ? `$${Number(ai.priceMin).toLocaleString()}` : null;
  const priceMax = ai?.priceMax ? `$${Number(ai.priceMax).toLocaleString()}` : null;
  const basePrice = lead?.quoteValue
    ? `$${Number(lead.quoteValue).toLocaleString()}`
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#eef0f8]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef0f8] p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-blue-600 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4"
          onClick={() => navigate('/leads')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-gray-900">RFQ</h1>
        <div className="w-20" />
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm max-w-3xl mx-auto p-8 space-y-8">

        {/* Quote Summary Header */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            ✅ Quote Summary
          </h2>
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Your Custom Steel Building Quote
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
            <li>Building Type: {buildingType}</li>
            <li>
              Dimensions: {width}' × {length}' × {height}'
            </li>
            <li>Roof Style: {roofStyle}</li>
            <li>
              Location: {location}{" "}
              {(windLoad || snowLoad) && (
                <span className="text-gray-500">
                  (designed for {windLoad} wind load
                  {snowLoad ? `, ${snowLoad} snow load` : ""})
                </span>
              )}
            </li>
            <li>Estimated Delivery: {delivery}</li>
          </ul>
        </div>

        <hr className="border-gray-100" />

        {/* Estimated Price Range */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            💰 Estimated Price Range
          </h3>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            {priceMin && priceMax
              ? `${priceMin} – ${priceMax}`
              : basePrice || "Contact us for pricing"}
          </p>
          <p className="text-sm text-gray-600">
            (This is an instant estimate based on your inputs. Final pricing
            will be confirmed after engineering review and foundation
            requirements.)
          </p>
          {ai?.basis && (
            <p className="text-sm text-gray-500 mt-2 italic">"{ai.basis}"</p>
          )}
        </div>

        <hr className="border-gray-100" />

        {/* What's Included */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            📦 What's Included
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
            {INCLUDED_ITEMS.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <hr className="border-gray-100" />

        {/* Optional Add-Ons */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            🛠 Optional Add-Ons
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
            {OPTIONAL_ADDONS.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            className="w-44 border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={() => navigate('/leads')}
          >
            Back
          </Button>
          <Button className="w-52 bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Downloadable PDF Quote
          </Button>
        </div>
      </div>
    </div>
  );
}
