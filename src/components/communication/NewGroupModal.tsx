import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  UsersRound,
  User,
  Loader2,
  Check,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatUser, ChatGroupDetails } from "@/modules/team-chat/team-chat.api";
import { useCreateGroupMutation } from "@/modules/team-chat/team-chat.hooks";
import { toast } from "sonner";

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: ChatUser[];
  isLoadingUsers: boolean;
  onGroupCreated: (group: ChatGroupDetails) => void;
  currentUserId?: string;
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({
  isOpen,
  onClose,
  users,
  isLoadingUsers,
  onGroupCreated,
  currentUserId,
}) => {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createGroupMutation = useCreateGroupMutation();

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = users.filter((u) => u._id !== currentUserId);
    if (!q) return list;
    return list.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q))
    );
  }, [users, search, currentUserId]);

  const selectedUsers = useMemo(() => {
    return users.filter((u) => selectedMemberIds.includes(u._id));
  }, [users, selectedMemberIds]);

  const handleToggleMember = (userId: string) => {
    setErrorMsg(null);
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMemberIds((prev) => prev.filter((id) => id !== userId));
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredUsers.map((u) => u._id);
    setSelectedMemberIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleClearSelected = () => {
    setSelectedMemberIds([]);
  };

  const handleClose = () => {
    setGroupName("");
    setSearch("");
    setSelectedMemberIds([]);
    setErrorMsg(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = groupName.trim();

    if (!trimmedName) {
      setErrorMsg("Please provide a group or department name.");
      return;
    }

    if (selectedMemberIds.length === 0) {
      setErrorMsg("Please select at least 1 member for the group.");
      return;
    }

    setErrorMsg(null);

    try {
      const createdGroup = await createGroupMutation.mutateAsync({
        name: trimmedName,
        memberIds: selectedMemberIds,
      });

      toast.success(`Group "${trimmedName}" created successfully!`);
      onGroupCreated(createdGroup);
      handleClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create group. Please try again.";
      setErrorMsg(message);
      toast.error(message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <UsersRound size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[#051321] text-base">
                Create Department / Group Channel
              </h3>
              <p className="text-xs text-gray-500">
                Create a collaborative chat room for your team
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs text-rose-700 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-rose-500 hover:text-rose-700"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Group Name Input */}
          <div className="p-4 border-b border-gray-100 space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Group / Department Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="e.g. Project Alpha Team, Sales & Marketing, Plant Ops..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 transition-all font-medium"
            />
          </div>

          {/* Selected Members Chips */}
          {selectedUsers.length > 0 && (
            <div className="px-4 py-2.5 bg-slate-50/80 border-b border-gray-100 flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto">
              <span className="text-[11px] font-semibold text-gray-500 mr-1">
                Selected ({selectedUsers.length}):
              </span>
              {selectedUsers.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center gap-1 bg-white border border-blue-200 text-blue-800 text-xs px-2.5 py-0.5 rounded-full shadow-2xs"
                >
                  <span className="font-medium truncate max-w-28">{u.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(u._id)}
                    className="text-blue-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleClearSelected}
                className="text-[10px] text-gray-400 hover:text-rose-600 underline ml-auto cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Member Search & Selection Header */}
          <div className="p-3 border-b border-gray-100 flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff to add..."
                className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            {filteredUsers.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium shrink-0 px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              >
                Select All
              </button>
            )}
          </div>

          {/* Member List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-gray-50">
            {isLoadingUsers ? (
              <div className="p-8 text-center text-xs text-gray-400">
                <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-blue-500" />
                Loading staff directory...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No staff members found matching &quot;{search}&quot;
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedMemberIds.includes(user._id);

                return (
                  <div
                    key={user._id}
                    onClick={() => handleToggleMember(user._id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50/80 border border-blue-200/80"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-full border border-gray-100 object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-gray-200">
                            {user.name ? (
                              user.name.charAt(0).toUpperCase()
                            ) : (
                              <User size={14} />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#051321] truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-gray-400 capitalize truncate">
                          {user.role || "Staff"}
                          {user.department ? ` • ${user.department}` : ""}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ml-2 ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer actions */}
          <div className="p-3 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <span className="font-semibold text-slate-800">
                {selectedMemberIds.length}
              </span>{" "}
              members selected
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={createGroupMutation.isPending}
                className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={
                  createGroupMutation.isPending ||
                  !groupName.trim() ||
                  selectedMemberIds.length === 0
                }
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {createGroupMutation.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    <span>Create Channel</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewGroupModal;
