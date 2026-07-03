import React, { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Star, MapPin, Mail, Phone, Edit, ChevronDown, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FreightCarrierDetails() {
  const { id } = useParams();
  const [docsOpen, setDocsOpen] = useState(true);

  // Mock data matching the screenshot
  const assignedProjects = [
    { id: "ORD00025", route: "Dallas → Austin", cargo: "Steel Beams", date: "Aug 12", status: "Assigned" },
    { id: "ORD00024", route: "Houston → Dallas", cargo: "Cement", date: "Aug 12", status: "Assigned" },
    { id: "ORD00023", route: "Austin → Houston", cargo: "Iron Rods", date: "Aug 12", status: "Assigned" },
  ];

  const freightHistory = [
    { id: "ORD00025", route: "Dallas → Austin", cargo: "Steel Beams", date: "Aug 12", status: "Delivered" },
    { id: "ORD00024", route: "Houston → Dallas", cargo: "Cement", date: "Aug 12", status: "Delivered" },
    { id: "ORD00023", route: "Austin → Houston", cargo: "Iron Rods", date: "Aug 12", status: "Delivered" },
    { id: "ORD00022", route: "Houston → Dallas", cargo: "Cement", date: "Aug 12", status: "Delivered" },
    { id: "ORD00019", route: "Dallas → Austin", cargo: "Steel Beams", date: "Aug 12", status: "Delivered" },
  ];

  const documents = [
    { name: "Insurance certificate", size: "6.1 MB", type: "PDF", expiry: "Mar 15, 2025" },
    { name: "Material certifications", size: "5.2 MB", type: "PDF", expiry: "Jan 8, 2025" },
    { name: "Contracts", size: "6.1 MB", type: "PDF", expiry: "Mar 15, 2025" },
    { name: "Pricing sheets", size: "6.1 MB", type: "PDF", expiry: "Mar 15, 2025" },
  ];

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 bg-[#f4f7fb] min-h-screen font-sans">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link to="/plant/freight-carriers" className="flex items-center text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-3" />
          Carriers
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column - Main Details */}
        <div className="flex-1 space-y-6">
          
          {/* Main Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 relative">
            {/* Top row with ID and Rating */}
            <div className="flex items-center gap-2 mb-2 text-sm">
              <span className="font-bold text-[#8b5cf6]">{id || "DLV-2051"}</span>
              <div className="flex items-center text-gray-700 font-medium">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                4.7 / 5
              </div>
            </div>

            {/* Title Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">IronHaul Logistics</h1>
                <span className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1.5"></span>
                  Active
                </span>
              </div>
              <Button variant="outline" className="text-gray-700 font-semibold border-gray-200">
                <Edit className="w-4 h-4 mr-2 text-gray-500" />
                Edit Profile
              </Button>
            </div>

            {/* Address */}
            <div className="flex items-center text-gray-500 text-sm mb-8">
              <MapPin className="w-4 h-4 mr-1.5" />
              4712 Cherry Ridge Drive Rochester, NY 14620.
            </div>

            {/* Contact Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#fafafa] rounded-lg p-5 border border-gray-100">
                <div className="flex items-center text-gray-900 font-bold mb-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </div>
                <div className="text-gray-500 text-sm pl-6">john@example.com</div>
              </div>
              <div className="bg-[#fafafa] rounded-lg p-5 border border-gray-100">
                <div className="flex items-center text-gray-900 font-bold mb-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Phone
                </div>
                <div className="text-gray-500 text-sm pl-6">+1 58578 54840</div>
              </div>
              <div className="bg-[#fafafa] rounded-lg p-5 border border-gray-100">
                <div className="flex items-center text-gray-900 font-bold mb-1">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  Website
                </div>
                <div className="text-blue-500 text-sm pl-6 flex items-center">
                  www.example.com
                  <svg className="w-3.5 h-3.5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </div>
              </div>
            </div>

            {/* Performance Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#fafafa] rounded-lg p-5 border border-gray-100">
                <div className="flex items-center text-gray-900 font-bold mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-900 mr-2"></span>
                  Last awarded
                </div>
                <div className="text-gray-500 text-sm pl-3.5">Mar 18, 2026</div>
              </div>
              <div className="bg-[#fafafa] rounded-lg p-5 border border-gray-100">
                <div className="flex items-center text-gray-900 font-bold mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-900 mr-2"></span>
                  Service Category
                </div>
                <div className="text-gray-500 text-sm pl-3.5">Construction Material Transport</div>
              </div>
              <div className="bg-[#fafafa] rounded-lg p-5 border border-gray-100">
                <div className="flex items-center text-gray-900 font-bold mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-900 mr-2"></span>
                  Avg Response Time
                </div>
                <div className="text-gray-500 text-sm pl-3.5">responds within 45 min</div>
              </div>
            </div>

            {/* Fleet & Equipment Details */}
            <div className="bg-[#fafafa] rounded-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Fleet & Equipment Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-gray-200">
                <div>
                  <div className="flex items-center font-bold text-sm text-gray-900 mb-1">
                    <span className="w-1 h-1 rounded-full bg-gray-900 mr-2"></span>
                    Flatbed Trucks
                  </div>
                  <div className="text-gray-500 text-sm pl-3">18</div>
                </div>
                <div>
                  <div className="flex items-center font-bold text-sm text-gray-900 mb-1">
                    <span className="w-1 h-1 rounded-full bg-gray-900 mr-2"></span>
                    Dry Vans
                  </div>
                  <div className="text-gray-500 text-sm pl-3">12</div>
                </div>
                <div>
                  <div className="flex items-center font-bold text-sm text-gray-900 mb-1">
                    <span className="w-1 h-1 rounded-full bg-gray-900 mr-2"></span>
                    Refrigerated Trucks
                  </div>
                  <div className="text-gray-500 text-sm pl-3">5</div>
                </div>
                <div>
                  <div className="flex items-center font-bold text-sm text-gray-900 mb-1">
                    <span className="w-1 h-1 rounded-full bg-gray-900 mr-2"></span>
                    Heavy Haul Trailers
                  </div>
                  <div className="text-gray-500 text-sm pl-3">4</div>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 text-lg mt-6 mb-4">Fleet Capacity</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-2 border-b border-gray-200">
                <div>
                  <div className="flex items-center font-bold text-sm text-gray-900 mb-1">
                    <span className="w-1 h-1 rounded-full bg-gray-900 mr-2"></span>
                    Total Vehicles
                  </div>
                  <div className="text-gray-500 text-sm pl-3">32</div>
                </div>
                <div>
                  <div className="flex items-center font-bold text-sm text-gray-900 mb-1">
                    <span className="w-1 h-1 rounded-full bg-gray-900 mr-2"></span>
                    Maximum Load Capacity
                  </div>
                  <div className="text-gray-500 text-sm pl-3">30 Tons</div>
                </div>
                <div>
                  <div className="flex items-center font-bold text-sm text-gray-900 mb-1">
                    <span className="w-1 h-1 rounded-full bg-gray-900 mr-2"></span>
                    Average Fleet Age
                  </div>
                  <div className="text-gray-500 text-sm pl-3">4.2 Years</div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Assigned Projects Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8">
            <h3 className="font-bold text-gray-900 text-lg mb-6">Assigned Projects</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse border border-gray-200">
                <thead className="bg-[#f8f9fc] text-gray-700 font-bold">
                  <tr>
                    <th className="px-4 py-3 border-b border-gray-200">Freight ID</th>
                    <th className="px-4 py-3 border-b border-gray-200">Route <span className="text-gray-400 font-normal">↑↓</span></th>
                    <th className="px-4 py-3 border-b border-gray-200">Cargo <span className="text-gray-400 font-normal">↑↓</span></th>
                    <th className="px-4 py-3 border-b border-gray-200">Delivery Date <span className="text-gray-400 font-normal">↑↓</span></th>
                    <th className="px-4 py-3 border-b border-gray-200">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignedProjects.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 font-medium">{row.id}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{row.route}</td>
                      <td className="px-4 py-3 text-gray-500">{row.cargo}</td>
                      <td className="px-4 py-3 text-gray-500">{row.date}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                          {row.status}
                          <svg className="w-3 h-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Freight History Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8">
            <h3 className="font-bold text-gray-900 text-lg mb-6">Freight History</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm text-left border-collapse border border-gray-200">
                <thead className="bg-[#f8f9fc] text-gray-700 font-bold">
                  <tr>
                    <th className="px-4 py-3 border-b border-gray-200">Freight ID</th>
                    <th className="px-4 py-3 border-b border-gray-200">Route <span className="text-gray-400 font-normal">↑↓</span></th>
                    <th className="px-4 py-3 border-b border-gray-200">Cargo <span className="text-gray-400 font-normal">↑↓</span></th>
                    <th className="px-4 py-3 border-b border-gray-200">Delivery Date <span className="text-gray-400 font-normal">↑↓</span></th>
                    <th className="px-4 py-3 border-b border-gray-200">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {freightHistory.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 font-medium">
                        {row.id === "ORD00019" ? (
                          <span className="text-blue-500 hover:underline cursor-pointer">{row.id}</span>
                        ) : (
                          row.id
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{row.route}</td>
                      <td className="px-4 py-3 text-gray-500">{row.cargo}</td>
                      <td className="px-4 py-3 text-gray-500">{row.date}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                          {row.status}
                          <svg className="w-3 h-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination controls */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                Showing 
                <select className="border border-gray-300 rounded px-2 py-1 outline-none text-gray-700 bg-white">
                  <option>10</option>
                  <option>20</option>
                </select>
                Results
              </div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-blue-500 text-blue-600 bg-blue-50 font-medium">
                  1
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-transparent text-gray-700 hover:bg-gray-100 font-medium">
                  2
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-transparent text-gray-700 hover:bg-gray-100 font-medium">
                  3
                </button>
                <span className="px-1 text-gray-400">...</span>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-transparent text-gray-700 hover:bg-gray-100 font-medium">
                  8
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-700 hover:bg-gray-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Compliance & Certifications Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-10">
            <div 
              className="p-6 md:p-8 flex items-center justify-between cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors"
              onClick={() => setDocsOpen(!docsOpen)}
            >
              <h3 className="font-bold text-gray-900 text-lg">Compliance & Certifications</h3>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${docsOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {docsOpen && (
              <div className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <div className="font-bold text-gray-900">Total No of Documents : 4</div>
                  <div className="flex items-center gap-3">
                    <select className="border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-700 outline-none bg-white min-w-[150px]">
                      <option>Sort By : Docs Type</option>
                    </select>
                    <div className="relative">
                      <svg className="w-4 h-4 absolute left-3 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      <input type="text" placeholder="Search" className="border border-gray-200 rounded-md pl-9 pr-3 py-1.5 text-sm outline-none w-full sm:w-[200px]" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#eef2f6] text-gray-900 font-bold border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">Name <span className="text-gray-400 font-normal text-xs ml-1">↑↓</span></th>
                        <th className="px-6 py-4">Size</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {documents.map((doc, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center font-bold text-gray-900">
                              <div className="w-6 h-7 bg-red-100 rounded text-red-600 flex items-center justify-center text-[8px] font-black mr-3 shadow-sm border border-red-200">
                                PDF
                              </div>
                              {doc.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{doc.size}</td>
                          <td className="px-6 py-4 text-gray-500">{doc.type}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">{doc.expiry}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column - Sidebars */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          
          {/* Notes Sidebar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Notes</h3>
            </div>
            <div className="p-6 text-sm text-gray-500 leading-relaxed space-y-2">
              <p>Reliable for long-distance steel transport.</p>
              <p>Preferred carrier for Texas routes.</p>
              <p>Fast response time during bidding.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
