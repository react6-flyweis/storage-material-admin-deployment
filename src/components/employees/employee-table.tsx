import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Search, Eye, Users, PenLine } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { EditEmployeeDialog } from "@/components/employees/edit-employee-dialog";
import SuccessDialog from "@/components/success-dialog";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  role: string;
  team: string;
  status: "active" | "inactive";
  leads: number;
  avatar?: string;
}

interface EmployeeTableProps {
  employees: Employee[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [deletedEmployeeName, setDeletedEmployeeName] = useState<string>("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const handleEditDialogOpenChange = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setSelectedEmployee(null);
    }
  };

  const handleSaveEmployee = (
    updatedEmployee: Omit<Employee, "joinedDate" | "leads" | "avatar">,
  ) => {
    console.log("Updated employee", updatedEmployee);
  };

  const filteredEmployees = employees.filter((employee) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      employee.name.toLowerCase().includes(q) ||
      employee.email.toLowerCase().includes(q) ||
      employee.phone.toLowerCase().includes(q) ||
      employee.team.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || employee.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || employee.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Manager":
        return "bg-blue-100 text-blue-700";
      case "Employee":
        return "bg-green-100 text-green-700";
      case "Admin":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-md flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-35">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>All</SelectLabel>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-35">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>All</SelectLabel>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Employee Directory Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">
            Employee Directory ({filteredEmployees.length} employees)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs text-gray-500 uppercase tracking-wider">
                  EMPLOYEE
                </TableHead>
                <TableHead className="text-xs text-gray-500 uppercase tracking-wider">
                  CONTACT
                </TableHead>
                <TableHead className="text-xs text-gray-500 uppercase tracking-wider">
                  ROLE
                </TableHead>
                <TableHead className="text-xs text-gray-500 uppercase tracking-wider">
                  TEAM
                </TableHead>
                <TableHead className="text-xs text-gray-500 uppercase tracking-wider">
                  STATUS
                </TableHead>
                <TableHead className="text-xs text-gray-500 uppercase tracking-wider">
                  LEADS
                </TableHead>
                <TableHead className="text-xs text-gray-500 uppercase tracking-wider text-right">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow
                  key={employee.id}
                  onClick={() => navigate(`/employees/${employee.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback className="bg-gray-100 text-gray-700">
                          {getInitials(employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          to={`/employees/${employee.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {employee.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          Joined {employee.joinedDate}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{employee.email}</p>
                      <p className="text-sm text-gray-500">{employee.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getRoleBadgeColor(
                        employee.role,
                      )} rounded-full px-3 py-1 text-sm font-medium`}
                    >
                      {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{employee.team}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getStatusBadgeColor(
                        employee.status,
                      )} rounded-full px-3 py-1 text-sm font-medium`}
                    >
                      {employee.status.charAt(0).toUpperCase() +
                        employee.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{employee.leads}</span>
                      <Users className="h-4 w-4 text-gray-400" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/employees/${employee.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex h-8 w-8 items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmployee(employee);
                          setEditDialogOpen(true);
                        }}
                      >
                        <PenLine className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletedEmployeeName(employee.name);
                          setIsSuccessDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No employees found matching your criteria.
          </div>
        )}
      </div>

      <SuccessDialog
        open={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
        title={
          deletedEmployeeName
            ? `${deletedEmployeeName} Deleted`
            : "Employee Deleted"
        }
        okLabel="OK"
        icon={<Trash2 className="h-16 w-16 text-red-600 mx-auto" />}
      />

      <EditEmployeeDialog
        open={editDialogOpen}
        onOpenChange={handleEditDialogOpenChange}
        employee={selectedEmployee ?? undefined}
        onSave={handleSaveEmployee}
      />
    </div>
  );
}
