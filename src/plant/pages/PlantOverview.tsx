import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Download, Calendar as CalendarIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Link } from "react-router";

// Mock Data
const orderProgressData = [
  { name: "Quotation Sent", value: 12, color: "#003f5c" },
  { name: "BOM / Shipper Ready", value: 6, color: "#2f4b7c" },
  { name: "Sent to Shippers", value: 8, color: "#f95d6a" },
  { name: "Load Planned", value: 2, color: "#ff7c43" },
  { name: "Shipped", value: 4, color: "#ffa600" },
];

const loadPlanningData = [
  { name: "In Planning", value: 8, color: "#003f5c" },
  { name: "Planned", value: 4, color: "#2f4b7c" },
  { name: "Ready to Ship", value: 4, color: "#f95d6a" },
  { name: "Dispatched", value: 2, color: "#ff7c43" },
];

const upcomingShipments = [
  {
    orderId: "ORD-9876",
    project: "Warehouse Project",
    shipper: "US Metal Shippers",
    loadPlanId: "LP-2054",
    shipDate: "8 Apr 2026",
    estDelivery: "12 Apr 2026",
    location: "Dallas, TX",
    status: "Ready to Ship",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    orderId: "ORD-9877",
    project: "Plant Expansion",
    shipper: "SteelTrans Logistics",
    loadPlanId: "LP-2055",
    shipDate: "8 Apr 2026",
    estDelivery: "12 Apr 2026",
    location: "Houston, TX",
    status: "In Transit",
    statusColor: "bg-blue-100 text-blue-700",
  },
  {
    orderId: "ORD-9878",
    project: "Logistic Hub",
    shipper: "Prime Freight",
    loadPlanId: "LP-2056",
    shipDate: "8 Apr 2026",
    estDelivery: "12 Apr 2026",
    location: "Phoenix, AZ",
    status: "Scheduled",
    statusColor: "bg-yellow-100 text-yellow-700",
  },
  {
    orderId: "ORD-9879",
    project: "Cold Storage Unit",
    shipper: "US Metal Shippers",
    loadPlanId: "LP-2057",
    shipDate: "8 Apr 2026",
    estDelivery: "12 Apr 2026",
    location: "Denver, CO",
    status: "Scheduled",
    statusColor: "bg-yellow-100 text-yellow-700",
  },
  {
    orderId: "ORD-9880",
    project: "Commercial Complex",
    shipper: "SteelTrans Logistics",
    loadPlanId: "LP-2058",
    shipDate: "8 Apr 2026",
    estDelivery: "12 Apr 2026",
    location: "Austin, TX",
    status: "Scheduled",
    statusColor: "bg-yellow-100 text-yellow-700",
  },
];

