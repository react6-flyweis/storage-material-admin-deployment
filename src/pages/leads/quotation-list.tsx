import { useState } from "react";
import { Eye, Download, Upload } from "lucide-react";
import TitleSubtitle from "@/components/TitleSubtitle";
import { Button } from "@/components/ui/button";

interface QuotationItem {
  id: string;
  customer: string;
  project: string;
  status: "Project Converted" | "Rejected" | "Quote sent";
  value: string;
  dateSent: string;
}

const mockQuotations: QuotationItem[] = [
  {
    id: "Q-1023",
    customer: "ABC Corp",
    project: "Warehouse",
    status: "Project Converted",
    value: "$12,500",
    dateSent: "25-01-2025",
  },
  {
    id: "Q-1023",
    customer: "XYZ Ltd",
    project: "Storage",
    status: "Rejected",
    value: "$12,500",
    dateSent: "25-01-2025",
  },
  {
    id: "Q-1023",
    customer: "ABC Corp",
    project: "Warehouse",
    status: "Quote sent",
    value: "$12,500",
    dateSent: "25-01-2025",
  },
  {
    id: "Q-1023",
    customer: "XYZ Ltd",
    project: "Storage",
    status: "Quote sent",
    value: "$12,500",
    dateSent: "25-01-2025",
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  "Project Converted": { bg: "bg-green-100", text: "text-green-700" },
  Rejected: { bg: "bg-orange-100", text: "text-orange-700" },
  "Quote sent": { bg: "bg-purple-100", text: "text-purple-700" },
};

export default function QuotationListPage() {
  const [selectedFilters, setSelectedFilters] = useState({
    buildingType: "",
    projectValue: "",
    status: "",
  });

  const totalQuotations = 24;
  const approvedQuotations = 8;
  const pendingApproval = 12;
  const rejectedQuotations = 5;

  const handleFilterChange = (filterName: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const statBoxes = [
    {
      label: "Total Quotation",
      value: totalQuotations,
      bgColor: "bg-blue-600",
    },
    {
      label: "Approved Quotation",
      value: approvedQuotations,
      bgColor: "bg-green-500",
    },
    {
      label: "Pending Approval",
      value: pendingApproval,
      bgColor: "bg-yellow-400",
    },
    {
      label: "Rejected Quotation",
      value: rejectedQuotations,
      bgColor: "bg-orange-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <TitleSubtitle
          title="Quotation/New Inquiry List"
          subtitle="Manage your assigned leads and track their progress."
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statBoxes.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-lg p-6 text-white shadow-md`}
            >
              <p className="text-sm font-medium opacity-90">{stat.label}</p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button
            className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 flex items-center gap-2"
            size="sm"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <Button
            className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 flex items-center gap-2"
            size="sm"
          >
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Building types
              </label>
              <select
                value={selectedFilters.buildingType}
                onChange={(e) =>
                  handleFilterChange("buildingType", e.target.value)
                }
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="warehouse">Warehouse</option>
                <option value="commercial">Commercial</option>
                <option value="residential">Residential</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Project value
              </label>
              <select
                value={selectedFilters.projectValue}
                onChange={(e) =>
                  handleFilterChange("projectValue", e.target.value)
                }
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="0-10000">$0 - $10,000</option>
                <option value="10000-50000">$10,000 - $50,000</option>
                <option value="50000+">$50,000+</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                All Status
              </label>
              <select
                value={selectedFilters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="converted">Project Converted</option>
                <option value="rejected">Rejected</option>
                <option value="quote-sent">Quote sent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    QUOTE ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    CUSTOMER
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    PROJECT
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    QUOTATION VALUE
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    DATE SENT
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockQuotations.map((quotation, idx) => {
                  const colors = statusColors[quotation.status];
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {quotation.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {quotation.customer}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {quotation.project}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                        >
                          {quotation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {quotation.value}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {quotation.dateSent}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-gray-400 hover:text-gray-600">
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing 1 to {mockQuotations.length} of {totalQuotations} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 hover:bg-gray-100"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 hover:bg-gray-100"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
