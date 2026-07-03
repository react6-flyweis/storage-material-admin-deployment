import React from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Package,
  MapPin,
  CalendarDays,
  User,
  Paperclip,
  Clock,
  Ruler
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CreateFreightRequest() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1200px] mx-auto bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            className="p-2 h-10 w-10 bg-white shadow-sm border border-gray-200 rounded-full hover:bg-gray-50 mt-1"
            onClick={() => navigate('/plant')}
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEditing ? "Edit Freight Request" : "Create Freight Request"}
            </h1>
            <p className="text-gray-500 mt-1">
              Request freight pricing from carriers and compare competitive bids
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="bg-[#2563EB] hover:bg-blue-700 text-white h-11 px-8 rounded-lg shadow-sm border-none"
            onClick={() => navigate("/plant/freight-request-details/" + (id || "FRQ-2001"))}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className="space-y-6 mt-8">
        {/* Load Details Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Load Details (Not Editable)</h2>
              <p className="text-gray-500 text-sm mt-0.5">Describe what needs to be transported</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Load Description <span className="text-red-500">*</span>
              </label>
              <Input 
                defaultValue="Primary Steel Frame - 45,000 lbs" 
                disabled={isEditing}
                className="h-11 border-gray-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Weight <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input 
                    defaultValue="45000" 
                    disabled={isEditing}
                    className="h-11 pl-10 border-gray-200 rounded-r-none"
                  />
                </div>
                <select disabled={isEditing} className="h-11 px-4 border border-l-0 border-gray-200 rounded-r-md bg-white text-gray-700 text-sm focus:outline-none">
                  <option>Lbs</option>
                  <option>Kg</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Dimensions</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Ruler className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  defaultValue="40' x 8' x 8'" 
                  disabled={isEditing}
                  className="h-11 pl-10 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Material Type</label>
              <select disabled={isEditing} className="w-full h-11 px-3 border border-gray-200 rounded-md bg-white text-gray-700 text-sm focus:outline-none">
                <option>Steel & Metal</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Pallet / Package Count</label>
              <select disabled={isEditing} className="w-full h-11 px-3 border border-gray-200 rounded-md bg-white text-gray-700 text-sm focus:outline-none">
                <option>6 Bundles</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Loading Equipment</label>
              <select disabled={isEditing} className="w-full h-11 px-3 border border-gray-200 rounded-md bg-white text-gray-700 text-sm focus:outline-none">
                <option>Crain</option>
              </select>
            </div>

            <div className="hidden md:block"></div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Bid Deadline</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  defaultValue="Carriers must respond within 6 hours." 
                  disabled={isEditing}
                  className="h-11 pl-10 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Document Upload</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Paperclip className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  placeholder="Attachments" 
                  disabled={isEditing}
                  className="h-11 pl-10 border-gray-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Locations Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Locations (Not Editable)</h2>
              <p className="text-gray-500 text-sm mt-0.5">Pickup and delivery addresses</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Pickup Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-green-500" />
                </div>
                <Input 
                  defaultValue="e.g., Steel Mill, Pittsburgh, PA" 
                  disabled={isEditing}
                  className="h-11 pl-10 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Delivery Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-red-500" />
                </div>
                <Input 
                  defaultValue="e.g., Construction Site, Austin, TX" 
                  disabled={isEditing}
                  className="h-11 pl-10 border-gray-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timing Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Timing</h2>
              <p className="text-gray-500 text-sm mt-0.5">Pickup and delivery schedule</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Pickup Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  placeholder="DD/MM/YYYY" 
                  className="h-11 pl-10 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Pickup Time</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  placeholder="HH:MM" 
                  className="h-11 pl-10 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Delivery Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  placeholder="DD/MM/YYYY" 
                  className="h-11 pl-10 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Delivery Time</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  placeholder="HH:MM" 
                  className="h-11 pl-10 border-gray-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coordination Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <User className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Coordination</h2>
              <p className="text-gray-500 text-sm mt-0.5">Contact and special requirements</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Receiving POC <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  placeholder="Full name of on-site contact" 
                  className="h-11 pl-10 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Pickup Contact Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  placeholder="0987654321" 
                  className="h-11 pl-10 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Special Requirements</label>
              <Textarea 
                placeholder="e.g., Crane unloading required, liftgate needed, fragile..."
                className="min-h-[100px] border-gray-200 resize-none py-3"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Additional Notes</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <Paperclip className="h-4 w-4 text-gray-400" />
                </div>
                <Textarea 
                  placeholder="Any other information for carriers..."
                  className="min-h-[100px] border-gray-200 resize-none pl-10 py-3"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
