import React from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Download, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

const itemizedData = [
  { qty: 5, item: "PC16RO8X", desc: "16Ga CEE Purlin Red Oxide 8X3-12\"\nPunch: Custom, Piece Mark: DJ-1", length: "6'11-3/4\"", weight: 621, price: "$2.0", amount: "$16.00" },
  { qty: 8, item: "PC16RO8X", desc: "16Ga CEE Purlin Red Oxide 8X3-12\"\nPunch: Custom, Piece Mark: DJ-1", length: "6'11-3/4\"", weight: 621, price: "$2.0", amount: "$16.00" },
  { qty: 6, item: "PC16RO8X", desc: "16Ga CEE Purlin Red Oxide 8X3-12\"\nPunch: Custom, Piece Mark: DJ-1", length: "6'11-3/4\"", weight: 621, price: "$2.0", amount: "$16.00" },
  { qty: 5, item: "PC16RO8X", desc: "16Ga CEE Purlin Red Oxide 8X3-12\"\nPunch: Custom, Piece Mark: DJ-1", length: "6'11-3/4\"", weight: 621, price: "$2.0", amount: "$16.00" },
  { qty: 8, item: "PC16RO8X", desc: "16Ga CEE Purlin Red Oxide 8X3-12\"\nPunch: Custom, Piece Mark: DJ-1", length: "6'11-3/4\"", weight: 621, price: "$2.0", amount: "$16.00" },
  { qty: 6, item: "PC16RO8X", desc: "16Ga CEE Purlin Red Oxide 8X3-12\"\nPunch: Custom, Piece Mark: DJ-1", length: "6'11-3/4\"", weight: 621, price: "$2.0", amount: "$16.00" },
  { qty: 3, item: "PC16RO8X", desc: "16Ga CEE Purlin Red Oxide 8X3-12\"\nPunch: Custom, Piece Mark: DJ-1", length: "6'11-3/4\"", weight: 621, price: "$2.0", amount: "$16.00" },
  { qty: 4, item: "PC16RO8X", desc: "16Ga CEE Purlin Red Oxide 8X3-12\"\nPunch: Custom, Piece Mark: DJ-1", length: "6'11-3/4\"", weight: 621, price: "$2.0", amount: "$16.00" },
  { qty: 2, item: "PC16RO8X", desc: "16Ga CEE Purlin Red Oxide 8X3-12\"\nPunch: Custom, Piece Mark: DJ-1", length: "6'11-3/4\"", weight: 621, price: "$2.0", amount: "$16.00" },
];

