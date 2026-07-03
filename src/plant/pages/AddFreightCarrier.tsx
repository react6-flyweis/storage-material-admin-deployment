import React, { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ChevronDown, FolderUp, X, Info, Plus } from "lucide-react";

export default function AddFreightCarrier() {
  const [carrierOpen, setCarrierOpen] = useState(true);
  const [addressOpen, setAddressOpen] = useState(true);
  const [fleetEquipOpen, setFleetEquipOpen] = useState(true);
  const [fleetCapOpen, setFleetCapOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(true);

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 bg-[#f4f7fb] min-h-screen font-sans max-w-[1200px] mx-auto w-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/plant/freight-carriers" className="flex items-center text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-3" />
          Add New Freight Carried
        </Link>
        <Button className="bg-[#3b82f6] hover:bg-blue-600 text-white rounded-md font-medium px-4 py-2 flex items-center h-10 shadow-sm">
          <EyeIcon className="w-4 h-4 mr-2" /> Add Freight Carrier
        </Button>
      </div>

      <div className="space-y-6 max-w-[1000px]">
        
        {/* Carrier Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div 
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 border-b border-gray-100"
            onClick={() => setCarrierOpen(!carrierOpen)}
          >
            <div className="flex items-center font-bold text-gray-700">
              <Info className="w-5 h-5 text-teal-500 mr-2" />
              Carriers Information
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${carrierOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {carrierOpen && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-900">Carriers Name <span className="text-red-500">*</span></label>
                <Input className="h-11 border-gray-200" defaultValue="Ironhoul Logistics" />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-900">Carriers ID (Auto-generated + Editable) <span className="text-red-500">*</span></label>
                <Input className="h-11 border-gray-200" defaultValue="DLV-2026-10482" />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-900">Phone Number <span className="text-red-500">*</span></label>
                <div className="flex">
                  <Select defaultValue="us">
                    <SelectTrigger className="w-[100px] h-11 rounded-r-none border-r-0 border-gray-200 bg-gray-50/50">
                      <div className="flex items-center gap-2">
                        <span>🇺🇸</span>
                        <span>+1</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent><SelectItem value="us">US +1</SelectItem></SelectContent>
                  </Select>
                  <Input placeholder="000-000-0000" className="h-11 rounded-l-none border-gray-200" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-900">Email Address <span className="text-red-500">*</span></label>
                <Input className="h-11 border-gray-200" defaultValue="emmawatson@email.com" />
              </div>
            </div>
          )}
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div 
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 border-b border-gray-100"
            onClick={() => setAddressOpen(!addressOpen)}
          >
            <div className="flex items-center font-bold text-gray-700">
              <Info className="w-5 h-5 text-teal-500 mr-2" />
              Address Information
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${addressOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {addressOpen && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-900">Place Number <span className="text-red-500">*</span></label>
                  <Input className="h-11 border-gray-200" defaultValue="Flat 402" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-900">Street Address <span className="text-red-500">*</span></label>
                  <Input className="h-11 border-gray-200" defaultValue="Palm Residency, MG Road" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-900">Landmark <span className="text-red-500">*</span></label>
                  <Input className="h-11 border-gray-200" defaultValue="Near City Hospital" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-900">City <span className="text-red-500">*</span></label>
                  <Select defaultValue="pune">
                    <SelectTrigger className="h-11 border-gray-200"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="pune">Pune</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-900">State <span className="text-red-500">*</span></label>
                  <Select defaultValue="mh">
                    <SelectTrigger className="h-11 border-gray-200"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="mh">Maharashtra</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-900">Postal Code <span className="text-red-500">*</span></label>
                  <Select defaultValue="pc">
                    <SelectTrigger className="h-11 border-gray-200"><SelectValue placeholder="411001" /></SelectTrigger>
                    <SelectContent><SelectItem value="pc">411001</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-900">GPS Coordinates <span className="text-red-500">*</span></label>
                  <Input className="h-11 border-gray-200" defaultValue="40.7128, -74.0060" />
                </div>
              </div>

              {/* Map Preview Area */}
              <div>
                <div className="w-full h-[180px] bg-[#eef2f6] rounded-xl overflow-hidden relative border border-gray-200 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-60 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=14&size=800x300&sensor=false')] bg-cover bg-center filter grayscale-[30%]" />
                  <div className="relative z-10 w-14 h-14 bg-blue-100/80 rounded-full flex items-center justify-center shadow-lg border-2 border-white backdrop-blur-sm">
                    <div className="w-8 h-8 bg-blue-500 rounded-sm flex items-center justify-center text-white text-lg">
                      🏢
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Fleet & Equipment Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div 
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 border-b border-gray-100"
            onClick={() => setFleetEquipOpen(!fleetEquipOpen)}
          >
            <div className="flex items-center font-bold text-gray-700">
              <Info className="w-5 h-5 text-teal-500 mr-2" />
              Fleet & Equipment Details
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${fleetEquipOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {fleetEquipOpen && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-900">Select Equipment</label>
                  <Select defaultValue="ft">
                    <SelectTrigger className="h-11 border-gray-200"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="ft">Flatbed trucks</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-900">Add Quantity</label>
                  <Input className="h-11 border-gray-200" defaultValue="5" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-900">Select Equipment</label>
                  <Select defaultValue="dv">
                    <SelectTrigger className="h-11 border-gray-200"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="dv">Dry Vans</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-900">Add Quantity</label>
                  <Input className="h-11 border-gray-200" defaultValue="5" />
                </div>
              </div>
              
              <button className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center hover:bg-blue-200 transition-colors mt-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Fleet Capacity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div 
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 border-b border-gray-100"
            onClick={() => setFleetCapOpen(!fleetCapOpen)}
          >
            <div className="flex items-center font-bold text-gray-700">
              <Info className="w-5 h-5 text-teal-500 mr-2" />
              Fleet Capacity
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${fleetCapOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {fleetCapOpen && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-900">Total Vehicle <span className="text-red-500">*</span></label>
                <Input className="h-11 border-gray-200" defaultValue="32" />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-900">Maximum Load Capacity <span className="text-red-500">*</span></label>
                <Input className="h-11 border-gray-200" defaultValue="800000 lbs" />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-900">Average Fleet Age <span className="text-red-500">*</span></label>
                <Input className="h-11 border-gray-200" defaultValue="4.2" />
              </div>
            </div>
          )}
        </div>

        {/* Upload Documents - No Accordion header, just text then cards */}
        <div className="pt-4">
          <h3 className="font-bold text-[17px] text-[#0f172a] mb-4">Upload Documents</h3>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Box */}
            <div className="w-full md:w-[400px] bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center">
              <h4 className="font-bold text-gray-900 mb-1 text-[15px]">Upload Documents & Files</h4>
              <p className="text-sm text-gray-500 mb-6">Add your documents here, and you can u...</p>
              
              <div className="border-2 border-dashed border-blue-400 rounded-xl p-8 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="w-12 h-12 bg-[#3b82f6] rounded-xl flex items-center justify-center text-white mb-4 shadow-sm">
                  <FolderUp className="w-6 h-6" />
                </div>
                <Button variant="outline" className="border-blue-500 text-blue-600 bg-white shadow-sm font-semibold rounded-full px-6 hover:bg-blue-50 h-10">
                  Browse files
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">
                Only support .jpg, .png and .svg and zip fi...
              </p>
            </div>

            {/* Right Box (File list) */}
            <div className="flex-1">
              <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm max-w-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-bold text-[10px]">
                    PDF
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900 mb-0.5">Insurance.pdf</div>
                    <div className="text-xs text-gray-500">5.3MB</div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 mr-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Internal Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div 
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 border-b border-gray-100"
            onClick={() => setNotesOpen(!notesOpen)}
          >
            <div className="flex items-center font-bold text-gray-700">
              <Info className="w-5 h-5 text-teal-500 mr-2" />
              Internal Notes
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${notesOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {notesOpen && (
            <div className="p-6">
              <div className="min-h-[100px] text-sm bg-[#fafafa] border border-gray-200 rounded-md p-4 text-gray-700 leading-relaxed">
                Client requested work completion before Friday inspection. Ensure safety compliance checklist is completed before closure.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
