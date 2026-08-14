import React, { useState } from "react";
import {
  TrendingUp,
  FileText,
  Search,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface SavingsRow {
  id: string;
  projectName: string;
  smdtCost: string;
  actualCost: string;
  savings: string;
  profitLoss: "Profit" | "Loss";
  savingsPercent: string;
  status: "Good" | "Over Budget";
}

const mockSavingsData: SavingsRow[] = [
  {
    id: "1",
    projectName: "Warehouse Expansion",
    smdtCost: "$24,500",
    actualCost: "$22,900",
    savings: "$1,600",
    profitLoss: "Profit",
    savingsPercent: "6.5%",
    status: "Good",
  },
  {
    id: "2",
    projectName: "Steel Building A",
    smdtCost: "$18,200",
    actualCost: "$19,100",
    savings: "-$900",
    profitLoss: "Loss",
    savingsPercent: "-4.9%",
    status: "Over Budget",
  },
  {
    id: "3",
    projectName: "Industrial Shed B",
    smdtCost: "$32,000",
    actualCost: "$29,750",
    savings: "$2,250",
    profitLoss: "Profit",
    savingsPercent: "7.0%",
    status: "Good",
  },
  {
    id: "4",
    projectName: "Logistics Center",
    smdtCost: "$15,800",
    actualCost: "$15,500",
    savings: "$300",
    profitLoss: "Profit",
    savingsPercent: "1.9%",
    status: "Good",
  },
  {
    id: "5",
    projectName: "Commercial Project C",
    smdtCost: "$40,000",
    actualCost: "$42,400",
    savings: "-$2,400",
    profitLoss: "Loss",
    savingsPercent: "-6.0%",
    status: "Over Budget",
  },
  {
    id: "6",
    projectName: "Warehouse Expansion",
    smdtCost: "$24,500",
    actualCost: "$22,900",
    savings: "$1,600",
    profitLoss: "Profit",
    savingsPercent: "6.5%",
    status: "Good",
  },
  {
    id: "7",
    projectName: "Warehouse Expansion",
    smdtCost: "$24,500",
    actualCost: "$22,900",
    savings: "$1,600",
    profitLoss: "Profit",
    savingsPercent: "6.5%",
    status: "Good",
  },
];

export default function Savings() {
  const [searchTerm, setSearchTerm] = useState("");
  const dateFilter = "12 April 2026";
  const statusFilter = "Good";

  const filteredData = mockSavingsData.filter((item) =>
    item.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 bg-[#eef2fd] min-h-screen text-slate-800 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Savings</h1>
        <Button
          variant="outline"
          className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export
        </Button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Total Savings Card */}
        <div className="bg-[#00c853] text-white p-6 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-sm font-medium text-white/90">Total Savings This Month</p>
            <h2 className="text-3xl font-bold mt-2">$12,897</h2>
          </div>
          <div className="w-12 h-12 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Total Loss Card */}
        <div className="bg-[#ff5722] text-white p-6 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-sm font-medium text-white/90">Total Loss This Month</p>
            <h2 className="text-3xl font-bold mt-2">$2398</h2>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <InputGroup className="w-full sm:w-80 bg-white border-none shadow-sm rounded-xl h-10 px-1">
          <InputGroupAddon align="inline-start">
            <Search className="w-4 h-4 text-slate-400" />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm font-medium text-slate-700 placeholder:text-slate-400"
          />
        </InputGroup>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Date Filter Dropdown */}
          <div className="bg-white rounded-xl shadow-sm px-4 py-2 text-sm font-medium text-slate-700 flex items-center gap-2 cursor-pointer border border-transparent hover:border-slate-200">
            <ChevronDown className="w-4 h-4 text-slate-500" />
            <span>{dateFilter}</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>

          {/* Status Filter Dropdown */}
          <div className="bg-white rounded-xl shadow-sm px-4 py-2 text-sm font-medium text-slate-700 flex items-center gap-2 cursor-pointer border border-transparent hover:border-slate-200">
            <ChevronDown className="w-4 h-4 text-slate-500" />
            <span>Status : {statusFilter}</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Savings List Table Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Savings List</h3>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-800">
                  <th className="py-4 px-6">Project Name</th>
                  <th className="py-4 px-6">SMDT Cost</th>
                  <th className="py-4 px-6">
                    <div className="flex items-center gap-1">
                      Actual Cost
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-4 px-6">Savings</th>
                  <th className="py-4 px-6">Profit / Loss</th>
                  <th className="py-4 px-6">Savings %</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">{row.projectName}</td>
                    <td className="py-4 px-6">{row.smdtCost}</td>
                    <td className="py-4 px-6">{row.actualCost}</td>
                    <td className="py-4 px-6">{row.savings}</td>
                    <td className="py-4 px-6">
                      <span
                        className={
                          row.profitLoss === "Profit"
                            ? "text-[#00c853] font-semibold"
                            : "text-[#ff3d00] font-semibold"
                        }
                      >
                        {row.profitLoss}
                      </span>
                    </td>
                    <td className="py-4 px-6">{row.savingsPercent}</td>
                    <td className="py-4 px-6">
                      {row.status === "Good" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#00c853] text-white">
                          Good
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#ff3d00] text-white">
                          Over Budget
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span>Row Per Page</span>
            <div className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-slate-700 flex items-center gap-2">
              <span>10</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span>Entries</span>
          </div>

          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 font-medium hover:bg-white">
              1
            </button>
            <button className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 font-medium hover:bg-white">
              2
            </button>
            <button className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 font-medium hover:bg-white">
              3
            </button>
            <button className="w-7 h-7 rounded-full flex items-center justify-center bg-[#ff9800] text-white font-medium shadow-xs">
              4
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 font-medium hover:bg-white">
              15
            </button>
            <button className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-white">
              20
            </button>
            <button className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
