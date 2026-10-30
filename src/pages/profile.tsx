import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  CircleAlert,
  MoveLeft,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Trash2,
  Calendar,
  Building2,
  Phone,
  Mail,
  Smartphone,
} from "lucide-react";
import TitleSubtitle from "@/components/TitleSubtitle";
import { Button } from "@/components/ui/button";
import { useAppBack } from "@/modules/navigation";
import {
  useProfile,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  type UpdateProfileRequest,
} from "@/modules/profile";
import { uploadFileToS3 } from "@/lib/upload";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  sales: "Sales",
  account: "Accountant",
  plant: "Plant Manager",
  construction: "Construction Manager",
};

export default function ProfileView() {
  const { goBack } = useAppBack("/");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries & Mutations
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfile();
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    mobile: "",
    avatar: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Populate form data once profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        mobile: profile.mobile || "",
        avatar: profile.avatar || "",
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)$/i)) {
      toast.error("Only JPG, PNG, WEBP, or GIF files are allowed");
      return;
    }

    setIsUploadingAvatar(true);
    const toastId = toast.loading("Uploading profile picture...");

    try {
      // Upload via presigned S3 URL
      const uploadedUrl = await uploadFileToS3(file, "avatars");
      setFormData((prev) => ({
        ...prev,
        avatar: uploadedUrl,
      }));
      toast.success("Profile picture uploaded successfully", { id: toastId });
    } catch (err: unknown) {
      // If presigned S3 fails, read locally as fallback preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
      toast.warning(
        `Cloud upload note: ${getApiErrorMessage(err, "Using local preview.")}`,
        { id: toastId }
      );
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePicture = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: "",
    }));
  };

  // Determine changed fields (Send only fields to change)
  const getChangedPayload = (): UpdateProfileRequest => {
    const payload: UpdateProfileRequest = {};
    const nameTrim = formData.name.trim();
    const emailTrim = formData.email.trim();
    const phoneTrim = formData.phone.trim();
    const mobileTrim = formData.mobile.trim();
    const avatarVal = (formData.avatar || "").trim();

    if (nameTrim !== (profile?.name || "").trim()) {
      payload.name = nameTrim;
    }
    if (emailTrim !== (profile?.email || "").trim()) {
      payload.email = emailTrim;
    }
    if (phoneTrim !== (profile?.phone || "").trim()) {
      payload.phone = phoneTrim;
    }
    if (mobileTrim !== (profile?.mobile || "").trim()) {
      payload.mobile = mobileTrim; // "" clears
    }
    if (avatarVal !== (profile?.avatar || "").trim()) {
      payload.avatar = avatarVal;
    }

    return payload;
  };

  // Save profile information
  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    let payload = getChangedPayload();

    // If nothing changed, re-send current name/email so request has at least one field
    if (Object.keys(payload).length === 0) {
      toast.info("No profile changes detected to save");
      return;
    }

    const toastId = toast.loading("Saving profile changes...");
    try {
      await updateProfileMutation.mutateAsync(payload);
      toast.success("Profile updated successfully", { id: toastId });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to update profile"), {
        id: toastId,
      });
    }
  };

  // Change password
  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!passwordData.newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    const toastId = toast.loading("Updating password...");
    try {
      const res = await changePasswordMutation.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success(res.message || "Password updated successfully", {
        id: toastId,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to update password"), {
        id: toastId,
      });
    }
  };

  // Save all changes (Profile and optionally Password if filled)
  const handleSaveAllChanges = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    const isChangingPassword =
      Boolean(passwordData.currentPassword) ||
      Boolean(passwordData.newPassword) ||
      Boolean(passwordData.confirmPassword);

    if (isChangingPassword) {
      if (!passwordData.currentPassword) {
        toast.error("Please enter your current password to change password");
        return;
      }
      if (!passwordData.newPassword) {
        toast.error("Please enter a new password");
        return;
      }
      if (passwordData.newPassword.length < 8) {
        toast.error("New password must be at least 8 characters long");
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("New password and confirmation do not match");
        return;
      }
    }

    const payload = getChangedPayload();
    const hasProfileChanges = Object.keys(payload).length > 0;

    if (!hasProfileChanges && !isChangingPassword) {
      toast.info("No changes to save");
      return;
    }

    const toastId = toast.loading("Saving changes...");
    try {
      // Update profile if changed
      if (hasProfileChanges) {
        await updateProfileMutation.mutateAsync(payload);
      }

      // Update password if fields filled
      if (isChangingPassword) {
        await changePasswordMutation.mutateAsync({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      toast.success("All changes saved successfully", { id: toastId });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to save changes"), {
        id: toastId,
      });
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const isSaving =
    updateProfileMutation.isPending || changePasswordMutation.isPending;

  if (isProfileLoading) {
    return (
      <div className="xl:px-5 px-2 md:pt-5 pb-10 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  const roleKey = (profile?.role || "").toLowerCase();
  const roleDisplay = ROLE_LABELS[roleKey] || profile?.role || "Staff";

  return (
    <div className="xl:px-5 px-2 md:pt-5 pb-10 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap md:items-center items-start justify-between mt-2 xl:mt-0 gap-4">
        <div className="flex items-start gap-4 flex-wrap">
          <Button variant="outline" onClick={() => goBack()}>
            <MoveLeft className="w-4 h-4" />
            <p className="font-normal">Back</p>
          </Button>
          <TitleSubtitle
            title="My Profile"
            subtitle="Update your personal information and security settings"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSaveAllChanges}
            disabled={isSaving || isUploadingAvatar}
            className="min-w-36 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save All Changes"
            )}
          </Button>
        </div>
      </div>

      {profileError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 flex items-center gap-3 text-sm">
          <CircleAlert className="w-5 h-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium">Could not sync with live profile API</p>
            <p className="text-xs text-amber-700">
              {getApiErrorMessage(profileError)}
            </p>
          </div>
        </div>
      )}

      {/* Profile Card & Picture Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-4 border-gray-50 shadow-inner">
              {formData.avatar ? (
                <AvatarImage
                  src={formData.avatar}
                  alt={formData.name || "Profile"}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="text-xl font-bold bg-blue-100 text-blue-700">
                {getInitials(formData.name || profile?.name)}
              </AvatarFallback>
            </Avatar>
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            )}
          </div>

          <div className="space-y-2 flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="md:text-xl font-bold text-gray-900">
                {formData.name || "Staff Member"}
              </h3>
              {profile?.role && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  {roleDisplay}
                </span>
              )}
              {profile?.isMainAdmin && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Main Admin
                </span>
              )}
              {profile?.isActive !== undefined && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                    profile.isActive
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      profile.isActive ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  {profile.isActive ? "Active" : "Inactive"}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {formData.email || "No email"}
              </span>
              {formData.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {formData.phone}
                </span>
              )}
              {profile?.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Joined {formatDate(profile.createdAt)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs gap-1.5 h-9"
                onClick={handleProfilePictureClick}
                type="button"
                disabled={isUploadingAvatar}
              >
                <Camera className="w-3.5 h-3.5 text-gray-600" />
                Change Picture
              </Button>
              {formData.avatar && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-xs text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5 h-9"
                  onClick={handleRemovePicture}
                  type="button"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </Button>
              )}
              <span className="text-xs text-gray-400 hidden sm:inline">
                JPG, PNG or GIF, Max size 5MB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="md:text-lg font-semibold text-gray-900">
            Basic Information
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
            className="text-xs h-8"
          >
            {updateProfileMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : null}
            Save Basic Info
          </Button>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Primary Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Phone Number (Primary)
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g. +1 555-0100"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Mobile Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Mobile Number (Optional)
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="e.g. +1 555-0199 (clear to remove)"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Role (Read only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <input
                type="text"
                name="role"
                value={roleDisplay}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 focus:outline-none cursor-not-allowed text-sm"
              />
              <span className="text-xs text-gray-400">
                Assigned role ({profile?.role || "staff"})
              </span>
            </div>

            {/* Department (Read only / Display) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={profile?.department || "Operations"}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 focus:outline-none cursor-not-allowed text-sm"
              />
              <span className="text-xs text-gray-400">
                Department assignment
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="md:text-lg font-semibold text-gray-900">
              Security Settings
            </h3>
            <p className="text-xs text-gray-500">
              Leave password fields empty if you do not want to change your password
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpdatePassword}
            disabled={
              changePasswordMutation.isPending || !passwordData.currentPassword
            }
            className="text-xs h-8"
          >
            {changePasswordMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : null}
            Update Password
          </Button>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="w-full md:w-1/2 pr-0 md:pr-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Requirements Info */}
      <div className="bg-blue-50/70 rounded-xl p-5 border border-blue-100 flex items-start gap-3">
        <CircleAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-blue-900">
            Password Requirements:
          </h4>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>At least 8 characters long</li>
            <li>Include uppercase and lowercase letters</li>
            <li>Include at least one number</li>
            <li>Include at least one special character</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
