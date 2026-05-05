import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Package,
  Check,
  Circle,
  ArrowRight,
  Truck,
  Building2,
  MapPin,
  Calendar,
  Download,
} from "lucide-react";

interface DeliveryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any;
}

export function DeliveryDetailsDialog({
  open,
  onOpenChange,
  project,
}: DeliveryDetailsDialogProps) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0">
        <div className="p-8 space-y-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#3B5998] flex items-center justify-center text-white shrink-0">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Delivery Details
                </DialogTitle>
                <Badge className="bg-[#FF4D4F] hover:bg-[#FF4D4F] text-white rounded-full px-3 py-0.5">
                  High Priority
                </Badge>
              </div>
              <div className="text-gray-500 font-medium text-lg mt-1">
                {project.id}
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="border border-[#4669C1] bg-[#F5F8FF] rounded-xl p-5 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 text-sm font-semibold text-[#4669C1] mb-1">
                <span>Current Status</span>
                <span className="flex items-center gap-1.5 text-[#4669C1]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFB020]"></span>
                  {project.badges?.find((b: any) => b.text.includes("ETA"))
                    ?.text || "ETA 10:45 AM"}
                </span>
              </div>
              <div className="text-3xl font-bold text-[#4669C1]">
                {project.badges?.[0]?.text || "In Transit to Plant"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-500 mb-1">
                Staging Area
              </div>
              <div className="text-xl font-bold text-gray-900">
                {project.material.stagingArea}
              </div>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="border border-[#4669C1]/30 bg-white rounded-xl p-5">
            <div className="grid grid-cols-4 lg:grid-cols-5 gap-y-4 text-sm font-semibold text-[#4669C1]">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#4669C1]" strokeWidth={3} />
                Scheduled
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#4669C1]" strokeWidth={3} />
                Material Prepared
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#4669C1]" strokeWidth={3} />
                Loaded
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#4669C1]" strokeWidth={3} />
                Picked Up
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FFB020] ml-1 mr-1"></span>
                In Transit
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-5 h-5 text-[#4669C1]" strokeWidth={2} />
                Arrived at Plant
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-5 h-5 text-[#4669C1]" strokeWidth={2} />
                Staged
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-5 h-5 text-[#4669C1]" strokeWidth={2} />
                Dispatched to Site
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-5 h-5 text-[#4669C1]" strokeWidth={2} />
                Delivered
              </div>
            </div>
          </div>

          {/* Delivery Flow */}
          <div className="bg-[#F0F5FF] rounded-xl p-5 border border-blue-50">
            <h4 className="font-bold text-gray-900 mb-4 text-sm">
              Delivery Flow
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#4669C1] flex items-center justify-center text-white">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    Origin
                  </div>
                  <div className="font-bold text-gray-900">
                    {project.route.carrier}
                  </div>
                </div>
              </div>
              <ArrowRight className="text-gray-300 w-6 h-6" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#52C41A] flex items-center justify-center text-white">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    Plant Staging
                  </div>
                  <div className="font-bold text-gray-900">
                    {project.material.stagingArea}
                  </div>
                </div>
              </div>
              <ArrowRight className="text-gray-300 w-6 h-6" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FA8C16] flex items-center justify-center text-white">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    Destination
                  </div>
                  <div className="font-bold text-gray-900">
                    {project.route.destination}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Column Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Material Info */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">
                Material Information
              </h4>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">
                      Material
                    </div>
                    <div className="font-bold text-gray-900 text-sm mt-0.5">
                      {project.title}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">
                      Project
                    </div>
                    <div className="font-bold text-gray-900 text-sm mt-0.5">
                      {project.location}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">
                      Quantity
                    </div>
                    <div className="font-bold text-gray-900 text-sm mt-0.5">
                      {project.material.quantity}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plant Schedule */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Plant Schedule</h4>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-emerald-500 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">
                      Arrival at Plant
                    </div>
                    <div className="font-bold text-gray-900 text-sm mt-0.5">
                      Tuesday, March 24, 2026
                      <br />
                      at 10:00 AM
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">
                      Departure from Plant
                    </div>
                    <div className="font-bold text-gray-900 text-sm mt-0.5">
                      Tuesday, March 24, 2026
                      <br />
                      at 02:00 PM
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carrier & Route */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Carrier & Route</h4>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">
                      Carrier
                    </div>
                    <div className="font-bold text-gray-900 text-sm mt-0.5">
                      {project.route.carrier}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-rose-500 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">
                      Final Destination
                    </div>
                    <div className="font-bold text-gray-900 text-sm mt-0.5">
                      {project.route.destination}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="text-[12px] space-y-1.5 leading-tight">
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
                    <div className="text-gray-500 font-medium mt-1">
                      Destination:{" "}
                      <span className="font-bold text-gray-900 block mt-0.5">
                        {project.truckDetails.destination}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div>
              <h4 className="font-bold text-gray-900 mb-4">
                Weight Units + Material Type
              </h4>
              <div className="border border-green-200 bg-[#F6FFEE] rounded-xl p-5 text-sm text-gray-700 space-y-1">
                <div>Quantity: {project.material.quantity}</div>
                <div>Material Type: Structural Steel</div>
                <div>Packaging: Bundled Frame Components</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Documents</h4>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="h-12 flex-1 justify-between bg-[#F5F8FF] border-blue-200 hover:bg-blue-100 text-[#4669C1] rounded-xl"
                >
                  Packing list
                  <Download className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="h-12 flex-1 justify-between bg-[#F5F8FF] border-blue-200 hover:bg-blue-100 text-[#4669C1] rounded-xl"
                >
                  Bill of loading
                  <Download className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="pt-2 pb-6 border-b border-gray-100">
            <h4 className="font-bold text-gray-900 mb-4">
              Special Instructions
            </h4>
            <div className="border border-[#FFF1B8] bg-[#FFFBE6] rounded-xl p-5 text-sm font-medium text-gray-900">
              Requires forklift for unloading
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pb-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg px-8"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
