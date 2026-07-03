import React from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Filter,
  Download,
  Award,
  Truck,
  CheckCircle2,
  DollarSign,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MOCK_LOADS = [
  {
    id: "LOAD-002",
    requestedDate: "2024-03-16",
    project: "Storage Facility B",
    description: "Roll-up door panels",
    route: { from: "Dallas, TX", to: "San Antonio, TX" },
    dates: { pickup: "2024-03-27", delivery: "2024-03-28" },
    bids: "$12000",
    status: "Awarded",
  },
  {
    id: "LOAD-005",
    requestedDate: "2024-03-16",
    project: "Industrial Complex A",
    description: "Secondary steel beams",
    route: { from: "Houston, TX", to: "Austin, TX" },
    dates: { pickup: "2024-03-28", delivery: "2024-03-29" },
    bids: "$12000",
    status: "Requested",
  },
  {
    id: "LOAD-007",
    requestedDate: "2024-03-16",
    project: "Warehouse Complex",
    description: "Electrical fixtures - bulk",
    route: { from: "San Antonio, TX", to: "Fort Worth, TX" },
    dates: { pickup: "2024-03-30", delivery: "2024-03-31" },
    bids: "$12000",
    status: "Bids Received",
  },
];

export default function FreightLoads() {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Awarded":
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">Awarded</span>;
      case "Requested":
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">Requested</span>;
      case "Bids Received":
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">Bids Received</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">{status}</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Freight Loads</h1>
          <p className="text-gray-500 mt-1">Track all awarded freight loads</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white border-gray-200 shadow-sm h-10 px-4">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" className="bg-white border-gray-200 shadow-sm h-10 px-4">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Awarded */}
        <div className="bg-white rounded-xl p-5 border-2 border-green-500 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-gray-500 text-sm font-medium z-10">Total Awarded</p>
          <div className="flex justify-between items-end z-10">
            <h2 className="text-3xl font-bold text-slate-900">4</h2>
            <Award className="w-8 h-8 text-green-500" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full -z-0 opacity-50" />
        </div>

        {/* In Transit */}
        <div className="bg-white rounded-xl p-5 border-2 border-orange-500 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-gray-500 text-sm font-medium z-10">In Transit</p>
          <div className="flex justify-between items-end z-10">
            <h2 className="text-3xl font-bold text-slate-900">1</h2>
            <Truck className="w-8 h-8 text-orange-500" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-bl-full -z-0 opacity-50" />
        </div>

        {/* Delivered */}
        <div className="bg-white rounded-xl p-5 border-2 border-emerald-400 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-gray-500 text-sm font-medium z-10">Delivered</p>
          <div className="flex justify-between items-end z-10">
            <h2 className="text-3xl font-bold text-slate-900">1</h2>
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full -z-0 opacity-50" />
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-xl p-5 border-2 border-blue-800 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-gray-500 text-sm font-medium z-10">Total Spent</p>
          <div className="flex justify-between items-end z-10">
            <h2 className="text-3xl font-bold text-slate-900">$7,650</h2>
            <DollarSign className="w-8 h-8 text-blue-800" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -z-0 opacity-50" />
        </div>

        {/* Requested Loads */}
        <div className="bg-white rounded-xl p-5 border-2 border-pink-500 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-gray-500 text-sm font-medium z-10">Requested Loads</p>
          <div className="flex justify-between items-end z-10">
            <h2 className="text-3xl font-bold text-slate-900">4</h2>
            <Truck className="w-8 h-8 text-pink-500" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-pink-50 rounded-bl-full -z-0 opacity-50" />
        </div>

        {/* Bids Pending */}
        <div className="bg-white rounded-xl p-5 border-2 border-blue-400 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-gray-500 text-sm font-medium z-10">Bids Pending</p>
          <div className="flex justify-between items-end z-10">
            <h2 className="text-3xl font-bold text-slate-900">0</h2>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -z-0 opacity-50" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search notifications..." 
              className="pl-9 bg-[#F8FAFC] border-none h-11 w-full text-sm"
            />
          </div>
          <Button className="bg-[#4F46E5] hover:bg-indigo-700 text-white h-11 px-8 rounded-lg w-full sm:w-auto">
            Filter
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">REQUEST ID</th>
                <th className="px-6 py-4">PROJECT</th>
                <th className="px-6 py-4">DESCRIPTION</th>
                <th className="px-6 py-4">ROUTE</th>
                <th className="px-6 py-4">DATES</th>
                <th className="px-6 py-4">BIDS</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_LOADS.map((load) => (
                <tr key={load.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-6 align-top">
                    <p className="font-bold text-slate-900 text-sm mb-1">{load.id}</p>
                    <p className="text-xs text-gray-400">Requested:<br/>{load.requestedDate}</p>
                  </td>
                  <td className="px-6 py-6 align-top text-slate-900 font-medium">
                    <div className="max-w-[120px] leading-tight">{load.project}</div>
                  </td>
                  <td className="px-6 py-6 align-top text-gray-500">
                    <div className="max-w-[150px]">{load.description}</div>
                  </td>
                  <td className="px-6 py-6 align-top">
                    <div className="flex flex-col text-xs text-gray-500 space-y-1 max-w-[120px]">
                      <span>{load.route.from}</span>
                      <span className="text-gray-300">↓</span>
                      <span>{load.route.to}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 align-top">
                    <div className="flex flex-col text-xs text-gray-500 space-y-1 max-w-[120px]">
                      <span>Pickup:<br/>{load.dates.pickup}</span>
                      <span>Delivery:<br/>{load.dates.delivery}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 align-top font-semibold text-slate-900">
                    {load.bids}
                  </td>
                  <td className="px-6 py-6 align-top">
                    {getStatusBadge(load.status)}
                  </td>
                  <td className="px-6 py-6 align-top">
                    <Button 
                      variant="outline" 
                      className="bg-white border-gray-200 text-gray-700 h-9 px-4 rounded-md font-medium text-xs shadow-sm hover:bg-gray-50"
                      onClick={() => navigate(`/plant/freight-request-details/${load.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
