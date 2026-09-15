import { Mail, Phone, Calendar, Edit, Briefcase, ShieldCheck } from "lucide-react";
import type { EmployeeProfilePersonalInfo } from "@/modules/employees/employees.api";

type PersonalTabProps = {
  personalInfo: EmployeeProfilePersonalInfo;
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
  if (!role) return "N/A";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export function EmployeePersonalTab({ personalInfo, onEdit }: PersonalTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow relative">
        <h4 className="font-semibold mb-4 text-gray-900">Contact Information</h4>
        <div className="space-y-4 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <div className="text-gray-500 text-xs">Email</div>
              <div className="mt-1 text-gray-900 font-medium">{personalInfo.email}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <div className="text-gray-500 text-xs">Phone</div>
              <div className="mt-1 text-gray-900 font-medium">
                {personalInfo.phone || "N/A"}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <div className="text-gray-500 text-xs">Join Date</div>
              <div className="mt-1 text-gray-900 font-medium">
                {formatJoinedDate(personalInfo.joinDate)}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <div className="text-gray-500 text-xs">Department</div>
              <div className="mt-1 text-gray-900 font-medium">
                {personalInfo.department || "N/A"}
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Edit contact"
            className="absolute right-4 p-4 bottom-4 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative bg-white p-6 rounded-lg shadow">
        <h4 className="font-semibold mb-4 text-gray-900">Roles & Permissions</h4>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <div className="text-gray-500 text-xs">Role</div>
            <div className="mt-1">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                {personalInfo.roleDisplay || formatRole(personalInfo.role)}
              </span>
            </div>
          </div>

          <div>
            <div className="text-gray-500 text-xs mb-2">Permissions</div>
            <div className="flex flex-wrap gap-2">
              {personalInfo.permissionTags && personalInfo.permissionTags.length > 0 ? (
                personalInfo.permissionTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">No permission tags assigned</span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="Edit roles and permissions"
          className="absolute right-4 p-4 bottom-4 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