export default function PlantOverview() {
  return (
    <div className="flex-1 space-y-6 p-6 bg-[#eff3f8] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            Plant Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time overview of plant operations from quotation to final delivery
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="bg-white gap-2">
            24 Mar 2025 - 31 Mar 2025
            <CalendarIcon className="w-4 h-4 ml-2" />
          </Button>
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px] bg-blue-600 text-white border-blue-600">
              <SelectValue placeholder="All Plants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plants</SelectItem>
              <SelectItem value="plant-1">Plant 1 (Texas)</SelectItem>
              <SelectItem value="plant-2">Plant 2 (Ohio)</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-white gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Top Row: Charts & Missing Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Progress Overview */}
        <Card className="flex flex-col shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Order Progress Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-row items-center justify-center p-4">
            <div className="relative w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderProgressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    stroke="none"
                    dataKey="value"
                  >
                    {orderProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-gray-900">32</span>
                <span className="text-xs text-gray-500">Total Orders</span>
              </div>
            </div>
            <div className="ml-4 flex flex-col gap-2 justify-center">
              {orderProgressData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="font-semibold w-8">{item.value}</span>
                  <span className="text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t justify-center">
            <Button variant="link" className="text-blue-600 h-auto p-0 font-medium" asChild>
              <Link to="/plant/all-deliveries">View All orders</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Load Planning Status */}
        <Card className="flex flex-col shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Load Planning Status</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-row items-center justify-center p-4">
            <div className="relative w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={loadPlanningData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    stroke="none"
                    dataKey="value"
                  >
                    {loadPlanningData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-gray-900">18</span>
                <span className="text-xs text-gray-500">Total Orders</span>
              </div>
            </div>
            <div className="ml-4 flex flex-col gap-2 justify-center">
              {loadPlanningData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="font-semibold w-8">{item.value}</span>
                  <span className="text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t justify-center">
            <Button variant="link" className="text-blue-600 h-auto p-0 font-medium" asChild>
              <Link to="/plant/load-planning">Go to Load Planning</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Missing/Mismatched Items */}
        <Card className="flex flex-col shadow-sm">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base font-bold">Missing/Mismatched Items</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <span className="text-sm text-gray-600">Missing Items from Quote vs Shipper</span>
              <span className="text-lg font-bold text-blue-600">12</span>
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <span className="text-sm text-gray-600">Quantity Mismatches</span>
              <span className="text-lg font-bold text-blue-600">9</span>
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <span className="text-sm text-gray-600">Specification Mismatches</span>
              <span className="text-lg font-bold text-blue-600">4</span>
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <span className="text-sm text-gray-600">Extra Items in Shipper</span>
              <span className="text-lg font-bold text-blue-600">6</span>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-4 justify-center bg-gray-50/50">
            <Button className="w-full bg-gray-400 hover:bg-gray-500 text-white">
              View Mismatch Report
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Middle Row: Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {/* Shipper Quotations */}
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="w-8 h-8 rounded-md bg-orange-100 flex items-center justify-center mb-4 text-orange-600">
              <FileTextIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-900 mb-4">Shipper Quotations</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Requested</span>
                <span className="font-medium text-gray-900">32</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Quoted</span>
                <span className="font-medium text-gray-900">21</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pending</span>
                <span className="font-medium text-gray-900">11</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t text-center">
              <Button variant="link" className="text-blue-600 h-auto p-0 font-medium text-sm" asChild>
                <Link to="/plant/shipper-quotation">View All Quotations</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Packing List */}
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="w-8 h-8 rounded-md bg-orange-100 flex items-center justify-center mb-4 text-orange-600">
              <ListIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-900 mb-4">Packing List</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Generated</span>
                <span className="font-medium text-gray-900">32</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">In Progress</span>
                <span className="font-medium text-gray-900">21</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pending</span>
                <span className="font-medium text-gray-900">11</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t text-center">
              <Button variant="link" className="text-blue-600 h-auto p-0 font-medium text-sm" asChild>
                <Link to="/plant/packing-list">View Packing List</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QR Labels */}
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="w-8 h-8 rounded-md bg-orange-100 flex items-center justify-center mb-4 text-orange-600">
              <QrCodeIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-900 mb-4">QR Labels</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Generated</span>
                <span className="font-medium text-gray-900">32</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">In Progress</span>
                <span className="font-medium text-gray-900">21</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pending</span>
                <span className="font-medium text-gray-900">11</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t text-center">
              <Button variant="link" className="text-blue-600 h-auto p-0 font-medium text-sm" asChild>
                <Link to="/plant/qr-labels">View QR Labels</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shippers */}
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="w-8 h-8 rounded-md bg-orange-100 flex items-center justify-center mb-4 text-orange-600">
              <TruckIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-900 mb-4">Shippers</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active Shippers</span>
                <span className="font-medium text-gray-900">32</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Orders with Shippers</span>
                <span className="font-medium text-gray-900">21</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pending Assignments</span>
                <span className="font-medium text-gray-900">11</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t text-center">
              <Button variant="link" className="text-blue-600 h-auto p-0 font-medium text-sm" asChild>
                <Link to="/plant/shippers">Manage Shippers</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deliveries */}
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="w-8 h-8 rounded-md bg-orange-100 flex items-center justify-center mb-4 text-orange-600">
              <PackageIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-900 mb-4">Deliveries</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Scheduled</span>
                <span className="font-medium text-gray-900">32</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">In Transit</span>
                <span className="font-medium text-gray-900">21</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivered</span>
                <span className="font-medium text-gray-900">11</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t text-center">
              <Button variant="link" className="text-blue-600 h-auto p-0 font-medium text-sm" asChild>
                <Link to="/plant/all-deliveries">View Deliveries</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Table: Upcoming Shipments */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-white pb-4">
          <CardTitle className="text-base font-bold text-gray-900">Upcoming Shipments</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 font-semibold text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Project</th>
                <th className="px-6 py-3">Shipper</th>
                <th className="px-6 py-3 text-nowrap">Load Plan ID ▾</th>
                <th className="px-6 py-3 text-nowrap">Ship Date ▾</th>
                <th className="px-6 py-3 text-nowrap">Est Delivery ▾</th>
                <th className="px-6 py-3 text-nowrap">Delivery Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {upcomingShipments.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{item.orderId}</td>
                  <td className="px-6 py-4 text-gray-500">{item.project}</td>
                  <td className="px-6 py-4 text-gray-500">{item.shipper}</td>
                  <td className="px-6 py-4 text-gray-500">{item.loadPlanId}</td>
                  <td className="px-6 py-4 text-gray-500">{item.shipDate}</td>
                  <td className="px-6 py-4 text-gray-500">{item.estDelivery}</td>
                  <td className="px-6 py-4 text-gray-500">{item.location}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded font-medium text-nowrap ${item.statusColor}`}>
                      • {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button variant="ghost" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium h-8 px-2 gap-1">
                      <Eye className="w-4 h-4" /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CardFooter className="justify-center border-t py-4 bg-white">
          <Button variant="link" className="text-blue-600 font-medium" asChild>
            <Link to="/plant/all-deliveries">View All Shipments / Deliveries</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

function ListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function QrCodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  );
}

function TruckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" />
      <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" />
      <circle cx="7" cy="18" r="2" />
      <path d="M15 18H9" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function PackageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
