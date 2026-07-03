import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Search, Truck, X, Star, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import AddNewShipperDialog from "@/plant/components/AddNewShipperDialog";

export default function GenerateShipperOrder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isAddShipperOpen, setIsAddShipperOpen] = useState(false);

  const [shippers, setShippers] = useState([
    { id: 1, name: "Steel Investments", rating: 4.8, area: "Texas / Oklahoma", selected: true },
    { id: 2, name: "DBA Storage Materials", rating: 4.5, area: "Texas / Oklahoma", selected: true },
    { id: 3, name: "Steel Investments", rating: 4.2, area: "Texas / Oklahoma", selected: false },
    { id: 4, name: "DBA Storage Materials", rating: 4.9, area: "Texas / Oklahoma", selected: false },
  ]);

  const toggleShipper = (id: number) => {
    setShippers(shippers.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#eef2fb] min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg h-10 px-4 font-medium shadow-sm gap-2"
            onClick={() => navigate('/plant')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Generate Shipper Order</h1>
        </div>
        <div>
          <Button 
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg h-11 px-8 font-medium shadow-sm gap-2 text-[15px]"
          >
            <Send className="w-4 h-4" />
            Send Order
          </Button>
        </div>
      </div>

      {/* Select Shipper Card */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm mb-6">
        
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">Select Shipper</h2>
              <p className="text-[13px] text-slate-500">Send Material Request to Shipper</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-1 max-w-[600px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search Shippers" 
                className="pl-9 h-11 bg-white border border-slate-200 rounded-lg text-[14px]"
              />
            </div>
            <Button 
              className="bg-[#5c6875] hover:bg-[#4b5563] text-white h-11 px-6 rounded-lg font-medium text-[14px]"
              onClick={() => setIsAddShipperOpen(true)}
            >
              Add new Shipper Mail
            </Button>
          </div>
        </div>

        {/* Shipper Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {shippers.map((shipper) => (
            <div 
              key={shipper.id}
              className={`border rounded-xl p-4 cursor-pointer transition-colors relative flex items-start gap-3
                ${shipper.selected ? 'border-green-500 bg-white shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              onClick={() => toggleShipper(shipper.id)}
            >
              <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center
                ${shipper.selected ? 'bg-white border-green-500 text-green-500' : 'bg-white border-slate-300 text-transparent'}`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-slate-900 leading-tight mb-1">{shipper.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3.5 h-3.5 fill-[#fbbc04] text-[#fbbc04]" />
                  <span className="text-[12px] font-bold text-slate-700">{shipper.rating}</span>
                  <span className="text-[12px] text-slate-300 mx-1">•</span>
                </div>
                <p className="text-[11px] text-slate-500">Service Area: {shipper.area}</p>
              </div>
            </div>
          ))}
        </div>

        {/* New Shippers Tags */}
        <div>
          <p className="text-[13px] font-bold text-slate-900 mb-2">New Shippers</p>
          <div className="flex flex-wrap gap-2">
            <div className="bg-[#f8f9fc] border border-slate-200 rounded-lg py-1.5 pl-3 pr-2 flex items-center gap-2">
              <span className="text-[13px] text-slate-700 font-medium">steelinvestment@gmail.com</span>
              <button className="text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full p-0.5 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* BOM Preview Box */}
      <div className="bg-white rounded-[24px] p-8 shadow-sm opacity-90 pointer-events-none">
        {/* Project Context Box */}
        <div className="bg-[#f8f9fc] rounded-2xl p-6 mb-8">
          <h2 className="text-[22px] font-bold text-slate-900">Project: ABC Construction | BOM ID: BOM-001</h2>
        </div>

        {/* BOM Summary */}
        <div className="bg-[#f8f9fc] rounded-2xl p-6 w-[350px] mb-8">
          <h3 className="text-[17px] font-bold text-slate-900 mb-6">BOM Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-sm font-semibold text-slate-700">Total Items</span>
              <span className="text-sm font-bold text-slate-900">125</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-sm font-semibold text-slate-700">Total Weight</span>
              <span className="text-sm font-bold text-slate-900">32,000 lbs</span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="text-sm font-semibold text-slate-700">Total Panels Area</span>
              <span className="text-sm font-bold text-slate-900">3,300 sqm</span>
            </div>
          </div>
        </div>

        {/* Tabular Layout Preview */}
        <div className="border-[3px] border-black mb-8">
          <div className="flex">
            <div className="flex-1 p-8 flex flex-col justify-center border-r-[3px] border-black bg-white">
              <div className="flex items-center gap-2">
                <span className="text-4xl font-black text-slate-800 tracking-tight">STORAGE</span>
                <span className="text-3xl font-bold bg-[#1e88e5] text-white px-2 py-1">MATERIALS</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex flex-1 border-b-[3px] border-black">
                <div className="flex-[2] p-4 flex items-center justify-center border-r-[3px] border-black bg-white">
                  <h3 className="text-xl font-bold text-black uppercase">Studs & Top Channels</h3>
                </div>
                <div className="flex-1 flex flex-col bg-white">
                  <div className="flex-1 flex border-b-[3px] border-black">
                    <div className="flex-1 p-2 border-r-[3px] border-black flex items-center"><span className="text-[11px] font-bold">Date</span></div>
                    <div className="flex-[2] p-2 flex items-center justify-center"><span className="text-[13px] font-bold">01.09.26</span></div>
                  </div>
                  <div className="flex-1 flex">
                    <div className="flex-1 p-2 border-r-[3px] border-black flex items-center"><span className="text-[11px] font-bold">Job Id</span></div>
                    <div className="flex-[2] p-2 flex items-center justify-center"><span className="text-[13px] font-bold">BLDG-D</span></div>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 border-b-[3px] border-black bg-white">
                <div className="flex-1 p-4 border-r-[3px] border-black flex items-center justify-center"><span className="text-sm font-bold">Customer:</span></div>
                <div className="flex-[2] p-4 flex items-center justify-center"><span className="text-[15px] font-bold">John Doe</span></div>
              </div>
              <div className="flex flex-1 bg-white">
                <div className="flex-1 p-4 border-r-[3px] border-black flex items-center justify-center"><span className="text-sm font-bold">Project Name:</span></div>
                <div className="flex-[2] p-4 flex items-center justify-center"><span className="text-[15px] font-bold">ABC Construction</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden mt-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fc] border-b border-slate-200">
                <th className="py-3 px-4 text-[13px] font-bold text-slate-900">QTY ↑↓</th>
                <th className="py-3 px-4 text-[13px] font-bold text-slate-900">Mark ↑↓</th>
                <th className="py-3 px-4 text-[13px] font-bold text-slate-900">Description</th>
                <th className="py-3 px-4 text-[13px] font-bold text-slate-900">Part</th>
                <th className="py-3 px-4 text-[13px] font-bold text-slate-900">Color</th>
                <th className="py-3 px-4 text-[13px] font-bold text-slate-900">Angle ↑↓</th>
                <th className="py-3 px-4 text-[13px] font-bold text-slate-900">Thick</th>
                <th className="py-3 px-4 text-[13px] font-bold text-slate-900">Length ↑↓</th>
                <th className="py-3 px-4 text-[13px] font-bold text-slate-900">Weight ↑↓</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { qty: 5, mark: "S-1", desc: "STUD", part: "C42516", color: "RO", angle: "-", thick: "16 GA", length: "8'-7 1/4\"", weight: "16.00" },
                { qty: 8, mark: "S-2", desc: "STUD", part: "C42516", color: "RO", angle: "-", thick: "16 GA", length: "8'-7 1/4\"", weight: "16.00" },
                { qty: 6, mark: "S-3", desc: "STUD", part: "C42516", color: "RO", angle: "-", thick: "16 GA", length: "8'-7 1/4\"", weight: "16.00" },
                { qty: 5, mark: "S-4", desc: "STUD", part: "C42516", color: "RO", angle: "-", thick: "16 GA", length: "8'-7 1/4\"", weight: "16.00" },
                { qty: 8, mark: "S-5", desc: "STUD", part: "C42516", color: "RO", angle: "-", thick: "16 GA", length: "8'-7 1/4\"", weight: "16.00" },
                { qty: 6, mark: "S-6", desc: "STUD", part: "C42516", color: "RO", angle: "-", thick: "16 GA", length: "8'-7 1/4\"", weight: "16.00" },
                { qty: 3, mark: "S-7", desc: "STUD", part: "C42516", color: "RO", angle: "-", thick: "16 GA", length: "8'-7 1/4\"", weight: "16.00" },
                { qty: 4, mark: "S-8", desc: "STUD", part: "C42516", color: "RO", angle: "-", thick: "16 GA", length: "8'-7 1/4\"", weight: "16.00" },
                { qty: 2, mark: "S-9", desc: "STUD", part: "C42516", color: "RO", angle: "-", thick: "16 GA", length: "8'-7 1/4\"", weight: "16.00" },
                { qty: 4, mark: "S-10", desc: "STUD", part: "C42516", color: "RO", angle: "-", thick: "16 GA", length: "8'-7 1/4\"", weight: "16.00" },
              ].map((row, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 text-[14px] text-slate-600 font-medium">{row.qty}</td>
                  <td className="py-4 px-4 text-[14px] text-slate-600 font-medium">{row.mark}</td>
                  <td className="py-4 px-4 text-[14px] text-slate-400">{row.desc}</td>
                  <td className="py-4 px-4 text-[14px] text-slate-600 font-medium">{row.part}</td>
                  <td className="py-4 px-4 text-[14px] text-slate-400">{row.color}</td>
                  <td className="py-4 px-4 text-[14px] text-slate-400">{row.angle}</td>
                  <td className="py-4 px-4 text-[14px] text-slate-400">{row.thick}</td>
                  <td className="py-4 px-4 text-[14px] text-slate-400">{row.length}</td>
                  <td className="py-4 px-4 text-[14px] text-slate-400">{row.weight}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#f8f9fc] border-t border-slate-200">
              <tr>
                <td className="py-5 px-4 text-[14px] text-slate-600 font-medium" colSpan={2}>
                  QTY Total
                </td>
                <td className="py-5 px-4 text-[13px] text-slate-400" colSpan={2}>
                  Total Tons: <span className="text-slate-600 font-medium ml-2">1.71</span>
                </td>
                <td className="py-5 px-4 text-[13px] text-slate-400">RO</td>
                <td className="py-5 px-4 text-[13px] text-slate-400">-</td>
                <td className="py-5 px-4 text-[13px] text-slate-400" colSpan={2}>
                  Total Weight (lbs)
                </td>
                <td className="py-5 px-4 text-[14px] text-slate-600 font-medium">3423</td>
              </tr>
              <tr>
                <td className="py-5 px-4 text-[14px] text-slate-600 font-medium" colSpan={9}>
                  199
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <AddNewShipperDialog 
        open={isAddShipperOpen}
        onOpenChange={setIsAddShipperOpen}
      />

    </div>
  );
}
