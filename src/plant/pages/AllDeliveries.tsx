import React, { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Search,
  SlidersHorizontal,
  Download,
  MoreHorizontal,
  FileText,
  Truck,
  CalendarDays,
  CheckCircle2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Phone,
  Mail,
} from "lucide-react";

// Mock Data
const deliveriesData = [
  {
    id: "DEL-1012",
    priority: "Normal",
    status: "Delay",
    dateStr: "Apr 1, 2026",
    timeStr: "07:30 - 11:30",
    item: "Steel Frame - Primary frame set",
    project: "ABC Logistics Warehouse",
    customer: "Austin McClume",
    vendor: "Roof Masters Ltd.",
    carrier: "Rapid Delivery Services",
    pocName: "John Smith",
    pocPhone: "0987654321",
    pocEmail: "0987654321", // Using as email per mockup visual
    equipment: "5,000 lb forklift",
    location: "Austin Warehouse - Austin TX",
  },
  {
    id: "DEL-1010",
    priority: "High",
    status: "Delay",
    dateStr: "Mar 31, 2026",
    timeStr: "11:00 - 15:00",
    item: "Doors - Roll-up doors",
    project: "Metro Cast Factory",
    customer: "Sarah Williams",
    vendor: "Climate Control Inc.",
    carrier: "FastFreight Logistics",
    pocName: "John Smith",
    pocPhone: "0987654321",
    pocEmail: "0987654321",
    equipment: "Crane required",
    location: "Austin Warehouse - Austin TX",
  },
  {
    id: "DEL-1008",
    priority: "Critical",
    status: "Delivered",
    dateStr: "Mar 30, 2026",
    timeStr: "10:00 - 14:00",
    item: "Steel Frame - Primary frame set",
    project: "Warehouse Phase 2",
    customer: "David Martinez",
    vendor: "Panel Systems Inc.",
    carrier: "Premier Transport Co.",
    pocName: "John Smith",
    pocPhone: "0987654321",
    pocEmail: "0987654321",
    equipment: "Pallet jack",
    location: "Austin Warehouse - Austin TX",
  },
  {
    id: "DEL-1007",
    priority: "Normal",
    status: "Delay",
    dateStr: "Mar 29, 2026",
    timeStr: "08:00 - 11:00",
    item: "Doors - Roll-up doors",
    project: "Storage Facility B",
    customer: "Patricia Davis",
    vendor: "Fastener Wholesale",
    carrier: "FastFreight Logistics",
    pocName: "John Smith",
    pocPhone: "0987654321",
    pocEmail: "0987654321",
    equipment: "None",
    location: "Austin Warehouse - Austin TX",
  },
];

const toggleColumns = ["Project", "Customer", "Vendor", "Carrier", "POC", "Date"];

