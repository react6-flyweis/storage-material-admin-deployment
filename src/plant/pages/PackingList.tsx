import React from "react";
import { Link } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Filter, Download } from "lucide-react";

const projectsData = [
  { id: "PRJ-001", name: "ABC Warehouse", date: "22 Feb 2025", total: 5 },
  { id: "PRJ-002", name: "Tech Park Dev", date: "07 Feb 2025", total: 3 },
  { id: "PRJ-003", name: "Downtown Plaza", date: "30 Jan 2025", total: 2 },
  { id: "PRJ-004", name: "Riverside Complex", date: "17 Jan 2025", total: 6 },
  { id: "PRJ-005", name: "Tech Park Dev", date: "04 Jan 2025", total: 4 },
  { id: "PRJ-006", name: "Downtown Plaza", date: "09 Dec 2024", total: 8 },
];

export default function PackingList() {
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

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input type="text" placeholder="Search" className="pl-9 bg-white" />
        </div>
        
        <Select>
          <SelectTrigger className="w-[180px] bg-white">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <SelectValue placeholder="Select Project" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="abc">ABC Construction</SelectItem>
            <SelectItem value="xyz">XYZ Construction</SelectItem>
            <SelectItem value="pqr">PQR Construction</SelectItem>
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
                <th className="px-6 py-5">Project ID</th>
                <th className="px-6 py-5">Project Name</th>
                <th className="px-6 py-5">List Generated Date ⇅</th>
                <th className="px-6 py-5">Total Packing List ⇅</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {projectsData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-5 text-center">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-5 text-gray-500">{row.id}</td>
                  <td className="px-6 py-5 font-medium text-gray-700">{row.name}</td>
                  <td className="px-6 py-5 text-gray-500">{row.date}</td>
                  <td className="px-6 py-5 font-medium text-gray-900">{row.total}</td>
                  <td className="px-6 py-5 text-right">
                    <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100 text-gray-700">
                      <Link to={`/plant/packing-list/${row.id}`}>
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
