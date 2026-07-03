import React from "react";
import { Link, useParams } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, CheckCircle2, Hourglass, PlayCircle } from "lucide-react";

// Mock Data
const loadsData = [
  { id: "LP-2026-001", ref: "SHP-1044", vendor: "ABC Steel", bundles: 5, loads: 2, weight: "18,500 IBS", status: "Completed", date: "22 Feb 2025" },
  { id: "LP-2026-002", ref: "SHP-1045", vendor: "Steel Works LTD", bundles: 8, loads: 3, weight: "37,700 IBS", status: "Planning", date: "07 Feb 2025" },
  { id: "LP-2026-003", ref: "SHP-1046", vendor: "Metro Steel", bundles: 6, loads: 2, weight: "21,400 IBS", status: "Ready", date: "30 Jan 2025" },
  { id: "LP-2026-004", ref: "SHP-1047", vendor: "ABC Steel", bundles: 5, loads: 2, weight: "18,500 IBS", status: "Completed", date: "17 Jan 2025" },
  { id: "LP-2026-005", ref: "SHP-1048", vendor: "Steel Works LTD", bundles: 8, loads: 2, weight: "37,700 IBS", status: "Planning", date: "04 Jan 2025" },
  { id: "LP-2026-006", ref: "SHP-1049", vendor: "Metro Steel", bundles: 6, loads: 3, weight: "21,400 IBS", status: "Ready", date: "09 Dec 2024" },
  { id: "LP-2026-007", ref: "SHP-1050", vendor: "ABC Steel", bundles: 3, loads: 3, weight: "18,500 IBS", status: "Completed", date: "02 Dec 2024" },
  { id: "LP-2026-008", ref: "SHP-1051", vendor: "Steel Works LTD", bundles: 4, loads: 3, weight: "37,700 IBS", status: "Planning", date: "15 Nov 2024" },
  { id: "LP-2026-009", ref: "SHP-1052", vendor: "Metro Steel", bundles: 2, loads: 2, weight: "21,400 IBS", status: "Ready", date: "30 Nov 2024" },
];

export default function LoadPlanningProject() {
  const { projectId } = useParams();

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#fbfbfe] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            Load Planning {projectId ? `- ${projectId}` : ""}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Plan shipments by uploading shipper data, optimizing bundles, and building truckloads.
          </p>
        </div>
        <Button variant="outline" className="bg-white">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex gap-3 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input type="text" placeholder="Search" className="pl-9 bg-white" />
        </div>
      </div>

      <Card className="shadow-sm border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-gray-700 font-semibold border-b">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-4">Load Plan ID</th>
                <th className="px-6 py-4">Shipper Reference</th>
                <th className="px-6 py-4 text-nowrap">Vendor ⇅</th>
                <th className="px-6 py-4 text-nowrap">Bundles ⇅</th>
                <th className="px-6 py-4 text-nowrap">Loads ⇅</th>
                <th className="px-6 py-4 text-nowrap">Weight ⇅</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-nowrap">Date ⇅</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loadsData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{row.id}</td>
                  <td className="px-6 py-4 text-gray-600">{row.ref}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${row.vendor}`} alt="avatar" />
                      </div>
                      <span className="font-semibold text-gray-900">{row.vendor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 text-center">{row.bundles}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 text-center">{row.loads}</td>
                  <td className="px-6 py-4 text-gray-600">{row.weight}</td>
                  <td className="px-6 py-4">
                    {row.status === "Completed" && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border border-green-200 bg-green-50 text-green-700">
                        Completed <CheckCircle2 className="w-3 h-3" />
                      </span>
                    )}
                    {row.status === "Planning" && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border border-yellow-200 bg-yellow-50 text-yellow-700">
                        Planning <Hourglass className="w-3 h-3" />
                      </span>
                    )}
                    {row.status === "Ready" && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700">
                        Ready <PlayCircle className="w-3 h-3" />
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-nowrap">{row.date}</td>
                  <td className="px-6 py-4 text-right">
                    <Button asChild size="sm" className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs h-7 px-3 rounded">
                      <Link to={`/plant/load-planning/${projectId || 'PRJ-001'}/details/${row.id}`}>
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
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">&larr;</Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 border border-blue-600 text-blue-600 rounded bg-blue-50">1</Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">2</Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">3</Button>
            <span className="px-2">...</span>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">15</Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">&rarr;</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
