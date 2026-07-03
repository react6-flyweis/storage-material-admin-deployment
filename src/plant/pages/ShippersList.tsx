import React, { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Store, Mail, Phone, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const shippersData = [
  {
    id: "VEN-001", name: "Steel Shippers Inc.", contact: "Robert Anderson", email: "robert@steelShippers.com", phone: "(555) 111-2222",
    materials: [{ label: "Steel & Metal", color: "bg-purple-100 text-purple-700" }, { label: "Structural Steel", color: "bg-purple-100 text-purple-700" }],
    ordersActive: 8, ordersTotal: 156, status: "Active", vendorType: "Material Shipper", location: "Dallas Steel Yard", onTime: "92%"
  },
  {
    id: "VEN-002", name: "Concrete Works Ltd.", contact: "Maria Garcia", email: "maria@concreteworks.com", phone: "(555) 222-3333",
    materials: [{ label: "Concrete", color: "bg-purple-100 text-purple-700" }, { label: "Ready Mix", color: "bg-purple-100 text-purple-700" }],
    ordersActive: 5, ordersTotal: 98, status: "Active", vendorType: "Steel Shipper", location: "-", onTime: "88%"
  },
  {
    id: "VEN-003", name: "Lumber & Building Materials Co.", contact: "David Chen", email: "david@lumberbuild.com", phone: "(555) 333-4444",
    materials: [{ label: "Lumber", color: "bg-purple-100 text-purple-700" }, { label: "Wood Products", color: "bg-purple-100 text-purple-700" }],
    ordersActive: 6, ordersTotal: 124, status: "Active", vendorType: "Concrete Shipper", location: "Dallas Steel Yard", onTime: "92%"
  }
];

export default function ShippersList() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#f4f7fb] min-h-screen font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Shippers</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-xl">
          Manage Shipper companies and material vendors
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input type="text" placeholder="Search by vendor, contact, email, or material..." className="pl-9 bg-white" />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="bg-gray-400 text-white hover:bg-gray-500 hover:text-white border-0"
            onClick={() => setIsFilterOpen(true)}
          >
            Filter
          </Button>
          <Button asChild className="bg-[#2563eb] hover:bg-blue-700 text-white">
            <Link to="/plant/shippers/add">
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Link>
          </Button>
        </div>
      </div>

      {/* Table Container - Horizontally Scrollable */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left min-w-[1000px]">
            <thead className="bg-[#eef4fa] text-gray-600 font-bold border-b border-blue-100 text-xs uppercase">
              <tr>
                <th className="px-3 py-3 rounded-tl-xl whitespace-nowrap">VENDOR</th>
                <th className="px-3 py-3 whitespace-nowrap">CONTACT</th>
                <th className="px-3 py-3 whitespace-nowrap">EMAIL</th>
                <th className="px-3 py-3 whitespace-nowrap">PHONE</th>
                <th className="px-3 py-3 whitespace-nowrap">MATERIAL TYPES</th>
                <th className="px-3 py-3 whitespace-nowrap">ORDERS</th>
                <th className="px-3 py-3 whitespace-nowrap">STATUS</th>
                <th className="px-3 py-3 whitespace-nowrap">VENDOR TYPE</th>
                <th className="px-3 py-3 whitespace-nowrap">PICKUP LOCATION</th>
                <th className="px-3 py-3 whitespace-nowrap">ON-TIME DELIVERIES:</th>
                <th className="px-3 py-3 rounded-tr-xl whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {shippersData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm leading-tight">{row.name}</div>
                        <div className="text-gray-400 text-[11px] mt-0.5">{row.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 font-medium text-gray-700">{row.contact}</td>
                  <td className="px-3 py-4">
                    <a href={`mailto:${row.email}`} className="text-blue-500 flex items-center gap-1 hover:underline whitespace-nowrap">
                      <Mail className="w-3 h-3" />
                      {row.email}
                    </a>
                  </td>
                  <td className="px-3 py-4">
                    <a href={`tel:${row.phone}`} className="text-blue-500 flex items-center gap-1 hover:underline whitespace-nowrap">
                      <Phone className="w-3 h-3" />
                      {row.phone}
                    </a>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-col gap-1">
                      {row.materials.map((m, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-semibold w-max ${m.color}`}>
                          {m.label}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 w-max">+1</span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="font-bold text-gray-900 text-sm leading-tight">{row.ordersActive} active</div>
                    <div className="text-gray-400 text-[11px] mt-0.5">{row.ordersTotal} total</div>
                  </td>
                  <td className="px-3 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 font-medium text-gray-700 whitespace-nowrap">{row.vendorType}</td>
                  <td className="px-3 py-4 font-medium text-gray-700 whitespace-nowrap">{row.location}</td>
                  <td className="px-3 py-4 font-medium text-gray-700 whitespace-nowrap">{row.onTime}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2.5">
                      <Link to={`/plant/shippers/${row.id}`} className="text-gray-500 hover:text-gray-900 transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button onClick={() => setIsEditOpen(true)} className="text-blue-500 hover:text-blue-700 transition-colors">
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
