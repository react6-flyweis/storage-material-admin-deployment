import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowRightLeft,
  Crown,
  Edit2,
  MoreVertical,
  Power,
  Search,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import type { AdminUser } from "@/modules/admins/admins.types";
import { EditAdminDialog } from "./edit-admin-dialog";
import { TransferMainDialog } from "./transfer-main-dialog";
import { DeleteAdminDialog } from "./delete-admin-dialog";
import { useToggleAdminStatusMutation } from "@/modules/admins/admins.hooks";
import { useAuthStore } from "@/modules/auth/auth.store";
import { toast } from "sonner";

interface AdminTableProps {
  admins: AdminUser[];
  loading?: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onRefresh?: () => void;
  isMainAdmin?: boolean;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

export function AdminTable({
  admins,
  loading = false,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  isMainAdmin = false,
}: AdminTableProps) {
  const currentUser = useAuthStore((state) => state.user);
  const isCallerMainAdmin = isMainAdmin;

  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [transferAdmin, setTransferAdmin] = useState<AdminUser | null>(null);
  const [deleteAdmin, setDeleteAdmin] = useState<AdminUser | null>(null);

  const toggleStatusMutation = useToggleAdminStatusMutation();

  const handleToggleStatus = async (admin: AdminUser) => {
    if (admin.isMainAdmin) {
      toast.error("Main Admin status cannot be toggled.");
      return;
    }

    try {
      await toggleStatusMutation.mutateAsync(admin._id);
      toast.success(
        `Admin "${admin.name}" status switched to ${admin.isActive ? "Inactive" : "Active"}.`,
      );
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to toggle admin status";
      toast.error(msg);
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (admin.phone &&
        admin.phone.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? admin.isActive
          : !admin.isActive;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="pl-9 bg-gray-50 border-gray-200 text-sm focus:bg-white"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-gray-50 border-gray-200 text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing {filteredAdmins.length} of {admins.length} administrators
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/75 hover:bg-gray-50/75 border-b border-gray-100">
              <TableHead className="text-xs font-semibold text-gray-600 pl-6 py-3.5">
                Admin User
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 py-3.5">
                Role & Privilege
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 py-3.5">
                Contact Phone
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 py-3.5">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 py-3.5">
                Joined Date
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 pr-6 py-3.5 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="space-y-1.5">
                        <div className="w-32 h-4 bg-gray-200 rounded" />
                        <div className="w-44 h-3 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-24 h-6 bg-gray-200 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="w-28 h-4 bg-gray-200 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="w-16 h-6 bg-gray-200 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="w-20 h-4 bg-gray-200 rounded" />
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="w-8 h-8 bg-gray-200 rounded ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 rounded-full bg-gray-100 text-gray-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mt-1">
                      No admin users found
                    </h3>
                    <p className="text-xs text-gray-500 max-w-sm">
                      {searchQuery
                        ? "No administrator records match your current search or filter criteria."
                        : "There are no administrators registered in the system yet."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin) => {
                const isSelf = currentUser?._id === admin._id;
                const isMain = Boolean(admin.isMainAdmin);

                return (
                  <TableRow
                    key={admin._id}
                    className="hover:bg-gray-50/60 transition-colors border-b border-gray-100"
                  >
                    {/* Admin User Info */}
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-gray-100 bg-blue-50">
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-xs">
                            {getInitials(admin.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-sm">
                              {admin.name}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{admin.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role & Privilege Badge */}
                    <TableCell className="py-4">
                      {isMain ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs">
                          <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                          Main Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <Shield className="w-3.5 h-3.5 text-blue-500" />
                          Admin
                        </span>
                      )}
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="py-4 text-xs text-gray-600">
                      {admin.phone || "—"}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-4">
                      <Badge
                        variant="secondary"
                        className={
                          admin.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium text-xs px-2.5 py-0.5"
                            : "bg-red-50 text-red-700 border-red-200 font-medium text-xs px-2.5 py-0.5"
                        }
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            admin.isActive ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                        {admin.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    {/* Joined Date */}
                    <TableCell className="py-4 text-xs text-gray-600">
                      {formatDate(admin.createdAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-6 py-4 text-right">
                      {isCallerMainAdmin ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-gray-900"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 bg-white shadow-lg border border-gray-100 p-1.5"
                          >
                            <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-2 py-1">
                              Admin Actions
                            </DropdownMenuLabel>

                            {/* Edit Admin */}
                            <DropdownMenuItem
                              onClick={() => setEditAdmin(admin)}
                              className="text-xs gap-2 cursor-pointer text-gray-700 hover:bg-gray-50"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                              Edit Details
                            </DropdownMenuItem>

                            {/* Toggle Status (Not allowed on main admin) */}
                            {!isMain && (
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(admin)}
                                className="text-xs gap-2 cursor-pointer text-gray-700 hover:bg-gray-50"
                              >
                                <Power className="w-3.5 h-3.5 text-gray-500" />
                                {admin.isActive
                                  ? "Deactivate Account"
                                  : "Activate Account"}
                              </DropdownMenuItem>
                            )}

                            {/* Transfer Main Admin (Only to active regular admins) */}
                            {!isMain && admin.isActive && (
                              <DropdownMenuItem
                                onClick={() => setTransferAdmin(admin)}
                                className="text-xs gap-2 cursor-pointer text-amber-700 hover:bg-amber-50"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
                                Transfer Main Admin
                              </DropdownMenuItem>
                            )}

                            {/* Delete Admin (Cannot delete main admin or self) */}
                            {!isMain && !isSelf && (
                              <>
                                <DropdownMenuSeparator className="my-1 border-gray-100" />
                                <DropdownMenuItem
                                  onClick={() => setDeleteAdmin(admin)}
                                  className="text-xs gap-2 cursor-pointer text-red-600 hover:bg-red-50 focus:text-red-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  Delete Account
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">
                          Protected
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <EditAdminDialog
        admin={editAdmin}
        open={Boolean(editAdmin)}
        onOpenChange={(open) => !open && setEditAdmin(null)}
      />

      <TransferMainDialog
        admin={transferAdmin}
        open={Boolean(transferAdmin)}
        onOpenChange={(open) => !open && setTransferAdmin(null)}
      />

      <DeleteAdminDialog
        admin={deleteAdmin}
        open={Boolean(deleteAdmin)}
        onOpenChange={(open) => !open && setDeleteAdmin(null)}
      />
    </div>
  );
}
