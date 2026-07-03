import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProjectQuotationPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="default"
          onClick={() => navigate('/customers')}
          className="px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-[#0F172A]">
          Project 1 - Quotation
        </h1>
      </div>

      <Card className="rounded-[12px] border-slate-200">
        <CardContent className="p-6">
          {/* Top Section */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div className="text-sm">
              <span className="text-slate-500">Lead ID: </span>
              <span className="font-semibold text-slate-800">Q-2025-1047</span>
            </div>
            <Badge className="bg-[#DCFCE7] text-[#16A34A] hover:bg-[#DCFCE7] border-transparent px-4 py-1 text-sm font-medium rounded-full">
              Approved
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 text-[15px] mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Name</p>
                  <p className="text-sm text-slate-800 font-medium">John Doe</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Email</p>
                  <p className="text-sm text-slate-800 font-medium">
                    john@doe.com
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Phone</p>
                  <p className="text-sm text-slate-800 font-medium">
                    +1 (555) 123-4567
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Location</p>
                  <p className="text-sm text-slate-800 font-medium">
                    Dallas, TX
                  </p>
                </div>
              </div>
            </div>

            {/* Building Requirements */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 text-[15px] mb-4">
                Building Requirements
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Building Type</p>
                  <p className="text-sm text-slate-800 font-medium">Workshop</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Dimensions</p>
                  <p className="text-sm text-slate-800 font-medium">
                    30' × 40' × 12'
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Roof Style</p>
                  <p className="text-sm text-slate-800 font-medium">
                    Gable Roof
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Wind Load</p>
                  <p className="text-sm text-slate-800 font-medium">120 mph</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Snow Load</p>
                  <p className="text-sm text-slate-800 font-medium">20 psf</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Estimated Delivery
                  </p>
                  <p className="text-sm text-slate-800 font-medium">
                    4–6 weeks
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Price Range</p>
                  <p className="text-sm text-slate-800 font-medium">
                    $24,500 – $28,000
                  </p>
                </div>
              </div>
            </div>

            {/* Lead Management */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 text-[15px] mb-4">
                Lead Management
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 w-24">Status</span>
                  <Badge className="bg-[#F3E8FF] text-[#7E22CE] hover:bg-[#F3E8FF] border-transparent text-[10px] px-2 py-0 rounded-full font-medium">
                    In Pipeline
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 w-24">
                    Handler Type
                  </span>
                  <Badge className="bg-[#F3E8FF] text-[#7E22CE] hover:bg-[#F3E8FF] border-transparent text-[10px] px-2 py-0 rounded-full font-medium">
                    AI
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 w-24">
                    Lead Score
                  </span>
                  <Badge className="bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FEE2E2] border-transparent text-[10px] px-2 py-0 font-bold rounded-full">
                    HOT
                  </Badge>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-slate-500 mb-1">Assigned To</p>
                  <p className="text-sm text-slate-800 font-medium">
                    AI Assistant
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Last Contact</p>
                  <p className="text-sm text-slate-800 font-medium">
                    2024-01-15
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Next Follow-up</p>
                  <p className="text-sm text-slate-800 font-medium">
                    2024-01-18
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Handling Summary */}
          <div className="mb-8">
            <h3 className="font-semibold text-slate-800 text-[15px] mb-4">
              AI Handling Summary
            </h3>
            <div className="bg-[#F8FAFC] rounded-xl p-5 border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    AI Qualification
                  </p>
                  <p className="text-sm text-slate-800 font-medium">
                    Qualified – Budget OK, Timeline Realistic
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Quotation Status
                  </p>
                  <p className="text-sm text-slate-800 font-medium">
                    Created by AI - sent
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">
                  AI Conversation Summary
                </p>
                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5 marker:text-slate-400">
                  <li>Initial quote request received</li>
                  <li>AI confirmed building specifications</li>
                  <li>Customer interested in premium options</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Materials & Add-ons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-[15px] mb-4">
                Included Materials
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Frame",
                  "Roof",
                  "Panels",
                  "Trim",
                  "Fasteners",
                  "Drawings",
                  "Engineer Plans",
                ].map((item) => (
                  <Badge
                    key={item}
                    className="bg-[#DCFCE7] text-[#16A34A] hover:bg-[#DCFCE7] border-transparent font-medium px-3 py-1 rounded-full text-xs"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 text-[15px] mb-4">
                Optional Add-ons
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Doors", "Windows", "Skylights"].map((item) => (
                  <Badge
                    key={item}
                    className="bg-[#DBEAFE] text-[#2563EB] hover:bg-[#DBEAFE] border-transparent font-medium px-3 py-1 rounded-full text-xs"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div>
            <h3 className="font-semibold text-slate-800 text-[15px] mb-4">
              Activity Log
            </h3>
            <div className="space-y-4">
              {[
                {
                  action: "Lead created",
                  user: "System",
                  date: "2024-01-15",
                },
                {
                  action: "AI qualification completed",
                  user: "AI Assistant",
                  date: "2024-01-15",
                },
                {
                  action: "Quotation sent",
                  user: "AI Assistant",
                  date: "2024-01-16",
                },
              ].map((log, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-[#F8FAFC] rounded-lg p-3 border border-slate-100 w-full"
                >
                  <div className="h-2 w-2 rounded-full bg-[#3B82F6] shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {log.action}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      by {log.user} on {log.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
