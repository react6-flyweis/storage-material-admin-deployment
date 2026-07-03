import React from "react";
import { Link, useParams } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Filter, CheckCircle2 } from "lucide-react";

const filesData = [
  { id: "SHP-1044", vendor: "ABC Steel", date: "22 Feb 2025", rates: "$2100", weight: "18,500 IBS", status: "File Received" },
  { id: "SHP-1045", vendor: "Steel Works LTD", date: "07 Feb 2025", rates: "$3100", weight: "37,700 IBS", status: "Compared" },
  { id: "SHP-1046", vendor: "Metro Steel", date: "30 Jan 2025", rates: "$7100", weight: "21,400 IBS", status: "Revision Sent" },
  { id: "SHP-1047", vendor: "ABC Steel", date: "17 Jan 2025", rates: "$12100", weight: "18,500 IBS", status: "File Received" },
  { id: "SHP-1048", vendor: "Steel Works LTD", date: "04 Jan 2025", rates: "$4100", weight: "37,700 IBS", status: "Compared" },
  { id: "SHP-1049", vendor: "Metro Steel", date: "09 Dec 2024", rates: "$8100", weight: "21,400 IBS", status: "Order Sent" },
];

const statusStyles: Record<string, string> = {
  "Approved": "border-emerald-200 bg-emerald-100 text-emerald-600",
  "Rejected": "border-rose-200 bg-rose-100 text-rose-500",
  "File Received": "border-amber-200 bg-amber-100 text-amber-600",
  "Compared": "border-green-200 bg-green-100 text-green-600",
  "Order Sent": "border-indigo-200 bg-indigo-100 text-indigo-500",
  "Revision Sent": "border-blue-200 bg-blue-100 text-blue-500",
};

export default function ShipperQuotationProject() {
  const { projectId } = useParams();

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#eef2fa] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Shipper Quotation</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage vendor shipment files and prepare for validation
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input type="text" placeholder="Search" className="pl-9 bg-white" />
          </div>
          <Button variant="outline" className="bg-white text-gray-600 gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px] bg-white text-gray-700">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="File Received">File Received</SelectItem>
            <SelectItem value="Order Sent">Order Sent</SelectItem>
            <SelectItem value="Revision Sent">Revision Sent</SelectItem>
            <SelectItem value="Compared">Compared</SelectItem>
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
                <th className="px-6 py-5">Shipper ⇅</th>
                <th className="px-6 py-5">File Name</th>
                <th className="px-6 py-5">Upload Date ⇅</th>
                <th className="px-6 py-5">Rates ⇅</th>
                <th className="px-6 py-5">Weight ⇅</th>
                <th className="px-6 py-5">File Status</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filesData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-5 text-center">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${row.vendor}`} alt="avatar" />
                      </div>
                      <span className="font-medium text-gray-900">{row.vendor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray-500">{row.id}</td>
                  <td className="px-6 py-5 text-gray-500">{row.date}</td>
                  <td className="px-6 py-5 font-medium text-gray-900">{row.rates}</td>
                  <td className="px-6 py-5 text-gray-500">{row.weight}</td>
                  <td className="px-6 py-5">
                    <Select defaultValue={row.status}>
                      <SelectTrigger className={`h-8 border text-xs font-semibold w-[140px] focus:ring-0 ${statusStyles[row.status] || 'bg-gray-100 text-gray-700'}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 flex items-center gap-2">
                          <Filter className="w-3.5 h-3.5" /> Select Status
                        </div>
                        {Object.entries(statusStyles).map(([status, style]) => (
                          <SelectItem key={status} value={status} className="py-1.5">
                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold w-[120px] ${style}`}>
                              {status}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100 text-gray-700">
                      <Link to={`/plant/shipper-quotation/${projectId || 'PRJ-001'}/file/${row.id}`}>
                        <Eye className="w-5 h-5" />
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
            Row Per Page
            <Select defaultValue="10">
              <SelectTrigger className="w-16 h-8 bg-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
            Entries
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">&lt;</Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">1</Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">2</Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">3</Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 bg-[#f97316] text-white hover:bg-orange-600 hover:text-white rounded-full">4</Button>
            <span className="px-2">...</span>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">15</Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">&gt;</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
