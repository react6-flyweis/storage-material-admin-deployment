import React from "react";
import { Link, useParams } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";

const truckloadSummaryData = [
  { id: "LOAD-001", bundle: 2, weight: "36000 IBS", destination: "Riverside Site A", checked: true },
  { id: "LOAD-002", bundle: 2, weight: "44500 IBS", destination: "Riverside Site A", checked: true },
];

const truckLoad1Data = [
  { id: "BND-001", parts: "STL-B12", weight: "3600 IBS", pl: true, qr: true, assigned: true },
  { id: "BND-002", parts: "STL-B12", weight: "2400 IBS", pl: true, qr: true, assigned: true },
  { id: "BND-003", parts: "STL-A03", weight: "4500 IBS", pl: true, qr: true, assigned: true },
  { id: "BND-004", parts: "STL-B12", weight: "2700 IBS", pl: true, qr: true, assigned: true },
];

const truckLoad2Data = [
  { id: "BND-001", parts: "STL-B12", weight: "3600 IBS", pl: true, qr: true, assigned: true },
  { id: "BND-002", parts: "STL-B12", weight: "2400 IBS", pl: true, qr: true, assigned: true },
  { id: "BND-003", parts: "STL-A03", weight: "4500 IBS", pl: true, qr: true, assigned: true },
];

export default function LoadPlanDetails() {
  const { projectId, loadId } = useParams();

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#fbfbfe] min-h-screen font-sans">
      <Link 
        to={`/plant/load-planning/${projectId || 'PRJ-001'}`} 
        className="inline-flex items-center text-sm font-bold text-gray-900 hover:underline"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Load Plan
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-10">
        
        {/* Header Box */}
        <div className="bg-[#f8fafc] rounded-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Project: {projectId || 'Riverside Complex'} | Shipper Ref: SHP-1044
          </h2>
        </div>

        {/* Load Summary Card */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Load Summary Card</h3>
          <div className="max-w-md space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Total Bundles</span>
              <span className="font-medium text-gray-700">4</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Total Loads</span>
              <span className="font-medium text-gray-700">2</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Total Weight</span>
              <span className="font-medium text-gray-700">18500 IBS</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Estimated Freight Request</span>
              <span className="font-medium text-gray-700">$9700</span>
            </div>
          </div>
        </div>

        {/* Truckload Summary */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Truckload Summary</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#2a2a2a] text-white font-semibold">
                <tr>
                  <th className="px-6 py-4 w-16">#</th>
                  <th className="px-6 py-4">Load ID</th>
                  <th className="px-6 py-4">Bundle</th>
                  <th className="px-6 py-4">Total Weight</th>
                  <th className="px-6 py-4">Destination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {truckloadSummaryData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{row.id}</td>
                    <td className="px-6 py-4 text-gray-600">{row.bundle}</td>
                    <td className="px-6 py-4 text-gray-600">{row.weight}</td>
                    <td className="px-6 py-4 text-gray-500 flex items-center gap-6">
                      {row.destination}
                      {row.checked && <Check className="w-5 h-5 text-gray-800" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Truck Load 1 */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Truck Load 1</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#2a2a2a] text-white font-semibold">
                <tr>
                  <th className="px-6 py-4 w-16">#</th>
                  <th className="px-6 py-4">Bundle ID</th>
                  <th className="px-6 py-4">Parts</th>
                  <th className="px-6 py-4">Weight</th>
                  <th className="px-6 py-4 text-center">Packing List Genrated</th>
                  <th className="px-6 py-4 text-center">QR Labels Generated</th>
                  <th className="px-6 py-4 text-center">Bundles Assigned to Truck</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {truckLoad1Data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-5 text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-5 font-medium text-gray-700">{row.id}</td>
                    <td className="px-6 py-5 text-gray-500">{row.parts}</td>
                    <td className="px-6 py-5 text-gray-500 max-w-[80px]">{row.weight}</td>
                    <td className="px-6 py-5 text-center">
                      {row.pl && <Check className="w-5 h-5 text-gray-800 mx-auto" />}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {row.qr && <Check className="w-5 h-5 text-gray-800 mx-auto" />}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {row.assigned && <Check className="w-5 h-5 text-gray-800 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Truck Load 2 */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Truck Load 2</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#2a2a2a] text-white font-semibold">
                <tr>
                  <th className="px-6 py-4 w-16">#</th>
                  <th className="px-6 py-4">Bundle ID</th>
                  <th className="px-6 py-4">Parts</th>
                  <th className="px-6 py-4">Weight</th>
                  <th className="px-6 py-4 text-center">Packing List Genrated</th>
                  <th className="px-6 py-4 text-center">QR Labels Generated</th>
                  <th className="px-6 py-4 text-center">Bundles Assigned to Truck</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {truckLoad2Data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-5 text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-5 font-medium text-gray-700">{row.id}</td>
                    <td className="px-6 py-5 text-gray-500">{row.parts}</td>
                    <td className="px-6 py-5 text-gray-500 max-w-[80px]">{row.weight}</td>
                    <td className="px-6 py-5 text-center">
                      {row.pl && <Check className="w-5 h-5 text-gray-800 mx-auto" />}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {row.qr && <Check className="w-5 h-5 text-gray-800 mx-auto" />}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {row.assigned && <Check className="w-5 h-5 text-gray-800 mx-auto" />}
                    </td>
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
