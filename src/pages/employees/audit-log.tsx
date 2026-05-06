import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const auditRows = [
  {
    id: 1,
    name: "Sarah Johnson",
    initials: "SJ",
    role: "Manager",
    panel: "Sales",
    status: "Active",
    activity: "Proposal sent to BuildTech Corp",
    timestamp: "03/06/2025 10.42 AM",
    roleClasses: "bg-blue-100 text-blue-700",
  },
  {
    id: 2,
    name: "John Kingston",
    initials: "JK",
    role: "Employee",
    panel: "Plant",
    status: "Active",
    activity: "Proposal sent to BuildTech Corp",
    timestamp: "03/06/2025 10.42 AM",
    roleClasses: "bg-emerald-100 text-emerald-700",
  },
  {
    id: 3,
    name: "Joseph Tribbiani",
    initials: "JT",
    role: "Admin",
    panel: "Support",
    status: "Active",
    activity: "Proposal sent to BuildTech Corp",
    timestamp: "03/06/2025 10.42 AM",
    roleClasses: "bg-rose-100 text-rose-700",
  },
  {
    id: 4,
    name: "Michael Chen",
    initials: "MC",
    role: "Manager",
    panel: "Construction",
    status: "Active",
    activity: "Proposal sent to BuildTech Corp",
    timestamp: "03/06/2025 10.42 AM",
    roleClasses: "bg-blue-100 text-blue-700",
  },
  {
    id: 5,
    name: "David Ken",
    initials: "DK",
    role: "Employee",
    panel: "Accounts",
    status: "Active",
    activity: "Lead moved to Proposal: ABC Steel Works",
    timestamp: "03/06/2025 10.42 AM",
    roleClasses: "bg-emerald-100 text-emerald-700",
  },
  {
    id: 6,
    name: "Sarah Johnson",
    initials: "SJ",
    role: "Manager",
    panel: "Sales",
    status: "Active",
    activity: "New qualified lead: TechCorp Manufacturing",
    timestamp: "03/06/2025 10.42 AM",
    roleClasses: "bg-blue-100 text-blue-700",
  },
];

export default function EmployeeAuditLog() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-2xl">
          Add, edit, and manage employees, teams, roles, and permissions.
        </p>
      </div>

      <div className="bg-white">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="px-4 py-3">Employee</TableHead>
              <TableHead className="px-4 py-3">Role</TableHead>
              <TableHead className="px-4 py-3">Panel</TableHead>
              <TableHead className="px-4 py-3">Status</TableHead>
              <TableHead className="px-4 py-3">Last Activity</TableHead>
              <TableHead className="px-4 py-3">Time&amp;Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditRows.map((row) => (
              <TableRow key={row.id} className="">
                <TableCell className="px-4 py-4 align-middle">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>{row.initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-900">
                      {row.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 align-middle">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${row.roleClasses}`}
                  >
                    {row.role}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-4 align-middle text-sm text-gray-600">
                  {row.panel}
                </TableCell>
                <TableCell className="px-4 py-4 align-middle">
                  <Badge className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-xs font-medium">
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-4 align-middle text-sm text-gray-600">
                  {row.activity}
                </TableCell>
                <TableCell className="px-4 py-4 align-middle text-sm text-gray-600">
                  {row.timestamp}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
