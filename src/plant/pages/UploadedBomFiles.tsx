import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, Filter, Hammer, ShieldCheck, 
  CircleDollarSign, TrendingUp, Check, Lock, AlertCircle 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import UploadBomFileDialog from "@/plant/components/UploadBomFileDialog";

const mockBomFiles = [
  {
    id: "bom-1",
    project: "ABC Warehouse",
    uploadDate: "22 Feb 2025",
    items: 125,
    status: "Pending",
    statusType: "warning",
    checked: false
  },
  {
    id: "bom-2",
    project: "Riya Buildings",
    uploadDate: "07 Feb 2025",
    items: 98,
    status: "Shared to Shippers",
    statusType: "success",
    checked: true
  },
  {
    id: "bom-3",
    project: "ABC Warehouse",
    uploadDate: "30 Jan 2025",
    items: 210,
    status: "Locked",
    statusType: "neutral",
    checked: true
  },
  {
    id: "bom-4",
    project: "Riya Buildings",
    uploadDate: "17 Jan 2025",
    items: 125,
    status: "Locked",
    statusType: "neutral",
    checked: false
  },
  {
    id: "bom-5",
    project: "ABC Warehouse",
    uploadDate: "04 Jan 2025",
    items: 98,
    status: "Locked",
    statusType: "neutral",
    checked: false
  },
  {
    id: "bom-6",
    project: "Riya Buildings",
    uploadDate: "09 Dec 2024",
    items: 210,
    status: "Locked",
    statusType: "neutral",
    checked: false
  }
];

export default function UploadedBomFiles() {
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#eef2fb] min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">Uploaded BOM Files</h1>
        <Button 
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg h-10 px-6 font-medium shadow-sm"
          onClick={() => setIsUploadOpen(true)}
        >
          Upload MBS File
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total BOM Files */}
        <Card className="rounded-xl border-0 shadow-sm bg-[#1e5baf] overflow-hidden text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-blue-100 opacity-90">Total BOM Files</p>
              <h2 className="text-[32px] font-bold mt-1 leading-tight">58 Files</h2>
            </div>
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Hammer className="w-6 h-6 text-[#1e5baf]" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Upload */}
        <Card className="rounded-xl border-0 shadow-sm bg-[#34a853] overflow-hidden text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-green-100 opacity-90">Pending Upload</p>
              <h2 className="text-[32px] font-bold mt-1 leading-tight">12 Files</h2>
            </div>
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#34a853]" />
            </div>
          </CardContent>
        </Card>

        {/* Ready for Shipper */}
        <Card className="rounded-xl border-0 shadow-sm bg-[#fbbc04] overflow-hidden text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-yellow-100 opacity-90">Ready for Shipper</p>
              <h2 className="text-[32px] font-bold mt-1 leading-tight">26 Files</h2>
            </div>
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <CircleDollarSign className="w-6 h-6 text-[#fbbc04]" />
            </div>
          </CardContent>
        </Card>

        {/* Issues Detected */}
        <Card className="rounded-xl border-0 shadow-sm bg-[#ff7a50] overflow-hidden text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-orange-100 opacity-90">Issues Detected</p>
              <h2 className="text-[32px] font-bold mt-1 leading-tight">8 Files</h2>
            </div>
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#ff7a50]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search" 
              className="pl-9 w-[240px] h-10 bg-white border-0 shadow-sm rounded-lg"
            />
          </div>
          <Button variant="outline" className="bg-white border-0 shadow-sm h-10 px-4 rounded-lg text-slate-700 gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
        <div>
          <Select defaultValue="latest">
            <SelectTrigger className="w-[160px] h-10 bg-white border-0 shadow-sm rounded-lg text-slate-700 font-medium">
              <SelectValue placeholder="Sort by : Latest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Sort by : Latest</SelectItem>
              <SelectItem value="oldest">Sort by : Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#f8f9fc] border-b border-slate-100">
                <th className="py-4 pl-6 pr-4 w-12">
                  <Checkbox className="rounded border-slate-300" />
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-slate-900">Project</th>
                <th className="py-4 px-4 text-[13px] font-bold text-slate-900">Upload Date ↑↓</th>
                <th className="py-4 px-4 text-[13px] font-bold text-slate-900">Items ↑↓</th>
                <th className="py-4 px-4 text-[13px] font-bold text-slate-900">File Status</th>
                <th className="py-4 px-6 text-right w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockBomFiles.map((file, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 pl-6 pr-4">
                    <Checkbox 
                      checked={file.checked} 
                      className={`rounded border-slate-300 ${file.checked ? 'bg-[#7c3aed] border-[#7c3aed]' : ''}`} 
                    />
                  </td>
                  <td className="py-5 px-4 text-[14px] text-slate-600 font-medium">{file.project}</td>
                  <td className="py-5 px-4 text-[14px] text-slate-600">{file.uploadDate}</td>
                  <td className="py-5 px-4 text-[14px] text-slate-900 font-medium">{file.items}</td>
                  <td className="py-5 px-4">
                    {file.statusType === 'warning' && (
                      <Badge className="bg-[#fff8e1] hover:bg-[#fff8e1] text-[#f59e0b] border border-[#fde68a] rounded-full px-3 py-1 font-medium text-[12px] gap-1.5">
                        {file.status} <AlertCircle className="w-3 h-3" />
                      </Badge>
                    )}
                    {file.statusType === 'success' && (
                      <Badge className="bg-[#ecfdf5] hover:bg-[#ecfdf5] text-[#10b981] border border-[#a7f3d0] rounded-full px-3 py-1 font-medium text-[12px] gap-1.5">
                        <Check className="w-3 h-3" /> {file.status} <Check className="w-3 h-3" />
                      </Badge>
                    )}
                    {file.statusType === 'neutral' && (
                      <Badge className="bg-[#f1f5f9] hover:bg-[#f1f5f9] text-[#10b981] border border-[#e2e8f0] rounded-full px-3 py-1 font-medium text-[12px] gap-1.5">
                        <Lock className="w-3 h-3 text-slate-400" /> {file.status} <Check className="w-3 h-3" />
                      </Badge>
                    )}
                  </td>
                  <td className="py-5 px-6 text-right">
                    <Button 
                      className="bg-[#3b59df] hover:bg-[#2b41b3] text-white rounded-full h-8 px-5 font-semibold text-xs"
                      onClick={() => navigate(`/plant/uploaded-bom-files/${file.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between mt-6 bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>Row Per Page</span>
          <Select defaultValue="10">
            <SelectTrigger className="w-[70px] h-9 bg-white border border-slate-200">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>Entries</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="w-8 h-8 p-0 text-slate-400 hover:text-slate-900">&lt;</Button>
          <Button variant="ghost" className="w-8 h-8 p-0 text-slate-600 rounded-full hover:bg-slate-100">1</Button>
          <Button variant="ghost" className="w-8 h-8 p-0 text-slate-600 rounded-full hover:bg-slate-100">2</Button>
          <Button variant="ghost" className="w-8 h-8 p-0 text-slate-600 rounded-full hover:bg-slate-100">3</Button>
          <Button variant="default" className="w-8 h-8 p-0 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-full">4</Button>
          <span className="text-slate-400 px-2">...</span>
          <Button variant="ghost" className="w-8 h-8 p-0 text-slate-600 rounded-full hover:bg-slate-100">15</Button>
          <Button variant="ghost" className="w-8 h-8 p-0 text-slate-400 hover:text-slate-900">&gt;</Button>
        </div>
      </div>

      <UploadBomFileDialog 
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
      />
    </div>
  );
}
