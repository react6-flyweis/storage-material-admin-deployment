import React from "react";
import { Link, useParams } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, CheckCircle2, Clock } from "lucide-react";

const filesData = [
  { pklId: "PKL-101", loadId: "LOAD-101", truck: "TX-4135", bundles: 5, weight: "18,500 IBS", destination: "Site A", date: "22 Feb 2025", status: "Dispatched", statusColor: "border-green-200 text-green-700 bg-green-50" },
  { pklId: "PKL-102", loadId: "LOAD-102", truck: "TX-4135", bundles: 8, weight: "37,700 IBS", destination: "Site A", date: "07 Feb 2025", status: "Ready", statusColor: "border-blue-200 text-blue-700 bg-blue-50" },
  { pklId: "PKL-103", loadId: "LOAD-103", truck: "TX-4135", bundles: 6, weight: "21,400 IBS", destination: "Site B", date: "30 Jan 2025", status: "Dispatched", statusColor: "border-green-200 text-green-700 bg-green-50" },
  { pklId: "PKL-104", loadId: "LOAD-104", truck: "TX-4135", bundles: 5, weight: "18,500 IBS", destination: "Site A", date: "17 Jan 2025", status: "Ready", statusColor: "border-blue-200 text-blue-700 bg-blue-50" },
  { pklId: "PKL-105", loadId: "LOAD-105", truck: "TX-4135", bundles: 8, weight: "37,700 IBS", destination: "Site A", date: "04 Jan 2025", status: "Dispatched", statusColor: "border-green-200 text-green-700 bg-green-50" },
  { pklId: "PKL-106", loadId: "LOAD-106", truck: "TX-4135", bundles: 6, weight: "21,400 IBS", destination: "Site B", date: "09 Dec 2024", status: "Ready", statusColor: "border-blue-200 text-blue-700 bg-blue-50" },
  { pklId: "PKL-107", loadId: "LOAD-107", truck: "TX-4135", bundles: 3, weight: "18,500 IBS", destination: "Site A", date: "02 Dec 2024", status: "Dispatched", statusColor: "border-green-200 text-green-700 bg-green-50" },
  { pklId: "PKL-108", loadId: "LOAD-108", truck: "TX-4135", bundles: 4, weight: "37,700 IBS", destination: "Site A", date: "15 Nov 2024", status: "Ready", statusColor: "border-blue-200 text-blue-700 bg-blue-50" },
];

export default function PackingListProject() {
  const { projectId } = useParams();

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#fafafa] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Packing List</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            View and manage packing lists generated from load planning for plant loading and shipment verification.
          </p>
        </div>
        <Button variant="outline" className="bg-white text-gray-700 shadow-sm border-gray-200">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input type="text" placeholder="Search" className="pl-9 bg-white" />
        </div>
        
        <Select defaultValue="latest">
          <SelectTrigger className="w-[160px] bg-white text-gray-700 font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Sort by : Latest</SelectItem>
            <SelectItem value="oldest">Sort by : Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-gray-700 font-semibold border-b">
              <tr>
                <th className="px-6 py-5 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-5">Packing ID</th>
                <th className="px-6 py-5">Load ID</th>
                <th className="px-6 py-5">Truck ⇅</th>
                <th className="px-6 py-5">Bundles ⇅</th>
                <th className="px-6 py-5">Weight ⇅</th>
                <th className="px-6 py-5">Destination ⇅</th>
                <th className="px-6 py-5">Date ⇅</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filesData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-5 text-center">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-5 text-gray-500 font-medium">{row.pklId}</td>
                  <td className="px-6 py-5 text-gray-500">{row.loadId}</td>
                  <td className="px-6 py-5 font-bold text-gray-900">{row.truck}</td>
                  <td className="px-6 py-5 font-medium text-gray-900">{row.bundles}</td>
                  <td className="px-6 py-5 text-gray-500">{row.weight}</td>
                  <td className="px-6 py-5 text-gray-500">{row.destination}</td>
                  <td className="px-6 py-5 text-gray-500">{row.date}</td>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${row.statusColor}`}>
                      {row.status}
                      {row.status === "Dispatched" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Button variant="default" size="sm" asChild className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 h-8 text-xs font-medium rounded shadow-sm">
                      <Link to={`/plant/packing-list/${projectId || 'PRJ-001'}/details/${row.pklId}`}>
                        View
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t bg-white flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            Showing
            <Select defaultValue="10">
              <SelectTrigger className="w-16 h-8 bg-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
            Results
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="w-8 h-8 p-0 border-gray-200 text-gray-400">&lt;</Button>
            <Button variant="outline" size="sm" className="w-8 h-8 p-0 border-[#8b5cf6] text-[#8b5cf6] bg-purple-50">1</Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">2</Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">3</Button>
            <span className="px-2">...</span>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">15</Button>
            <Button variant="outline" size="sm" className="w-8 h-8 p-0 border-gray-200 text-gray-500">&gt;</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