export default function ShipperFileDetails() {
  const { projectId } = useParams();

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#eef2fa] min-h-screen font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link 
          to={`/plant/shipper-quotation/${projectId || 'PRJ-001'}`} 
          className="inline-flex items-center text-lg font-bold text-gray-900 hover:underline"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Shipper File
        </Link>
        
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white text-gray-700">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-md" asChild>
            <Link to="/plant/order-verification">
              <Scale className="w-4 h-4 mr-2" />
              Order Verification
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        
        {/* Title Block */}
        <div className="bg-[#f8fafc] rounded-xl p-6 border border-gray-100 mb-12">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-4">
            Project: ABC Warehouse Project
          </h2>
          <div className="flex flex-wrap gap-x-12 gap-y-4 text-sm font-medium">
            <div className="flex flex-col gap-1">
              <span className="text-gray-900">Project ID: PRJ-1025</span>
              <span className="text-gray-900">Shipper: SteelCorp</span>
            </div>
            
            {/* Divider line for desktop */}
            <div className="hidden sm:block w-px bg-gray-300 h-10 self-center"></div>
            
            <div className="flex flex-col gap-1">
              <span className="text-gray-900">Shipper File: steel_v1.xlsx</span>
              <span className="text-gray-900">Upload Date: Apr 22, 2026</span>
              <span className="text-gray-900 flex items-center gap-1.5">
                Status: <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block ml-1"></span> Pending Verificaion
              </span>
            </div>
          </div>
        </div>

        {/* Sales Order Document Header */}
        <div className="px-2 md:px-8 max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
            
            {/* Logo Area (Simulated) */}
            <div className="flex items-center">
              <div className="relative">
                <div className="text-[#e8812c] font-black italic text-4xl tracking-tighter flex items-center">
                  <svg viewBox="0 0 100 20" className="w-16 h-8 text-[#e8812c] fill-current mr-1"><path d="M0,10 L30,5 L30,15 Z M20,15 L50,10 L50,20 Z" /></svg>
                  Quicken
                </div>
                <div className="text-gray-500 font-bold text-sm text-right mt-0 tracking-widest uppercase">Steel, LLC</div>
              </div>
            </div>

            {/* Address */}
            <div className="text-center md:text-left">
              <h3 className="font-bold text-xl tracking-wide uppercase text-gray-900 mb-1">Quicken Steel, LLC</h3>
              <p className="text-sm font-bold text-gray-800">188 Georgia Pacific Dr</p>
              <p className="text-sm font-bold text-gray-800">Claxton, GA 30417</p>
              <p className="text-sm font-bold text-gray-800">Phone: (912) 549-4050</p>
            </div>

            {/* Sales Order Box */}
            <div className="text-center">
              <h3 className="font-bold text-xl tracking-wide uppercase text-gray-900 mb-2">Sales Order</h3>
              <div className="border-2 border-gray-300 bg-[#e5e7eb] rounded-sm overflow-hidden">
                <table className="w-48 text-sm">
                  <tbody>
                    <tr className="border-b-2 border-gray-300">
                      <td className="font-bold py-1 px-3 text-gray-800 border-r-2 border-gray-300 text-right">ORDER NO.</td>
                      <td className="bg-white font-medium py-1 px-3 text-center">S-19459</td>
                    </tr>
                    <tr className="border-b-2 border-gray-300">
                      <td className="font-bold py-1 px-3 text-gray-800 border-r-2 border-gray-300 text-right">ORDER DATE</td>
                      <td className="bg-white font-medium py-1 px-3 text-center">1/14/2026</td>
                    </tr>
                    <tr>
                      <td className="font-bold py-1 px-3 text-gray-800 border-r-2 border-gray-300 text-right text-xs">REQUESTED DATE</td>
                      <td className="bg-white font-medium py-1 px-3 text-center">3/31/2026</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Customer PO Table */}
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#b5b6b8] text-gray-900 font-bold border-b border-gray-300">
                <tr>
                  <th className="px-4 py-3">Customer PO#</th>
                  <th className="px-4 py-3 border-l border-gray-300">Sales Person</th>
                  <th className="px-4 py-3 border-l border-gray-300">Warehouse</th>
                  <th className="px-4 py-3 border-l border-gray-300">Terms</th>
                  <th className="px-4 py-3 border-l border-gray-300">Ship Via</th>
                </tr>
              </thead>
              <tbody className="bg-[#f8f9fa]">
                <tr>
                  <td className="px-4 py-3 font-bold text-gray-800">USB Shipper</td>
                  <td className="px-4 py-3 font-bold text-gray-800 border-l border-gray-200">Hunter Jeffcoat</td>
                  <td className="px-4 py-3 font-bold text-gray-800 border-l border-gray-200">CLX</td>
                  <td className="px-4 py-3 font-bold text-gray-800 border-l border-gray-200">Cash in Advance</td>
                  <td className="px-4 py-3 font-bold text-gray-800 border-l border-gray-200">3rd Party</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Line Items Table */}
          <div className="border border-gray-100 rounded-lg overflow-hidden mt-8">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8fafc] text-gray-800 font-bold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 w-20 text-center">QTY ⇅</th>
                  <th className="px-4 py-4 w-32">Item ⇅</th>
                  <th className="px-4 py-4">Description</th>
                  <th className="px-4 py-4 w-28">Length ⇅</th>
                  <th className="px-4 py-4 w-20">Weight</th>
                  <th className="px-4 py-4 w-28">Unit Price ⇅</th>
                  <th className="px-4 py-4 w-28 text-right">Amount ⇅</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {itemizedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-5 text-gray-800 font-medium text-center">{row.qty}</td>
                    <td className="px-4 py-5 font-bold text-gray-700">{row.item}</td>
                    <td className="px-4 py-5 text-gray-600">
                      <div className="whitespace-pre-line font-medium leading-relaxed">
                        {row.desc}
                      </div>
                    </td>
                    <td className="px-4 py-5 font-medium text-gray-700">{row.length}</td>
                    <td className="px-4 py-5 text-gray-600">{row.weight}</td>
                    <td className="px-4 py-5 text-gray-600">{row.price}</td>
                    <td className="px-4 py-5 text-gray-600 font-medium text-right">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
