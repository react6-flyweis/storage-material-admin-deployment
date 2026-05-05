import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Eye,
  Package,
  MapPin,
  Calendar,
  Clock,
  Truck,
  Building2,
  AlertTriangle,
} from "lucide-react";
import DateRangeFilter from "@/components/ui/date-range-filter";
import type { DateRange as RDateRange } from "react-day-picker";
import { useState } from "react";
import { DeliveryDetailsDialog } from "@/components/delivery-details-dialog";

const ASSIGNED_PROJECTS = [
  {
    id: "DEL-2001",
    title: "Primary Frame Steel",
    location: "ABC Logistics Warehouse",
    badges: [
      {
        text: "In Transit to Plant",
        className: "bg-[#4669C1] hover:bg-[#4669C1] text-white",
      },
      {
        text: "High Priority",
        className: "bg-[#FF4D4F] hover:bg-[#FF4D4F] text-white",
      },
      {
        text: "ETA 45 min",
        className:
          "bg-[#FFFBE6] hover:bg-[#FFFBE6] text-[#D4B106] border border-[#FFF1B8]",
        icon: Clock,
      },
    ],
    material: { quantity: "45,000 lbs", stagingArea: "Yard-A" },
    schedule: { arrival: "Mar 24, 10:00 AM", departure: "Mar 24, 02:00 PM" },
    route: {
      carrier: "FastFreight Logistics",
      destination: "Construction Site A",
    },
    truckDetails: {
      truck: "TX-4582",
      driver: "John Miller",
      phone: "+1 555-812-9921",
      destination: "Construction Site A",
    },
    notes: "Fragile - handle with care",
  },
  {
    id: "DEL-2002",
    title: "Glass Panels",
    location: "Downtown Office Complex",
    badges: [
      {
        text: "Staged at Plant",
        className: "bg-[#52C41A] hover:bg-[#52C41A] text-white px-3",
      },
      {
        text: "Delayed 30 minutes",
        className:
          "bg-[#FFFBE6] hover:bg-[#FFFBE6] text-[#D4B106] border border-[#FFF1B8] px-3",
        icon: AlertTriangle,
      },
    ],
    material: { quantity: "8,500 lbs", stagingArea: "Warehouse-2" },
    schedule: { arrival: "Mar 24, 08:00 AM", departure: "Mar 24, 11:00 AM" },
    route: { carrier: "Regional Freight", destination: "Construction Site B" },
    truckDetails: {
      truck: "TX-4582",
      driver: "John Miller",
      phone: "+1 555-812-9921",
      destination: "Construction Site A",
    },
    notes: "Fragile - handle with care",
  },
  {
    id: "DEL-2003",
    title: "Concrete Blocks",
    location: "Industrial Park Phase 2",
    badges: [
      {
        text: "Scheduled",
        className: "bg-[#9CA3AF] hover:bg-[#9CA3AF] text-white px-3",
      },
    ],
    material: { quantity: "15,000 lbs", stagingArea: "Yard-B" },
    schedule: { arrival: "Mar 25, 09:00 AM", departure: "Mar 25, 01:00 PM" },
    route: {
      carrier: "Local Delivery Services",
      destination: "Construction Site C",
    },
    truckDetails: {
      truck: "TX-4582",
      driver: "John Miller",
      phone: "+1 555-812-9921",
      destination: "Construction Site A",
    },
    notes: "Standard handling",
  },
  {
    id: "DEL-2004",
    title: "Roll-up Doors (3 units)",
    location: "ABC Logistics Warehouse",
    badges: [
      {
        text: "Ready for Departure",
        className: "bg-[#F97316] hover:bg-[#F97316] text-white px-3",
      },
      {
        text: "High Priority",
        className: "bg-[#FF4D4F] hover:bg-[#FF4D4F] text-white px-3",
      },
    ],
    material: { quantity: "2,500 lbs", stagingArea: "Warehouse-1" },
    schedule: { arrival: "Mar 23, 03:00 PM", departure: "Mar 24, 07:00 AM" },
    route: {
      carrier: "QuickTransport Co.",
      destination: "Construction Site A",
    },
    truckDetails: {
      truck: "TX-4582",
      driver: "John Miller",
      phone: "+1 555-812-9921",
      destination: "Construction Site A",
    },
    notes: "Pickup scheduled for tomorrow",
  },
];

export function EmployeeAssignedProjectsTab({
  dateRange,
  onDateRangeChange,
}: {
  dateRange?: RDateRange;
  onDateRangeChange?: (range: RDateRange | undefined) => void;
}) {
  const [selectedProject, setSelectedProject] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="w-full flex justify-end">
        <DateRangeFilter
          value={dateRange}
          onChange={onDateRangeChange!}
          className="bg-white max-w-60"
        />
      </div>

      <div className="space-y-4">
        {ASSIGNED_PROJECTS.map((project) => (
          <Card key={project.id} className="p-6 shadow-sm border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#3B5998] flex items-center justify-center text-white shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {project.title}
                    </h3>
                    {project.badges.map((badge, idx) => (
                      <Badge
                        key={idx}
                        className={`${badge.className} rounded-full font-medium`}
                      >
                        {badge.icon && <badge.icon className="w-3 h-3 mr-1" />}
                        {badge.text}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {project.location}
                    </div>
                    <div className="font-bold text-gray-900">
                      Delivery ID: {project.id}
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="shrink-0 flex items-center gap-2 rounded-lg font-medium"
                onClick={() => setSelectedProject(project)}
              >
                <Eye className="w-4 h-4" />
                View Details
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-4 px-1">
                  Material Details
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 text-fuchsia-600 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-500 font-medium">
                        Quantity
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {project.material.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-500 font-medium">
                        Staging Area
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {project.material.stagingArea}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-4 px-1">Schedule</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 text-emerald-500 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-500 font-medium">
                        Arrival at Plant
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {project.schedule.arrival}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-500 font-medium">
                        Departure from Plant
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {project.schedule.departure}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-4 px-1">
                  Carrier & Route
                </h4>
                <div className="flex flex-col xl:flex-row gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-500 font-medium">
                          Carrier
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          {project.route.carrier}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-rose-500 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-500 font-medium">
                          Final Destination
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          {project.route.destination}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mt-1 xl:ml-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="text-[11px] space-y-1 mt-0.5 leading-tight">
                      <div className="text-gray-500 font-medium">
                        Truck:{" "}
                        <span className="font-bold text-gray-900 ml-1">
                          {project.truckDetails.truck}
                        </span>
                      </div>
                      <div className="text-gray-500 font-medium">
                        Driver:{" "}
                        <span className="font-bold text-gray-900 ml-1">
                          {project.truckDetails.driver}
                        </span>
                      </div>
                      <div className="text-gray-500 font-medium">
                        Phone:{" "}
                        <span className="font-bold text-gray-900 ml-1">
                          {project.truckDetails.phone}
                        </span>
                      </div>
                      <div className="text-gray-500 font-medium mt-2">
                        Destination:{" "}
                        <span className="font-bold text-gray-900 block mt-0.5">
                          {project.truckDetails.destination}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-4 px-1">Notes</h4>
                <div className="bg-[#FFFBE6] border border-[#FFF1B8] rounded-[10px] p-4 text-sm text-gray-700 font-medium flex items-center min-h-[64px]">
                  {project.notes}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <DeliveryDetailsDialog
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
        project={selectedProject}
      />
    </div>
  );
}
