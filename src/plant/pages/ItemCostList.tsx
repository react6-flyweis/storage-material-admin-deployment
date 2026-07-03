import React, { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Upload, 
  Settings, 
  Plus,
  Search,
  Filter,
  ChevronDown,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import AddEditPartCostModal from "./modals/AddEditPartCostModal";
import UploadBOMModal from "./modals/UploadBOMModal";

const MOCK_DATA = [
  { id: "1", name: "'30_VRR48'", color: "'-_'", unit: "'FT'", mbsCost: "2.6", marketCost: "-", desc: "'VRR+ Insul R10'" },
  { id: "2", name: "'30_VRR72'", color: "'-_'", unit: "'FT'", mbsCost: "3.9", marketCost: "-", desc: "'VRR+ Insul R10'" },
  { id: "3", name: "'35_VRR48'", color: "'-_'", unit: "'FT'", mbsCost: "2.9", marketCost: "-", desc: "'VRR+ Insul R11'" },
  { id: "4", name: "'35_VRR72'", color: "'-_'", unit: "'FT'", mbsCost: "4.4", marketCost: "-", desc: "'VRR+ Insul R11'" },
  { id: "5", name: "'40_VRR48'", color: "'-_'", unit: "'FT'", mbsCost: "3.3", marketCost: "-", desc: "'VRR+ Insul R13'" },
  { id: "6", name: "'40_VRR72'", color: "'-_'", unit: "'FT'", mbsCost: "4.9", marketCost: "-", desc: "'VRR+ Insul R13'" },
  { id: "7", name: "'60_VRR48'", color: "'-_'", unit: "'FT'", mbsCost: "4.2", marketCost: "-", desc: "'VRR+ Insul R19'" },
  { id: "8", name: "'60_VRR72'", color: "'-_'", unit: "'FT'", mbsCost: "6.3", marketCost: "-", desc: "'VRR+ Insul R19'" },
];

export default function ItemCostList() {
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isUploadBOMOpen, setIsUploadBOMOpen] = useState(false);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsAddEditOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsAddEditOpen(true);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Item Cost List</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200">
            <Upload className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-[#6B7280] hover:bg-gray-600 text-white border-none"
            onClick={() => setIsUploadBOMOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Check BOM Costing
          </Button>
          <Button 
            className="bg-[#8B5CF6] hover:bg-purple-600 text-white border-none"
            onClick={handleAdd}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Item/Part Cost
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#3B82F6] rounded-2xl p-6 text-white flex justify-between items-center shadow-sm">
          <div>
            <p className="text-blue-100 font-medium text-sm mb-1">Total Item Cost</p>
            <h2 className="text-4xl font-bold">$24,400</h2>
          </div>
          <DollarSign className="w-12 h-12 text-blue-200/50" strokeWidth={1.5} />
        </div>
        
        <div className="bg-[#10B981] rounded-2xl p-6 text-white flex justify-between items-center shadow-sm">
          <div>
            <p className="text-emerald-100 font-medium text-sm mb-1">Total Items</p>
            <h2 className="text-4xl font-bold">120</h2>
          </div>
          <TrendingUp className="w-12 h-12 text-emerald-200/50" strokeWidth={1.5} />
        </div>

        <div className="bg-[#F97316] rounded-2xl p-6 text-white flex justify-between items-center shadow-sm">
          <div>
            <p className="text-orange-100 font-medium text-sm mb-1">New Added</p>
            <h2 className="text-4xl font-bold">2</h2>
          </div>
          <FileText className="w-10 h-10 text-orange-200/50" strokeWidth={1.5} />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search" 
              className="pl-9 bg-white border-gray-200 h-10 w-full"
            />
          </div>
          <Button variant="outline" className="bg-white border-gray-200 h-10 px-4">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
        <div className="flex items-center">
          <Button variant="outline" className="bg-white border-gray-200 h-10 text-gray-700 font-normal">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            Sort by : Latest
            <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mt-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Part Cost List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8FAFC] text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-12">
                  <Checkbox className="border-gray-300" />
                </th>
                <th className="px-6 py-4 whitespace-nowrap">Part Name</th>
                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-gray-900">
                  <div className="flex items-center gap-1">
                    Part Colour <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-gray-900">
                  <div className="flex items-center gap-1">
                    Cost Unit <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-gray-900">
                  <div className="flex items-center gap-1">
                    MBS Cost <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-gray-900">
                  <div className="flex items-center gap-1">
                    Current Market Cost <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-gray-900">
                  <div className="flex items-center gap-1">
                    Description <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="px-6 py-4 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DATA.map((item, i) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Checkbox className="border-gray-300" />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-gray-500">{item.color}</td>
                  <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                  <td className="px-6 py-4 text-gray-500">{item.mbsCost}</td>
                  <td className="px-6 py-4 text-gray-500">{item.marketCost}</td>
                  <td className="px-6 py-4 text-gray-500">{item.desc}</td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      size="sm" 
                      className="bg-[#5C5CFF] hover:bg-blue-600 text-white rounded-[4px] h-7 px-4 text-xs font-medium"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddEditPartCostModal 
        isOpen={isAddEditOpen} 
        onClose={() => setIsAddEditOpen(false)} 
        initialData={editingItem} 
      />
      
      <UploadBOMModal 
        isOpen={isUploadBOMOpen} 
        onClose={() => setIsUploadBOMOpen(false)} 
      />
    </div>
  );
}