export default function AllDeliveries() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // State for toggling columns (functional mockup)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    Project: true,
    Customer: true,
    Vendor: true,
    Carrier: true,
    POC: true,
    Date: true,
  });

  const toggleColumn = (col: string) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#f8fafc] min-h-screen font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
          All Deliveries
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Comprehensive delivery management and tracking
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Draft</p>
              <h3 className="text-2xl font-bold text-[#eab308] mt-1">1</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#fef9c3] flex items-center justify-center text-[#eab308]">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">12</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <Truck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Scheduled</p>
              <h3 className="text-2xl font-bold text-[#3b82f6] mt-1">4</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#dbeafe] flex items-center justify-center text-[#3b82f6]">
              <CalendarDays className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Confirmed</p>
              <h3 className="text-2xl font-bold text-[#22c55e] mt-1">3</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#22c55e]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">In Transit</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">3</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <Truck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Delivered</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">2</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Delayed</p>
              <h3 className="text-2xl font-bold text-[#ef4444] mt-1">1</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#fee2e2] flex items-center justify-center text-[#ef4444]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Cancelled</p>
              <h3 className="text-2xl font-bold text-[#ef4444] mt-1">1</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#fee2e2] flex items-center justify-center text-[#ef4444]">
              <XCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar & Filters */}
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by ID, project, customer, item..."
                  className="pl-9 bg-white border-gray-200 h-10"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px] bg-white border-gray-200 h-10">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="delay">Delay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                className={`border-gray-200 h-10 transition-colors ${showAdvancedFilters ? "border-blue-600 text-blue-600 bg-blue-50" : "text-blue-600"}`}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
              <Button variant="outline" className="bg-white border-green-600 text-green-600 hover:bg-green-50 h-10">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {showAdvancedFilters && (
            <div className="pt-4 border-t mt-2 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                {/* Row 1 */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Date From</label>
                  <Input type="text" placeholder="DD/MM/YYYY" className="h-10 border-gray-200" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Date To</label>
                  <Input type="text" placeholder="DD/MM/YYYY" className="h-10 border-gray-200" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Project</label>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-10 border-gray-200">
                      <SelectValue placeholder="All Project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Project</SelectItem>
                      <SelectItem value="p1">Project 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Customer</label>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-10 border-gray-200">
                      <SelectValue placeholder="All Customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customer</SelectItem>
                      <SelectItem value="c1">Customer 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 2 */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Vendor</label>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-10 border-gray-200">
                      <SelectValue placeholder="All Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Delivery Company</label>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-10 border-gray-200">
                      <SelectValue placeholder="All Carriers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Carriers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Material Category</label>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-10 border-gray-200">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="hidden lg:block"></div>

                {/* Row 3 */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Equipment Required</label>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-10 border-gray-200">
                      <SelectValue placeholder="All Equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Status</label>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-10 border-gray-200">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Internal Owner</label>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-10 border-gray-200">
                      <SelectValue placeholder="All Internal Owner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Internal Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full h-10 bg-white border-gray-200 text-gray-900 font-semibold gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination & Column Toggles */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">1</span> to{" "}
          <span className="font-semibold text-gray-900">10</span> of{" "}
          <span className="font-semibold text-gray-900">12</span> deliveries
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            Items per page:
            <Select defaultValue="10">
              <SelectTrigger className="w-20 bg-white border-gray-200 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {toggleColumns.map((col) => (
              <label
                key={col}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700 shadow-sm"
              >
                <input 
                  type="checkbox" 
                  checked={visibleColumns[col]}
                  onChange={() => toggleColumn(col)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" 
                />
                {col}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <Card className="shadow-sm border-gray-100 overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#e2e8f0]/50 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 whitespace-nowrap">ID ⇅</th>
                <th className="px-4 py-4 whitespace-nowrap">Status ⇅</th>
                <th className="px-4 py-4 whitespace-nowrap">Delivery Date-Time</th>
                <th className="px-4 py-4 whitespace-nowrap min-w-[150px]">Date & Time ⇅</th>
                {visibleColumns.Project && <th className="px-4 py-4 whitespace-nowrap">Project ⇅</th>}
                {visibleColumns.Customer && <th className="px-4 py-4 whitespace-nowrap">Customer ⇅</th>}
                {visibleColumns.Vendor && <th className="px-4 py-4 whitespace-nowrap">Vendor</th>}
                {visibleColumns.Carrier && <th className="px-4 py-4 whitespace-nowrap">Carrier</th>}
                {visibleColumns.POC && <th className="px-4 py-4 whitespace-nowrap">POC</th>}
                <th className="px-4 py-4 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {deliveriesData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-4 align-top">
                    <div className="font-bold text-blue-600">{row.id}</div>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-medium ${
                        row.priority === "Critical"
                          ? "bg-orange-100 text-orange-700"
                          : row.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {row.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-semibold whitespace-nowrap ${
                        row.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {row.status === "Delivered" ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <CalendarDays className="w-3.5 h-3.5" />
                      )}
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="font-bold text-gray-900">{row.dateStr}</div>
                    <div className="text-gray-500 mt-0.5">{row.timeStr}</div>
                  </td>
                  <td className="px-4 py-4 align-top max-w-[200px]">
                    <div className="text-gray-900 font-medium break-words leading-tight">
                      {row.item}
                    </div>
                  </td>
                  {visibleColumns.Project && (
                    <td className="px-4 py-4 align-top text-gray-600 max-w-[150px] truncate">
                      {row.project}
                    </td>
                  )}
                  {visibleColumns.Customer && (
                    <td className="px-4 py-4 align-top text-gray-600 max-w-[120px] truncate">
                      {row.customer}
                    </td>
                  )}
                  {visibleColumns.Vendor && (
                    <td className="px-4 py-4 align-top text-gray-600 max-w-[120px] truncate">
                      {row.vendor}
                    </td>
                  )}
                  {visibleColumns.Carrier && (
                    <td className="px-4 py-4 align-top text-gray-600 max-w-[120px] truncate">
                      {row.carrier}
                    </td>
                  )}
                  {visibleColumns.POC && (
                    <td className="px-4 py-4 align-top">
                      <div className="font-medium text-gray-900">POC</div>
                      <div className="font-medium text-gray-900">{row.pocName}</div>
                      <div className="flex items-center gap-1.5 text-gray-500 mt-1 text-xs">
                        <Phone className="w-3 h-3 text-blue-500" />
                        {row.pocPhone}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 mt-0.5 text-xs">
                        <Mail className="w-3 h-3 text-blue-500" />
                        {row.pocEmail}
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-4 align-top text-center relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === row.id ? null : row.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    
                    {/* Custom Dropdown Menu positioned absolutely to avoid table cell clipping */}
                    {activeMenu === row.id && (
                      <div 
                        className="absolute right-8 top-10 z-50 w-40 bg-white border border-gray-100 shadow-xl rounded-xl p-2 flex flex-col gap-1.5"
                        onMouseLeave={() => setActiveMenu(null)}
                      >
                        <Button size="sm" className="w-full bg-[#2563eb] hover:bg-blue-700 text-white rounded-md h-8 text-xs font-medium justify-center">
                          View
                        </Button>
                        <Button size="sm" className="w-full bg-[#f97316] hover:bg-orange-600 text-white rounded-md h-8 text-xs font-medium justify-center">
                          Edit
                        </Button>
                        <Button size="sm" className="w-full bg-[#06b6d4] hover:bg-cyan-600 text-white rounded-md h-8 text-xs font-medium justify-center">
                          Reschedule
                        </Button>
                        <Button size="sm" className="w-full bg-[#22c55e] hover:bg-green-600 text-white rounded-md h-8 text-xs font-medium justify-center">
                          Mark Delivered
                        </Button>
                        <Button size="sm" className="w-full bg-[#fef08a] hover:bg-yellow-300 text-yellow-800 rounded-md h-8 text-xs font-medium justify-center">
                          Send Reminder
                        </Button>
                        <Button size="sm" className="w-full bg-[#bfdbfe] hover:bg-blue-300 text-blue-800 rounded-md h-8 text-xs font-medium justify-center">
                          Assign owner
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
