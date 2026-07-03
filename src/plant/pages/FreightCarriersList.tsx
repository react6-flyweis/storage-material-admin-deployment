import React, { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Pencil, Trash2, Truck, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FreightCarriersList() {
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const carriersData = [
    {
      id: "CAR-001",
      name: "IronHaul Logistics",
      contact: "James Wilson",
      email: "james@expressfreight.com",
      phone: "(555) 777-8888",
      bidsActive: 4,
      bidsTotal: 89,
      awardedQty: 67,
      awardedRate: "75%",
      avgBid: "$2,850",
      avgBidResponse: "Responds within 45 min",
      status: "Active",
      serviceType: "Freight Transport",
      serviceArea: "Texas, Oklahoma",
      equipmentType: "Flatbed, Dry Van",
    },
    {
      id: "CAR-002",
      name: "Nationwide Logistics",
      contact: "Patricia Davis",
      email: "patricia@nationwidelogistics.com",
      phone: "(555) 888-9999",
      bidsActive: 6,
      bidsTotal: 134,
      awardedQty: 102,
      awardedRate: "76%",
      avgBid: "$3,200",
      avgBidResponse: "Responds within 45 min",
      status: "Active",
      serviceType: "Heavy Material Transport",
      serviceArea: "Texas, Louisiana",
      equipmentType: "Flatbed",
    },
    {
      id: "CAR-003",
      name: "Regional Transport Co.",
      contact: "Carlos Rodriguez",
      email: "carlos@regionaltransport.com",
      phone: "(555) 999-0000",
      bidsActive: 3,
      bidsTotal: 56,
      awardedQty: 42,
      awardedRate: "75%",
      avgBid: "$1,950",
      avgBidResponse: "Responds within 45 min",
      status: "Active",
      serviceType: "Construction Freight",
      serviceArea: "Texas, New Mexico",
      equipmentType: "Dry Van",
    },
    {
      id: "CAR-004",
      name: "Metro Hauling Services",
      contact: "Susan Lee",
      email: "susan@metrohauling.com",
      phone: "(555) 000-1111",
      bidsActive: 2,
      bidsTotal: 45,
      awardedQty: 34,
      awardedRate: "76%",
      avgBid: "$4,100",
      avgBidResponse: "Responds within 45 min",
      status: "Active",
      serviceType: "Steel & Equipment Transport",
      serviceArea: "Multi-State",
      equipmentType: "Flatbed, Heavy Haul",
    },
    {
      id: "CAR-005",
      name: "Highway Express Freight",
      contact: "John Smith",
      email: "john@highwayexpress.com",
      phone: "(555) 123-4567",
      bidsActive: 0,
      bidsTotal: 28,
      awardedQty: 8,
      awardedRate: "29%",
      avgBid: "$1,500",
      avgBidResponse: "Responds within 45 min",
      status: "Inactive",
      serviceType: "Long Distance Freight",
      serviceArea: "Multi-State",
      equipmentType: "Flatbed, Heavy Haul",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#f4f7fb] min-h-screen font-sans">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a] mb-1">Freight Carriers</h1>
        <p className="text-gray-500 text-sm">Manage freight haulers and carriers for bidding</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Search by carrier name, contact, email, or phone..." 
            className="pl-9 bg-white border-gray-200" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="text-white bg-gray-500 hover:bg-gray-600 border-0 rounded-lg flex-1 sm:flex-none"
            onClick={() => setIsFilterOpen(true)}
          >
            Filter
          </Button>
          <Button className="bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg font-medium flex-1 sm:flex-none" asChild>
            <Link to="/plant/freight-carriers/add">
              <span className="text-lg font-bold mr-1 pb-0.5 leading-none">+</span> Add Carrier
            </Link>
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left min-w-[1200px]">
            <thead className="bg-[#eef4fa] text-gray-600 font-bold border-b border-blue-100 text-xs uppercase">
              <tr>
                <th className="px-4 py-4 whitespace-nowrap">CARRIER</th>
                <th className="px-4 py-4 whitespace-nowrap">CONTACT</th>
                <th className="px-4 py-4 whitespace-nowrap">EMAIL</th>
                <th className="px-4 py-4 whitespace-nowrap">PHONE</th>
                <th className="px-4 py-4 whitespace-nowrap">BIDS</th>
                <th className="px-4 py-4 whitespace-nowrap">AWARDED</th>
                <th className="px-4 py-4 whitespace-nowrap">AVG BID</th>
                <th className="px-4 py-4 whitespace-nowrap">STATUS</th>
                <th className="px-4 py-4 whitespace-nowrap">SERVICE TYPE</th>
                <th className="px-4 py-4 whitespace-nowrap">SERVICE AREA</th>
                <th className="px-4 py-4 whitespace-nowrap">EQUIPMENT TYPE</th>
                <th className="px-4 py-4 whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {carriersData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm leading-tight">{row.name}</div>
                        <div className="text-gray-400 text-[11px] mt-0.5">{row.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900 leading-tight">{row.contact.split(" ")[0]}</div>
                    <div className="font-medium text-gray-900 leading-tight">{row.contact.split(" ")[1]}</div>
                  </td>
                  <td className="px-4 py-4">
                    <a href={`mailto:${row.email}`} className="text-blue-500 flex items-center gap-1 hover:underline whitespace-nowrap">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      {row.email}
                    </a>
                  </td>
                  <td className="px-4 py-4">
                    <a href={`tel:${row.phone}`} className="text-blue-500 flex items-center gap-1 hover:underline whitespace-nowrap">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      <div className="flex flex-col text-[11px]">
                        <span>{row.phone.split(" ")[0]}</span>
                        <span>{row.phone.split(" ")[1]}</span>
                      </div>
                    </a>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-900 text-sm leading-tight">{row.bidsActive} <br/>active</div>
                    <div className="text-gray-400 text-[11px] mt-0.5">{row.bidsTotal} total</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-green-600 text-sm leading-tight">{row.awardedQty}</div>
                    <div className="text-gray-400 text-[11px] mt-0.5">{row.awardedRate} win<br/>rate</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-900 text-sm leading-tight">{row.avgBid}</div>
                    <div className="text-gray-400 text-[11px] leading-tight">average</div>
                    <div className="text-gray-400 text-[10px] mt-1 flex items-start gap-1">
                      <span className="mt-1 flex-shrink-0 w-1 h-1 rounded-full bg-gray-400"></span>
                      {row.avgBidResponse}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${row.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-700">
                    <div className="w-[80px]">{row.serviceType}</div>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-700">
                    <div className="w-[80px]">{row.serviceArea}</div>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-700">
                    <div className="w-[80px]">{row.equipmentType}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <Link to={`/plant/freight-carriers/${row.id}`} className="text-gray-500 hover:text-gray-900 transition-colors block">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button 
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        onClick={() => setIsEditOpen(true)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Modal */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="sm:max-w-4xl p-8 rounded-2xl border-0 shadow-xl bg-white">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Filters</h2>
          
          <div className="flex items-center gap-4 mb-6 text-xl font-bold">
            <button className="text-gray-500 hover:text-gray-900"><ChevronLeft className="w-6 h-6" /></button>
            <span>March 2024</span>
            <button className="text-gray-500 hover:text-gray-900"><ChevronRight className="w-6 h-6" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Select><SelectTrigger><SelectValue placeholder="All Deliveries" /></SelectTrigger><SelectContent><SelectItem value="all">All Deliveries</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="Project" /></SelectTrigger><SelectContent><SelectItem value="p1">Project 1</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="Delivery Type" /></SelectTrigger><SelectContent><SelectItem value="dt1">Type 1</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="Color by Status" /></SelectTrigger><SelectContent><SelectItem value="cs1">Color Status</SelectItem></SelectContent></Select>
            
            <Select><SelectTrigger><SelectValue placeholder="Vendor" /></SelectTrigger><SelectContent><SelectItem value="v1">Vendor 1</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="Carrier" /></SelectTrigger><SelectContent><SelectItem value="c1">Carrier 1</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="Site Location" /></SelectTrigger><SelectContent><SelectItem value="s1">Location 1</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent><SelectItem value="pr1">Priority 1</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="Internal Owner" /></SelectTrigger><SelectContent><SelectItem value="io1">Owner 1</SelectItem></SelectContent></Select>
            
            <Select><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="st1">Status 1</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="Delivery" /></SelectTrigger><SelectContent><SelectItem value="d1">Delivery 1</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="Channel" /></SelectTrigger><SelectContent><SelectItem value="ch1">Channel 1</SelectItem></SelectContent></Select>
          </div>

          <div className="flex justify-center mt-8">
            <Button 
              className="bg-[#2563eb] hover:bg-blue-700 text-white h-12 px-10 rounded-full font-semibold text-base w-40"
              onClick={() => setIsFilterOpen(false)}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Freight Career Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] p-6 rounded-2xl border-0 shadow-xl bg-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Freight Career</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Career Name <span className="text-red-500">*</span></label>
              <Input defaultValue="FastFreight Logistics" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Contact / Dispatcher <span className="text-red-500">*</span></label>
              <Input defaultValue="Mike Johnson" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">Email <span className="text-red-500">*</span></label>
                <Input defaultValue="dispatch@fastfreight.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">Phone <span className="text-red-500">*</span></label>
                <Input defaultValue="(555) 234-5678" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Address <span className="text-red-500">*</span></label>
              <Input defaultValue="1234 Industrial Blvd, Austin, TX 78701" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Status <span className="text-red-500">*</span></label>
              <Input defaultValue="" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Notes</label>
              <textarea 
                className="w-full min-h-[100px] text-sm bg-white border border-gray-200 rounded-md p-3" 
                placeholder="Additional notes about this delivery company..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 border-t border-gray-100 pt-6">
            <Button variant="outline" className="text-gray-700 font-medium" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#2563eb] hover:bg-blue-700 text-white font-medium px-8" onClick={() => setIsEditOpen(false)}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
