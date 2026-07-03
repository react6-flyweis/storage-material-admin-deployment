import React, { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Star, MapPin, Mail, Phone, Edit, ChevronDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShipperDetails() {
  const { id } = useParams();
  const [certOpen, setCertOpen] = useState(true);

  return (
    <div className="flex-1 p-6 bg-[#f4f7fb] min-h-screen font-sans max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link to="/plant/shippers" className="flex items-center text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-3" />
          Vendors
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Content (Main 2/3 column) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-purple-600 font-semibold">{id || "CI-12345"}</span>
              <div className="flex items-center text-sm font-semibold text-gray-700">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                4.7 / 5
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">Robert George</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                    Active
                  </span>
                </div>
                <div className="text-gray-500 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  4712 Cherry Ridge Drive Rochester, NY 14620.
                </div>
              </div>
              
              <Button variant="outline" className="border-gray-200 text-gray-700 font-medium">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            
            {/* Inner Info Cards */}
            <div className="mt-6 space-y-4">
              
              {/* Contact Card */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-5 flex flex-col sm:flex-row gap-6 sm:gap-16">
                <div>
                  <div className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-1">
                    <Mail className="w-4 h-4 text-gray-400" /> Email Address
                  </div>
                  <div className="text-gray-500 text-sm ml-6">john@example.com</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-1">
                    <Phone className="w-4 h-4 text-gray-400" /> Phone
                  </div>
                  <div className="text-gray-500 text-sm ml-6">+1 58578 54840</div>
                </div>
              </div>

              {/* Categorization Card */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-1">
                    <span className="w-1 h-1 bg-black rounded-full"></span> Vendor Type
                  </div>
                  <div className="text-gray-500 text-sm ml-3">Material Shipper</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-1">
                    <span className="w-1 h-1 bg-black rounded-full"></span> Service Category
                  </div>
                  <div className="text-gray-500 text-sm ml-3">Construction Materials</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-1">
                    <span className="w-1 h-1 bg-black rounded-full"></span> Years Working With Company
                  </div>
                  <div className="text-gray-500 text-sm ml-3">3 Years</div>
                </div>
              </div>

              {/* Metrics Card */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-5 grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div>
                  <div className="font-bold text-gray-900 text-xs mb-1">Total Orders</div>
                  <div className="text-gray-600 text-sm">142</div>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-xs mb-1">Completed Deliveries</div>
                  <div className="text-gray-600 text-sm">138</div>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-xs mb-1">Active Orders</div>
                  <div className="text-gray-600 text-sm">4</div>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-xs mb-1">Average Delivery Time</div>
                  <div className="text-gray-600 text-sm">2.4 Days</div>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-xs mb-1">On-time Delivery Rate</div>
                  <div className="text-gray-600 text-sm">95%</div>
                </div>
              </div>

            </div>
          </div>

          {/* Order / Purchase History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Order / Purchase History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f8fafc] text-gray-900 font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Material ↑↓</th>
                    <th className="px-6 py-3">Quantity ↑↓</th>
                    <th className="px-6 py-3">Order Value ↑↓</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { id: "ORD00025", mat: "Steel Beams", qty: "20 Tons", val: "$5,000", stat: "Delivered", color: "text-green-600 bg-green-50" },
                    { id: "ORD00024", mat: "Cement Bags", qty: "500 Units", val: "$10,750", stat: "In Transit", color: "text-purple-600 bg-purple-50" },
                    { id: "ORD00023", mat: "Iron Rods", qty: "12 Tons", val: "$20,000", stat: "Delivered", color: "text-green-600 bg-green-50" },
                    { id: "ORD00022", mat: "Cement Bags", qty: "500 Units", val: "$50,000", stat: "Delivered", color: "text-green-600 bg-green-50" },
                    { id: "ORD00019", mat: "Iron Rods", qty: "20 Tons", val: "$1,25,000", stat: "Delivered", color: "text-green-600 bg-green-50", link: true },
                  ].map((order, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className={`px-6 py-4 font-medium ${order.link ? "text-blue-500 underline" : "text-gray-500"}`}>{order.id}</td>
                      <td className="px-6 py-4 text-gray-700">{order.mat}</td>
                      <td className="px-6 py-4 text-gray-500">{order.qty}</td>
                      <td className="px-6 py-4 text-gray-500">{order.val}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center w-max gap-1 ${order.color}`}>
                          {order.stat}
                          {order.stat === "Delivered" ? <span className="w-1.5 h-1.5 rounded-full bg-green-600 ml-1"></span> : <span className="w-1.5 h-1.5 rounded-full bg-purple-600 ml-1"></span>}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                Showing 
                <select className="border rounded p-1"><option>10</option></select>
                Results
              </div>
              <div className="flex gap-1">
                <button className="px-2 py-1 border rounded bg-gray-50">&larr;</button>
                <button className="px-3 py-1 border rounded bg-purple-100 text-purple-700 font-medium">1</button>
                <button className="px-3 py-1 border rounded">2</button>
                <button className="px-3 py-1 border rounded">3</button>
                <span className="px-2 py-1">...</span>
                <button className="px-3 py-1 border rounded">8</button>
                <button className="px-2 py-1 border rounded bg-gray-50">&rarr;</button>
              </div>
            </div>
          </div>

          {/* Compliance & Certifications Accordion */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div 
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => setCertOpen(!certOpen)}
            >
              <h2 className="text-lg font-bold text-gray-900">Compliance & Certifications</h2>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${certOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {certOpen && (
              <div className="border-t border-gray-100">
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                  <div className="font-bold text-gray-900">Total No of Documents : 4</div>
                  <div className="flex gap-3">
                    <select className="border rounded-md px-3 py-1.5 text-sm text-gray-600">
                      <option>Sort By : Docs Type</option>
                    </select>
                    <input type="text" placeholder="Search" className="border rounded-md px-3 py-1.5 text-sm w-48" />
                  </div>
                </div>
                
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#eef2f6] text-gray-900 font-bold border-y border-gray-200">
                    <tr>
                      <th className="px-6 py-3">Name ↑↓</th>
                      <th className="px-6 py-3">Size</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { name: "Insurance certificate", size: "6.1 MB", date: "Mar 15, 2025" },
                      { name: "Material certifications", size: "5.2 MB", date: "Jan 8, 2025" },
                      { name: "Contracts", size: "6.1 MB", date: "Mar 15, 2025" },
                      { name: "Pricing sheets", size: "6.1 MB", date: "Mar 15, 2025" },
                    ].map((doc, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center font-bold text-[10px]">PDF</div>
                          {doc.name}
                        </td>
                        <td className="px-6 py-4 text-gray-500">{doc.size}</td>
                        <td className="px-6 py-4 text-gray-500">PDF</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{doc.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar (1/3 column) */}
        <div className="space-y-6">
          
          {/* Notes Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Notes</h3>
            <div className="w-full h-px bg-gray-100 mb-4"></div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Keep in mind that in order to be deductible, your employees' pay must be reasonable and necessary for conducting business to qualify for...
            </p>
          </div>

          {/* Contact Roles Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Vendor Contact Roles</h3>
            <div className="w-full h-px bg-gray-100 mb-6"></div>
            
            <div className="space-y-6">
              <div>
                <div className="font-bold text-gray-900 text-sm mb-1">Sales Rep</div>
                <div className="text-gray-500 text-sm mb-0.5">John Doe</div>
                <div className="text-gray-500 text-sm">+1 58578 54840</div>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm mb-1">Dispatch</div>
                <div className="text-gray-500 text-sm mb-0.5">Riyaz Khan</div>
                <div className="text-gray-500 text-sm">+1 58578 54840</div>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm mb-1">Accounts</div>
                <div className="text-gray-500 text-sm mb-0.5">Sir John Peds</div>
                <div className="text-gray-500 text-sm">+1 58578 54840</div>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm mb-1">Warehouse Manager</div>
                <div className="text-gray-500 text-sm mb-0.5">John Doe</div>
                <div className="text-gray-500 text-sm">+1 58578 54840</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
