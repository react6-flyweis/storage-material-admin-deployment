import React, { useState } from "react";

import {
  ArrowLeft,
  Download,
  Edit2,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Star,
  Medal,
  RefreshCw,
  XCircle,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router";

const MOCK_BIDS = [
  {
    id: 1,
    company: "QuickFreight Solutions",
    rating: "4.8",
    onTime: "89%",
    submitted: "3/20/2026",
    transit: "1 day",
    amount: 2850,
    notes: "Best rate available, experienced with steel transport",
    isLowest: true,
  },
  {
    id: 2,
    company: "National Haulers Inc.",
    rating: "4.5",
    onTime: "89%",
    submitted: "3/20/2026",
    transit: "1 day",
    amount: 2950,
    diff: "+$100 more",
    notes: "Includes insurance coverage",
    isLowest: false,
  },
  {
    id: 3,
    company: "Regional Transport Co.",
    rating: "4.2",
    onTime: "89%",
    submitted: "3/21/2026",
    transit: "1 day",
    amount: 3100,
    diff: "+$250 more",
    notes: "Guaranteed delivery window",
    isLowest: false,
  },
  {
    id: 4,
    company: "FastFreight Logistics",
    rating: "4.9",
    onTime: "89%",
    submitted: "3/21/2026",
    transit: "1 day",
    amount: 3250,
    diff: "+$400 more",
    notes: "Premium service with tracking",
    isLowest: false,
  },
];

export default function FreightRequestDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Bid Comparison (5)");

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            className="p-2 h-10 w-10 bg-white shadow-sm border border-gray-200 rounded-full hover:bg-gray-50 mt-1"
            onClick={() => navigate("/plant/freight-loads")}
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Freight Request Details</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[#3B82F6] font-semibold">FRQ-2001</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">Primary Steel Frame - 45,000 lbs</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white border-gray-200 shadow-sm h-11 px-6">
            <Download className="w-4 h-4 mr-2 text-gray-500" />
            Export
          </Button>
          <Button 
            className="bg-[#2563EB] hover:bg-blue-700 text-white h-11 px-6 border-none"
            onClick={() => navigate(`/plant/freight-request/edit/${id || "FRQ-2001"}`)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Request
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-4">
        {/* Total Bids */}
        <div className="bg-[#3B82F6] rounded-xl p-6 text-white flex flex-col justify-between h-36 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start z-10">
            <p className="text-blue-100 font-medium text-sm">Total Bids</p>
            <DollarSign className="w-5 h-5 text-blue-200" />
          </div>
          <div className="z-10 mt-2">
            <h2 className="text-4xl font-bold">5</h2>
            <p className="text-blue-100 text-xs mt-2">From invited carriers</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-bl-full opacity-50" />
        </div>

        {/* Lowest Bid */}
        <div className="bg-[#10B981] rounded-xl p-6 text-white flex flex-col justify-between h-36 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start z-10">
            <p className="text-emerald-100 font-medium text-sm">Lowest Bid</p>
            <TrendingDown className="w-5 h-5 text-emerald-200" />
          </div>
          <div className="z-10 mt-2">
            <h2 className="text-4xl font-bold">$2,850</h2>
            <p className="text-emerald-100 text-xs mt-2">Best available rate</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 rounded-bl-full opacity-50" />
        </div>

        {/* Average Bid */}
        <div className="bg-[#F97316] rounded-xl p-6 text-white flex flex-col justify-between h-36 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start z-10">
            <p className="text-orange-100 font-medium text-sm">Average Bid</p>
            <DollarSign className="w-5 h-5 text-orange-200" />
          </div>
          <div className="z-10 mt-2">
            <h2 className="text-4xl font-bold">$3,120</h2>
            <p className="text-orange-100 text-xs mt-2">Market average</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500 rounded-bl-full opacity-50" />
        </div>

        {/* Potential Savings */}
        <div className="bg-[#A855F7] rounded-xl p-6 text-white flex flex-col justify-between h-36 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start z-10">
            <p className="text-purple-100 font-medium text-sm">Potential Savings</p>
            <TrendingUp className="w-5 h-5 text-purple-200" />
          </div>
          <div className="z-10 mt-2">
            <h2 className="text-4xl font-bold">$600</h2>
            <p className="text-purple-100 text-xs mt-2">vs highest bid</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500 rounded-bl-full opacity-50" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mt-8">
        <nav className="flex space-x-8">
          {["Bid Comparison (5)", "Request Details", "Email Exchange"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "Bid Comparison (5)" && (
        <div className="space-y-6 pt-4">
          {/* Top Bar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-900 text-lg">All Bids</span>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Sort:</span>
                <Button variant="outline" className="bg-white border-gray-200 h-9 px-3 text-sm">
                  Low to High <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
                </Button>
              </div>
            </div>
            <div className="text-sm font-semibold">
              <span className="text-green-600">$2,850</span>
              <span className="text-gray-400 mx-1">-</span>
              <span className="text-red-500">$3,450</span>
            </div>
          </div>

          {/* Bid Cards */}
          <div className="space-y-4">
            {MOCK_BIDS.map((bid, index) => (
              <div 
                key={bid.id} 
                className={`bg-white rounded-xl border ${
                  bid.isLowest ? "border-green-300 bg-green-50/30" : "border-gray-200"
                } p-6 shadow-sm flex flex-col md:flex-row gap-6 relative`}
              >
                {/* Left Content */}
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                    bid.isLowest ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="space-y-4 w-full">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{bid.company}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="font-medium text-gray-700">{bid.rating}</span>
                        </div>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>On-time delivery {bid.onTime}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>Submitted {bid.submitted}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>Transit Time: {bid.transit}</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Carrier Notes:</p>
                      <p className="text-sm text-gray-600">{bid.notes}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Button 
                        className={`${
                          bid.isLowest ? "bg-green-600 hover:bg-green-700" : "bg-[#2563EB] hover:bg-blue-700"
                        } text-white px-6`}
                      >
                        <Medal className="w-4 h-4 mr-2" />
                        Award Load
                      </Button>
                      <Button className="bg-[#F97316] hover:bg-orange-600 text-white px-6">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Request Revision
                      </Button>
                      <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 px-6">
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Content */}
                <div className="flex flex-col items-end md:items-end sm:items-start shrink-0 min-w-[150px]">
                  <p className="text-gray-500 text-sm font-medium">Bid Amount</p>
                  <h3 className={`text-4xl font-bold mt-1 ${bid.isLowest ? "text-green-600" : "text-slate-900"}`}>
                    ${bid.amount.toLocaleString()}
                  </h3>
                  {bid.isLowest ? (
                    <span className="text-green-600 text-xs font-bold uppercase tracking-wider mt-2">
                      LOWEST BID
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs mt-2">
                      {bid.diff}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
