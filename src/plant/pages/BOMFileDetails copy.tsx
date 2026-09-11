import React from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Send } from "lucide-react";

export default function BomFileDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock table data
  const tableData = [
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
  ];

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
          <h1 className="text-[28px] font-normal text-slate-900 tracking-tight">BOM Files Details</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="bg-white gap-2 font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-lg h-10 px-4"
          >
            <Download className="w-4 h-4" />
            Download Excel
          </Button>
          <Button 
            variant="outline" 
            className="bg-white gap-2 font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-lg h-10 px-4"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button 
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg h-10 px-6 font-medium shadow-sm"
            onClick={() => navigate(`/plant/uploaded-bom-files/${id}/generate-shipper-order`)}
          >
            Share with Shippers
          </Button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm">
        
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

        {/* Tabular Layout */}
        <div className="border-[3px] border-black mt-12 mb-8">
          {/* Custom Header Row */}
          <div className="flex">
            {/* Left Logo Side */}
            <div className="flex-1 p-8 flex flex-col justify-center border-r-[3px] border-black bg-white">
              <div className="flex items-center gap-2">
                <span className="text-4xl font-black text-slate-800 tracking-tight">STORAGE</span>
                <span className="text-3xl font-bold bg-[#1e88e5] text-white px-2 py-1">MATERIALS</span>
              </div>
            </div>
            
            {/* Right Information Side */}
            <div className="flex-1 flex flex-col">
              {/* Row 1 */}
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
              
              {/* Row 2 */}
              <div className="flex flex-1 border-b-[3px] border-black bg-white">
                <div className="flex-1 p-4 border-r-[3px] border-black flex items-center justify-center">
                  <span className="text-sm font-bold">Customer:</span>
                </div>
                <div className="flex-[2] p-4 flex items-center justify-center">
                  <span className="text-[15px] font-bold">John Doe</span>
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex flex-1 bg-white">
                <div className="flex-1 p-4 border-r-[3px] border-black flex items-center justify-center">
                  <span className="text-sm font-bold">Project Name:</span>
                </div>
                <div className="flex-[2] p-4 flex items-center justify-center">
                  <span className="text-[15px] font-bold">ABC Construction</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
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
              {tableData.map((row, index) => (
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
            
            {/* Footer Summary Row */}
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

        <div className="mt-8">
          <p className="text-sm font-medium text-slate-500">Received By:</p>
        </div>

      </div>
    </div>
  );
}
