import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Phone, MapPin, Truck, Building, FileText, CheckSquare, Bell, Calendar as CalendarIconLucide } from "lucide-react";
import RescheduleDeliveryDialog from "@/plant/components/RescheduleDeliveryDialog";
import MarkDeliveredSuccessDialog from "@/plant/components/MarkDeliveredSuccessDialog";

const mockDeliveries = [
  {
    id: "DEL-001",
    title: "Primary frame steel",
    status: "Scheduled",
    statusColor: "bg-green-100 text-green-700",
    dotColor: "bg-blue-500",
    badges: [
      { text: "Critical Path Items", color: "bg-red-100 text-red-700" },
      { text: "⚠️ Equipment conflict", color: "bg-yellow-100 text-yellow-800" },
    ],
    project: "Industrial Complex A",
    customer: "Acme Corporation",
    timeWindow: "8:00 AM - 12:00 PM",
    receivingContact: "POC: Austin McClume",
    vendor: "Steel Supply Co",
    siteLocation: "Industrial Complex A\nAustin, TX",
    requiredEquipment: "Primary frame steel\nEquipment: Crane required",
    internalOwner: "Owner: Mike Johnson",
    carrier: "Fast Freight LLC\nFreight Load: FL-2031",
  },
  {
    id: "DEL-002",
    title: "Roll-up doors",
    status: "Confirmed",
    statusColor: "bg-green-100 text-green-700",
    dotColor: "bg-green-500",
    badges: [
      { text: "Critical Path Items", color: "bg-red-100 text-red-700" },
    ],
    project: "Storage Facility B",
    customer: "BuildTech LLC",
    timeWindow: "1:00 PM - 5:00 PM",
    receivingContact: "POC: Austin McClume",
    vendor: "Door Masters Inc",
    siteLocation: "Industrial Complex A\nAustin, TX",
    requiredEquipment: "Primary frame steel\nEquipment: Crane required",
    internalOwner: "Owner: Mike Johnson",
    carrier: "Fast Freight LLC\nFreight Load: FL-2031",
  },
];

export default function DeliveryCalendar() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("Day");
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isMarkDeliveredOpen, setIsMarkDeliveredOpen] = useState(false);

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#f9fafb] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            Delivery Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule and track deliveries in calendar view
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
            Filters
          </Button>
          
          <Button variant="outline" className="bg-white gap-2 text-sm text-slate-700 font-medium">
            24 Mar 2025 - 31 Mar 2025
            <CalendarIconLucide className="w-4 h-4 ml-1" />
          </Button>

          <div className="flex bg-white border rounded-lg p-0.5 shadow-sm">
            {["Day", "Week", "Month"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === mode 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Badge variant="secondary" className="bg-blue-100 hover:bg-blue-100 text-blue-700 px-3 py-1 text-sm font-medium border-0">
              Today's Deliveries: 4 deliveries
            </Badge>
            <Badge variant="secondary" className="bg-blue-50 hover:bg-blue-50 text-blue-700 px-3 py-1 text-sm font-medium border-0">
              Weather: ☀️ Clear
            </Badge>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Tuesday, March 25, 2024
          </h2>

          <div className="space-y-4">
            {mockDeliveries.map((delivery) => (
              <Card key={delivery.id} className="border border-slate-200 shadow-sm rounded-xl overflow-hidden hover:border-blue-300 transition-colors">
                <div className="p-5">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className={`w-3 h-3 rounded-full ${delivery.dotColor}`}></div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        {delivery.title}
                        <span className="text-sm font-normal text-slate-500 ml-1">{delivery.id}</span>
                      </h3>
                      <div className="flex gap-2">
                        {delivery.badges.map((badge, idx) => (
                          <span key={idx} className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                            {badge.text}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Badge className={`${delivery.statusColor} hover:${delivery.statusColor} border-0 px-3 py-1 rounded-full text-xs font-medium`}>
                      {delivery.status}
                    </Badge>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Project</p>
                      <div className="flex items-start gap-2">
                        <Building className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <span className="text-sm text-slate-700 font-medium">{delivery.project}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Customer</p>
                      <span className="text-sm text-slate-700 font-medium">{delivery.customer}</span>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Time Window</p>
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <span className="text-sm text-slate-700 font-medium">{delivery.timeWindow}</span>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Receiving Contact</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-700 font-medium">{delivery.receivingContact}</span>
                        <Phone className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* Second Row Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Vendor</p>
                      <div className="flex items-start gap-2">
                        <Truck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <span className="text-sm text-slate-700">{delivery.vendor}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Site Location</p>
                      <p className="text-sm text-slate-700 whitespace-pre-line">{delivery.siteLocation}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Required Equipment</p>
                      <p className="text-sm text-slate-700 whitespace-pre-line">{delivery.requiredEquipment}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Internal Owner</p>
                      <p className="text-sm text-slate-700">{delivery.internalOwner}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Carrier</p>
                      <p className="text-sm text-slate-700 whitespace-pre-line">{delivery.carrier}</p>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-white border-slate-200 hover:bg-slate-100 text-slate-700 justify-start gap-2 h-10"
                    onClick={() => navigate(`/plant/delivery-details/${delivery.id}`)}
                  >
                    <FileText className="w-4 h-4" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-white border-slate-200 hover:bg-slate-100 text-slate-700 justify-start gap-2 h-10"
                    onClick={() => setIsRescheduleOpen(true)}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    Reschedule Delivery
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-white border-slate-200 hover:bg-slate-100 text-slate-700 justify-start gap-2 h-10"
                    onClick={() => setIsMarkDeliveredOpen(true)}
                  >
                    <CheckSquare className="w-4 h-4" />
                    Mark Delivered
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-white border-slate-200 hover:bg-slate-100 text-slate-700 justify-start gap-2 h-10"
                  >
                    <Bell className="w-4 h-4" />
                    Send Reminder Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      <RescheduleDeliveryDialog 
        open={isRescheduleOpen} 
        onOpenChange={setIsRescheduleOpen} 
      />

      <MarkDeliveredSuccessDialog
        open={isMarkDeliveredOpen}
        onOpenChange={setIsMarkDeliveredOpen}
      />
    </div>
  );
}
