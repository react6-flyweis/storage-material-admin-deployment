import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Download, Search, Ribbon, Truck, CheckCircle2, DollarSign, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import AwardedLoadsFiltersDialog from "@/plant/components/AwardedLoadsFiltersDialog";

const mockAwardedLoads = [
  {
    id: "LOAD-002",
    requestedDate: "2024-03-16",
    statusBadge: "Scheduled",
    project: "Storage Facility B",
    description: "Roll-up door panels",
    pickupLocation: "Dallas, TX",
    deliveryLocation: "San Antonio, TX",
    pickupDate: "2024-03-27",
    deliveryDate: "2024-03-28",
    carrier: "Quick Haul Transport",
    phone: "(555) 222-3333",
    budget: "$1,850",
    awarded: "$1,850",
    bids: 3,
    status: "Awarded",
  },
  {
    id: "LOAD-005",
    requestedDate: "2024-03-16",
    statusBadge: "In Transit",
    project: "Industrial Complex A",
    description: "Secondary steel beams",
    pickupLocation: "Houston, TX",
    deliveryLocation: "Austin, TX",
    pickupDate: "2024-03-28",
    deliveryDate: "2024-03-29",
    carrier: "Fast Freight LLC",
    phone: "(555) 222-3333",
    budget: "$1,850",
    awarded: "$1,850",
    bids: 3,
    status: "Awarded",
  },
  {
    id: "LOAD-007",
    requestedDate: "2024-03-16",
    statusBadge: "In Transit",
    project: "Warehouse Complex",
    description: "Electrical fixtures - bulk",
    pickupLocation: "San Antonio, TX",
    deliveryLocation: "Fort Worth, TX",
    pickupDate: "2024-03-30",
    deliveryDate: "2024-03-31",
    carrier: "Regional Logistics",
    phone: "(555) 222-3333",
    budget: "$1,850",
    awarded: "$1,850",
    bids: 3,
    status: "Awarded",
  },
  {
    id: "LOAD-006",
    requestedDate: "2024-03-16",
    statusBadge: "Scheduled",
    project: "Storage Facility B",
    description: "Roofing panels",
    pickupLocation: "Dallas, TX",
    deliveryLocation: "Houston, TX",
    pickupDate: "2024-03-29",
    deliveryDate: "2024-03-30",
    carrier: "Quick Haul Transport",
    phone: "(555) 222-3333",
    budget: "$1,850",
    awarded: "$1,850",
    bids: 3,
    status: "Awarded",
  },
];

export default function AwardedLoads() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#f9fafb] min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Awarded Loads</h1>
          <p className="text-sm text-slate-500 mt-1">Track all awarded freight loads</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="bg-white gap-2 font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button 
            variant="outline" 
            className="bg-white gap-2 font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Awarded */}
        <Card className="rounded-2xl border-[2px] border-green-500 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Awarded</p>
              <h2 className="text-4xl font-bold text-slate-900 mt-1">4</h2>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <Ribbon className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* In Transit */}
        <Card className="rounded-2xl border-[2px] border-orange-400 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">In Transit</p>
              <h2 className="text-4xl font-bold text-slate-900 mt-1">1</h2>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Delivered */}
        <Card className="rounded-2xl border-[2px] border-green-500 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Delivered</p>
              <h2 className="text-4xl font-bold text-slate-900 mt-1">1</h2>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="rounded-2xl border-[2px] border-blue-500 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Spent</p>
              <h2 className="text-4xl font-bold text-slate-900 mt-1">$7,650</h2>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table Area */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        
        {/* Search Bar & Filter Button */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search notifications..." 
              className="pl-10 h-12 bg-slate-50 border-0 rounded-xl"
            />
          </div>
          <Button 
            className="h-12 px-8 rounded-xl bg-[#3b59df] hover:bg-[#2b41b3] text-white font-medium"
            onClick={() => setIsFilterOpen(true)}
          >
            Filter
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Request ID</th>
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Project</th>
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pickup Location</th>
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Delivery Location</th>
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dates</th>
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Carrier</th>
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Budget & Bids</th>
                <th className="pb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockAwardedLoads.map((load, index) => (
                <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 align-top">
                    <p className="font-bold text-slate-900 mb-1">{load.id}</p>
                    <p className="text-[11px] text-slate-500 mb-2">Requested: {load.requestedDate}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] rounded-full px-2 py-0.5 font-medium border
                        ${load.statusBadge === "Scheduled" ? "text-blue-600 bg-blue-50 border-blue-200" : ""}
                        ${load.statusBadge === "In Transit" ? "text-blue-600 bg-blue-50 border-blue-200" : ""}
                      `}
                    >
                      {load.statusBadge}
                    </Badge>
                  </td>
                  <td className="py-5 align-top">
                    <p className="text-sm font-medium text-slate-700">{load.project}</p>
                  </td>
                  <td className="py-5 align-top">
                    <p className="text-sm text-slate-600 max-w-[150px]">{load.description}</p>
                  </td>
                  <td className="py-5 align-top">
                    <p className="text-sm text-slate-600 w-20">{load.pickupLocation}</p>
                  </td>
                  <td className="py-5 align-top">
                    <p className="text-sm text-slate-600 w-20">{load.deliveryLocation}</p>
                  </td>
                  <td className="py-5 align-top">
                    <p className="text-[12px] text-slate-500 w-24">Pickup:<br />{load.pickupDate}</p>
                    <p className="text-[12px] text-slate-500 w-24 mt-1">Delivery:<br />{load.deliveryDate}</p>
                  </td>
                  <td className="py-5 align-top">
                    <p className="text-sm font-semibold text-slate-900 mb-1 w-28">{load.carrier}</p>
                    <a href={`tel:${load.phone}`} className="text-[11px] text-blue-600 flex items-center gap-1 hover:underline">
                      <Phone className="w-3 h-3" />
                      {load.phone}
                    </a>
                  </td>
                  <td className="py-5 align-top">
                    <p className="text-sm font-bold text-slate-900 mb-1">{load.budget}</p>
                    <p className="text-[12px] font-semibold text-slate-900">Awarded: {load.awarded}</p>
                    <p className="text-[12px] font-semibold text-slate-900">{load.bids} bids</p>
                  </td>
                  <td className="py-5 align-top">
                    <Badge className="bg-green-100 hover:bg-green-100 text-green-700 border border-green-200 rounded-full px-3 font-medium">
                      {load.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Filter Modal */}
      <AwardedLoadsFiltersDialog 
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
      />

    </div>
  );
}
