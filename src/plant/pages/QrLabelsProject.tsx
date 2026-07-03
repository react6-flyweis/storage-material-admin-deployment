import React, { useState } from "react";
import { Link, useParams } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, CheckCircle2, QrCode, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const filesData = [
  { bundleId: "BND-101", loadId: "LOAD-101", parts: "STL-4135", weight: "18,500 IBS", length: "20 ft", status: "Printed", statusColor: "border-green-200 text-green-700 bg-green-50" },
  { bundleId: "BND-102", loadId: "LOAD-102", parts: "STL-4135", weight: "37,700 IBS", length: "20 ft", status: "Generated", statusColor: "border-blue-200 text-blue-700 bg-blue-50" },
  { bundleId: "BND-103", loadId: "LOAD-103", parts: "STL-4135", weight: "21,400 IBS", length: "17 ft", status: "Printed", statusColor: "border-green-200 text-green-700 bg-green-50" },
  { bundleId: "BND-104", loadId: "LOAD-104", parts: "STL-4135", weight: "18,500 IBS", length: "20 ft", status: "Generated", statusColor: "border-blue-200 text-blue-700 bg-blue-50" },
  { bundleId: "BND-105", loadId: "LOAD-105", parts: "STL-4135", weight: "37,700 IBS", length: "20 ft", status: "Printed", statusColor: "border-green-200 text-green-700 bg-green-50" },
  { bundleId: "BND-106", loadId: "LOAD-106", parts: "STL-4135", weight: "21,400 IBS", length: "17 ft", status: "Generated", statusColor: "border-blue-200 text-blue-700 bg-blue-50" },
  { bundleId: "BND-107", loadId: "LOAD-107", parts: "STL-4135", weight: "18,500 IBS", length: "20 ft", status: "Printed", statusColor: "border-green-200 text-green-700 bg-green-50" },
  { bundleId: "BND-108", loadId: "LOAD-108", parts: "STL-4135", weight: "37,700 IBS", length: "20 ft", status: "Generated", statusColor: "border-blue-200 text-blue-700 bg-blue-50" },
];

export default function QrLabelsProject() {
  const { projectId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<any>(null);

  const handleView = (bundle: any) => {
    setSelectedBundle(bundle);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#fafafa] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">QR Labels</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Generate, manage, and print QR labels for bundles and pallets to enable tracking and verification across plant and field operations.
          </p>
        </div>
        <Button variant="outline" className="bg-white text-gray-700 shadow-sm border-gray-200 font-semibold">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input type="text" placeholder="Search" className="pl-9 bg-white shadow-sm" />
        </div>
        
        <Select defaultValue="latest">
          <SelectTrigger className="w-[200px] bg-white text-gray-700 font-medium shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="earliest">Sort by : Date(Earliest)</SelectItem>
            <SelectItem value="latest">Sort by : Date(Latest)</SelectItem>
            <SelectItem value="highest">Sort by : Weight (highest first)</SelectItem>
            <SelectItem value="lowest">Sort by : Weight (Lowest first)</SelectItem>
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
                <th className="px-6 py-5">Bundle ID</th>
                <th className="px-6 py-5">Load ID</th>
                <th className="px-6 py-5">Parts ⇅</th>
                <th className="px-6 py-5">Weight ⇅</th>
                <th className="px-6 py-5">Length ⇅</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right w-40"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filesData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-5 text-center">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-5 text-gray-500 font-medium">{row.bundleId}</td>
                  <td className="px-6 py-5 text-gray-500">{row.loadId}</td>
                  <td className="px-6 py-5 font-bold text-gray-900">{row.parts}</td>
                  <td className="px-6 py-5 text-gray-500">{row.weight}</td>
                  <td className="px-6 py-5 text-gray-500">{row.length}</td>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${row.statusColor}`}>
                      {row.status}
                      {row.status === "Printed" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <QrCode className="w-3.5 h-3.5" />}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="bg-[#4f46e5] hover:bg-[#4338ca] text-white h-8 text-xs font-medium rounded shadow-sm"
                        onClick={() => handleView(row)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="bg-[#0d9488] hover:bg-[#0f766e] text-white h-8 text-xs font-medium rounded shadow-sm"
                        onClick={() => handleView(row)}
                      >
                        Print
                      </Button>
                    </div>
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
            <Button variant="outline" size="sm" className="w-8 h-8 p-0 border-[#8b5cf6] text-[#8b5cf6] bg-purple-50 shadow-sm">1</Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">2</Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">3</Button>
            <span className="px-2">...</span>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">15</Button>
            <Button variant="outline" size="sm" className="w-8 h-8 p-0 border-gray-200 text-gray-500">&gt;</Button>
          </div>
        </div>
      </Card>

      {/* QR Code Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-0 rounded-[20px] bg-white shadow-2xl">
          
          <div className="p-8 pb-10">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8 mt-2">QR Code Data</h2>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-10 sm:gap-14 px-4">
              {/* QR Code Graphic Area */}
              <div className="w-48 h-48 bg-gray-50 border border-gray-200 rounded-xl p-3 shadow-inner flex-shrink-0">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Bundle%3A${selectedBundle?.bundleId}`} 
                  alt="QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* QR Data Details */}
              <div className="flex flex-col space-y-3 pt-2">
                <div className="text-[15px]">
                  <span className="font-bold text-gray-900">project={projectId || 'RiversideComplex'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 mr-1">Shipper :</span>
                  <span className="font-medium text-gray-800">shipper=SHP-1044</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 mr-1">Load :</span>
                  <span className="font-medium text-gray-800">load_id={selectedBundle?.loadId || 'LOAD-001'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 mr-1">Bundle :</span>
                  <span className="font-medium text-gray-800">bundle_id={selectedBundle?.bundleId || 'BND-001'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 mr-1">Parts :</span>
                  <span className="font-medium text-gray-800">parts={selectedBundle?.parts?.split('-')[1] || 'STL-B12'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 mr-1">Weight :</span>
                  <span className="font-medium text-gray-800">weight={selectedBundle?.weight?.split(' ')[0]?.replace(',', '') || '3600'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 mr-1">Length :</span>
                  <span className="font-medium text-gray-800">Length={selectedBundle?.length?.split(' ')[0] || '20'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6 mt-12 mb-2">
              <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white h-12 px-8 rounded-lg text-lg font-semibold shadow-md w-40">
                Export PDF
              </Button>
              <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white h-12 px-8 rounded-lg text-lg font-semibold shadow-md w-40">
                Print
              </Button>
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 bg-black hover:bg-gray-800 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
