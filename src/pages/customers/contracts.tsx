import { useState, useMemo } from "react";
import { Search, Eye, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/ui/stat-card";
import { useNavigate } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data - replace with actual API calls
const NAMES = [
  "Luca Moretti",
  "Maria Rossi",
  "Giulia Bianchi",
  "Marco Romano",
  "Elena Greco",
  "Antonio Russo",
  "Francesca Gallo",
  "Davide Ferrari",
  "Sara Conti",
  "Matteo Ricci",
];

function randomFrom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const mockContracts = Array.from({ length: 8 }).map((_, i) => {
  const name = randomFrom(NAMES);
  const statuses = ["Signed", "Pending", "Rejected"];
  const status = randomFrom(statuses);
  const id = `ID-2025-${1047 + i}`;
  const dateOfSignature = "12 April 2026";
  return {
    id,
    customerName: name,
    dateOfSignature,
    status,
  };
});

// const STATUS_COLOR_MAP: Record<string, string> = {
//   signed: "bg-green-50 text-green-700 border-green-200",
//   pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
//   rejected: "bg-red-50 text-red-700 border-red-200",
//   default: "bg-gray-50 text-gray-700 border-gray-200",
// };

// function getStatusClasses(status?: string) {
//   if (!status) return STATUS_COLOR_MAP.default;
//   return STATUS_COLOR_MAP[status.toLowerCase()] || STATUS_COLOR_MAP.default;
// }

export default function ContractsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const filteredContracts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return mockContracts.filter((c) => {
      if (statusFilter !== "all" && c.status.toLowerCase() !== statusFilter) {
        return false;
      }
      if (!q) return true;

      return (
        (c.id && c.id.toLowerCase().includes(q)) ||
        (c.customerName && c.customerName.toLowerCase().includes(q)) ||
        (c.dateOfSignature && c.dateOfSignature.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, statusFilter]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Recent Signed Contract
        </h1>
        <p className="text-gray-500 mt-1">
          Easily view, manage, and track all your customers in one place.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Contracts"
          value="126"
          color="bg-blue-600"
          icon={<Search className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          title="Signed Contract"
          value="48"
          color="bg-green-600"
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          title="Pending Contracts"
          value="15"
          color="bg-yellow-500"
          icon={<Search className="h-5 w-5 text-yellow-600" />}
        />
        <StatCard
          title="Rejected Contracts"
          value="9"
          color="bg-orange-500"
          icon={<XCircle className="h-5 w-5 text-orange-600" />}
        />
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search customer, ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-white">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}

      <Card className="p-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Signature
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract Status
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract, index) => (
                  <tr
                    key={`${contract.id}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contract.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contract.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contract.dateOfSignature}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={getStatusClasses(contract.status)}
                      >
                        {contract.status}
                      </Badge>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() =>
                          navigate(`/customers/contracts/${contract.id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
