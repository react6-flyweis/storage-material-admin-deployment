import React from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const packingListData = [
  { id: 1, loadId: "LOAD-001", truck: "TX-2141", bundles: 3, weight: "36000 IBS", destination: "Riverside Site A", status: "Ready" },
  { id: 2, loadId: "LOAD-002", truck: "TX-4712", bundles: 2, weight: "45500 IBS", destination: "Riverside Site A", status: "Ready" },
];

const bundleListData = [
  { id: 1, bundleId: "BND-001", profile: "Beam", items: "STL-B12 × 30", length: "20 ft", weight: "3600 IBS" },
  { id: 2, bundleId: "BND-002", profile: "Angle", items: "STL-B12 × 30", length: "12 ft", weight: "2400 IBS" },
  { id: 3, bundleId: "BND-003", profile: "Channel", items: "STL-B12 × 30", length: "15 ft", weight: "4500 IBS" },
  { id: 4, bundleId: "BND-004", profile: "Beam", items: "STL-B12 × 30", length: "20 ft", weight: "2700 IBS" },
];

export default function PackingListDetails() {
  const { projectId } = useParams();

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#fafafa] min-h-screen font-sans">
      <div className="flex items-center gap-4 mb-2">
        <Link 
          to={`/plant/packing-list/${projectId || 'PRJ-001'}`} 
          className="inline-flex items-center text-lg font-bold text-gray-900 hover:underline"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Packing List
        </Link>
      </div>
      <p className="text-sm text-gray-500 max-w-xl mb-6">
        Generate and manage packing lists for truckloads and bundles.
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        
        {/* Title Block */}
        <div className="bg-[#f8fafc] rounded-xl p-6 border border-gray-100 mb-10">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-4">
            Project: Riverside Complex | Truckloads: 2
          </h2>
          <div className="flex flex-col gap-2 text-sm font-bold text-gray-800">
            <span>Project: Riverside Complex</span>
            <span>Upload ID: UPL-001</span>
            <span>Bundles Created: 5</span>
            <span>Total Weight: 18500 IBS</span>
          </div>
        </div>

        {/* Optimization Summary Card */}
        <div className="mb-10 max-w-sm">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Optimization Summary Card</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-gray-800">Truck Loads</span>
              <span className="font-bold text-gray-900">2</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-gray-800">Total Bundles</span>
              <span className="font-bold text-gray-900">4</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-gray-800">Total Weight</span>
              <span className="font-bold text-gray-900">18500 IBS</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-gray-800">Packing List Geneated</span>
              <span className="font-bold text-gray-900">2</span>
            </div>
          </div>
        </div>

        {/* Packing List Table */}
        <div className="mb-10">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Packing List</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#2a2a2a] text-white">
                <tr>
                  <th className="px-6 py-4 w-16">#</th>
                  <th className="px-6 py-4">Load ID</th>
                  <th className="px-6 py-4">Truck</th>
                  <th className="px-6 py-4">Bundles</th>
                  <th className="px-6 py-4 w-32">Weight</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {packingListData.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-5 text-gray-500">{row.id}</td>
                    <td className="px-6 py-5 font-medium text-gray-700">{row.loadId}</td>
                    <td className="px-6 py-5 font-bold text-gray-900">{row.truck}</td>
                    <td className="px-6 py-5 text-gray-600">{row.bundles}</td>
                    <td className="px-6 py-5 text-gray-500 w-32">
                      <div className="w-min leading-tight">{row.weight.replace(' ', '\n')}</div>
                    </td>
                    <td className="px-6 py-5 text-gray-500">{row.destination}</td>
                    <td className="px-6 py-5 text-gray-500">{row.status}</td>
                    <td className="px-6 py-5">
                      <Button variant="outline" size="icon" className="w-10 h-10 bg-gray-400 border-none text-white hover:bg-gray-500 hover:text-white rounded">
                        <Download className="w-5 h-5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bundle List Table */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-4">Bundle List</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#2a2a2a] text-white">
                <tr>
                  <th className="px-6 py-4 w-16">#</th>
                  <th className="px-6 py-4">Bundle ID</th>
                  <th className="px-6 py-4">Profile</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Length</th>
                  <th className="px-6 py-4 w-32">Unit Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bundleListData.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-5 text-gray-500">{row.id}</td>
                    <td className="px-6 py-5 font-medium text-gray-900">{row.bundleId}</td>
                    <td className="px-6 py-5 text-gray-500">{row.profile}</td>
                    <td className="px-6 py-5 text-gray-500">{row.items}</td>
                    <td className="px-6 py-5 text-gray-500">{row.length}</td>
                    <td className="px-6 py-5 text-gray-500 w-32">
                      <div className="w-min leading-tight">{row.weight.replace(' ', '\n')}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Footer Summary Row */}
            <div className="bg-[#2a2a2a] p-4 flex items-center justify-between text-white">
              <div className="flex items-center">
                <span className="font-bold px-6">Summary</span>
                <div className="flex flex-col ml-8">
                  <span className="font-bold text-sm">Total Bundles: 3</span>
                  <span className="font-bold text-sm">Total Weight: 36,000 lbs</span>
                </div>
              </div>
              <div className="flex gap-4 pr-2">
                <Button variant="secondary" className="bg-[#e5e5e5] hover:bg-[#d4d4d4] text-gray-900 font-bold px-6 border-0 shadow-none">
                  Download PDF
                </Button>
                <Button variant="secondary" className="bg-[#e5e5e5] hover:bg-[#d4d4d4] text-gray-900 font-bold px-6 border-0 shadow-none">
                  Export Excel
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
