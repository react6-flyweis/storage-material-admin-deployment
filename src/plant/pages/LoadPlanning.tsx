import React from "react";
import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Eye, Filter } from "lucide-react";

const projectsData = [
  { id: "PRJ-001", name: "ABC Warehouse", date: "22 Feb 2025", total: 5 },
  { id: "PRJ-002", name: "Tech Park Dev", date: "07 Feb 2025", total: 3 },
  { id: "PRJ-003", name: "Downtown Plaza", date: "30 Jan 2025", total: 2 },
  { id: "PRJ-004", name: "Riverside Complex", date: "17 Jan 2025", total: 6 },
  { id: "PRJ-005", name: "Tech Park Dev", date: "04 Jan 2025", total: 4 },
  { id: "PRJ-006", name: "Downtown Plaza", date: "09 Dec 2024", total: 8 },
];

export default function LoadPlanning() {
  return (
    <div className="flex-1 space-y-6 p-6 bg-[#fbfbfe] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Load Planning</h1>
          <p className="text-sm text-gray-500 mt-1">
            Plan shipments by uploading shipper data, optimizing bundles, and building truckloads.
          </p>
        </div>
        <Button variant="outline" className="bg-white">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input type="text" placeholder="Search" className="pl-9 bg-white" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px] bg-white">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <SelectValue placeholder="Select Project" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="prj1">Project 1</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-sm border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-gray-700 font-semibold border-b">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-4">Project ID</th>
                <th className="px-6 py-4">Project Name</th>
                <th className="px-6 py-4">File Received ⇅</th>
                <th className="px-6 py-4">Total load planning ⇅</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {projectsData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4 text-gray-600">{row.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{row.name}</td>
                  <td className="px-6 py-4 text-gray-600">{row.date}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{row.total}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100 text-gray-600">
                      <Link to={`/plant/load-planning/${row.id}`}>
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
