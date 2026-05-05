import { Mail, Phone, Calendar, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { AdminEmployeeApiItem } from "@/modules/employees/employees.api";

type PersonalTabProps = {
  employee: AdminEmployeeApiItem;
  onEdit: () => void;
};

const formatJoinedDate = (date?: string) => {
  if (!date) return "N/A";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "N/A";
  return parsedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatRole = (role?: string) => {
  switch (role?.toLowerCase()) {
    case "account":
      return "Account";
    case "admin":
      return "Admin";
    case "sales":
      return "Sales";
    default:
      return role ? role.charAt(0).toUpperCase() + role.slice(1) : "N/A";
  }
};

export function EmployeePersonalTab({ employee, onEdit }: PersonalTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow relative">
        <h4 className="font-semibold mb-4">Contact Information</h4>
        <div className="space-y-4 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <div className="text-gray-500 text-xs">Email</div>
              <div className="mt-1 text-gray-900">{employee.email}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <div className="text-gray-500 text-xs">Phone</div>
              <div className="mt-1 text-gray-900">{employee.phone ?? "N/A"}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <div className="text-gray-500 text-xs">Join Date</div>
              <div className="mt-1 text-gray-900">{formatJoinedDate(employee.createdAt)}</div>
            </div>
          </div>

          <button
            aria-label="Edit contact"
            className="absolute right-4 p-4 bottom-4"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative bg-white p-6 rounded-lg shadow">
        <h4 className="font-semibold mb-4">Roles & Permissions</h4>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <div className="text-gray-500 text-xs">Role</div>
            <div className="mt-1">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                {formatRole(employee.role)}
              </span>
            </div>
          </div>

          <div>
            <div className="text-gray-500 text-xs">Permissions</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                Lead Access
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                Follow-ups Access
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                Reports Access
              </span>
            </div>
          </div>
        </div>

        <button
          aria-label="Edit roles and permissions"
          className="absolute right-4 p-4 bottom-4"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
