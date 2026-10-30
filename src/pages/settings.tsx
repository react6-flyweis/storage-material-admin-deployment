import { useState, useEffect } from "react";
import {
  MoveLeft,
  Loader2,
  CircleAlert,
  Bell,
  User,
  ArrowRight,
  Shield,
  Smartphone,
  Mail,
  FileText,
  Activity,
  KeyRound,
} from "lucide-react";
import { useNavigate } from "react-router";
import TitleSubtitle from "@/components/TitleSubtitle";
import { Button } from "@/components/ui/button";
import { useAppBack } from "@/modules/navigation";
import {
  useProfile,
  useUpdateNotificationSettingsMutation,
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationSettings,
} from "@/modules/profile";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Settings() {
  const { goBack } = useAppBack("/");
  const navigate = useNavigate();

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfile();
  const updateNotificationSettingsMutation =
    useUpdateNotificationSettingsMutation();

  // Notification / Account toggles adhering to exact schema
  const [settings, setSettings] = useState<Required<NotificationSettings>>(
    DEFAULT_NOTIFICATION_SETTINGS
  );

  // Sync state from profile's notificationSettings when loaded from GET /api/profile
  useEffect(() => {
    if (profile?.notificationSettings) {
      const ns = profile.notificationSettings;
      setSettings({
        twoFactorAuth: Boolean(ns.twoFactorAuth ?? DEFAULT_NOTIFICATION_SETTINGS.twoFactorAuth),
        emailNotification: Boolean(ns.emailNotification ?? DEFAULT_NOTIFICATION_SETTINGS.emailNotification),
        smsNotification: Boolean(ns.smsNotification ?? DEFAULT_NOTIFICATION_SETTINGS.smsNotification),
        dashboardNotifications: Boolean(ns.dashboardNotifications ?? DEFAULT_NOTIFICATION_SETTINGS.dashboardNotifications),
        weeklyEmailReports: Boolean(ns.weeklyEmailReports ?? DEFAULT_NOTIFICATION_SETTINGS.weeklyEmailReports),
        systemAlerts: Boolean(ns.systemAlerts ?? DEFAULT_NOTIFICATION_SETTINGS.systemAlerts),
        loginAlertsViaMail: Boolean(ns.loginAlertsViaMail ?? DEFAULT_NOTIFICATION_SETTINGS.loginAlertsViaMail),
      });
    }
  }, [profile]);

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveSettings = async () => {
    const payload: NotificationSettings = {
      twoFactorAuth: settings.twoFactorAuth,
      emailNotification: settings.emailNotification,
      smsNotification: settings.smsNotification,
      dashboardNotifications: settings.dashboardNotifications,
      weeklyEmailReports: settings.weeklyEmailReports,
      systemAlerts: settings.systemAlerts,
      loginAlertsViaMail: settings.loginAlertsViaMail,
    };

    const toastId = toast.loading("Saving settings...");
    try {
      await updateNotificationSettingsMutation.mutateAsync(payload);
      toast.success("Settings saved successfully", { id: toastId });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to save settings"), {
        id: toastId,
      });
    }
  };

  const isSaving = updateNotificationSettingsMutation.isPending;

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="xl:px-5 px-2 md:pt-5 pb-10 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap md:items-center items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-wrap">
          <Button variant="outline" onClick={() => goBack()}>
            <MoveLeft className="w-4 h-4" />
            <p className="font-normal md:text-sm text-xs">Back</p>
          </Button>
          <TitleSubtitle
            title="Settings"
            subtitle="Manage your account preferences and notification configuration"
          />
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving || isProfileLoading}
          className="min-w-36 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save All Settings"
          )}
        </Button>
      </div>

      {profileError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 flex items-center gap-3 text-sm">
          <CircleAlert className="w-5 h-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium">Could not load saved settings from server</p>
            <p className="text-xs text-amber-700">
              {getApiErrorMessage(profileError)}
            </p>
          </div>
        </div>
      )}

      {/* Account Overview Card */}
      {profile && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border border-gray-100 shadow-sm">
              {profile.avatar && (
                <AvatarImage
                  src={profile.avatar}
                  alt={profile.name}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                  {profile.name}
                </h4>
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase font-medium">
                  {profile.role}
                </span>
                {profile.isMainAdmin && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                    Main Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{profile.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/profile")}
            className="text-xs gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <User className="w-3.5 h-3.5" />
            Edit Profile
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </Button>
        </div>
      )}

      {/* Account Settings Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-gray-700" />
          <h3 className="md:text-lg font-semibold text-gray-900">
            Account & Security Settings
          </h3>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-6">
          {/* Two Factor Authentication */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Two Factor Authentication (2FA)
                </h4>
                <p className="text-xs text-gray-500">
                  Add an extra layer of security to your staff account
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting("twoFactorAuth")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                settings.twoFactorAuth ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.twoFactorAuth ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="border-t border-gray-100" />

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Email Notifications
                </h4>
                <p className="text-xs text-gray-500">
                  Receive activity and order updates via email
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting("emailNotification")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                settings.emailNotification ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.emailNotification ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="border-t border-gray-100" />

          {/* SMS Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  SMS Notifications
                </h4>
                <p className="text-xs text-gray-500">
                  Receive urgent dispatch and verification alerts via SMS
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting("smsNotification")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                settings.smsNotification ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.smsNotification ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-4 h-4 text-gray-700" />
          <h3 className="md:text-lg font-semibold text-gray-900">
            System & Report Notifications
          </h3>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-6">
          {/* Dashboard Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Dashboard Notifications
                </h4>
                <p className="text-xs text-gray-500">
                  Show real-time notifications in-app and in the dashboard
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting("dashboardNotifications")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                settings.dashboardNotifications ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.dashboardNotifications
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="border-t border-gray-100" />

          {/* Weekly Email Reports */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Weekly Email Reports
                </h4>
                <p className="text-xs text-gray-500">
                  Receive weekly summary reports and pipeline analytics via email
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting("weeklyEmailReports")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                settings.weeklyEmailReports ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.weeklyEmailReports
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="border-t border-gray-100" />

          {/* System Alerts */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  System Alerts
                </h4>
                <p className="text-xs text-gray-500">
                  Receive critical system health and service status alerts
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting("systemAlerts")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                settings.systemAlerts ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.systemAlerts ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="border-t border-gray-100" />

          {/* Login Alerts via Mail */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Login Alerts via Mail
                </h4>
                <p className="text-xs text-gray-500">
                  Get notified by email whenever a new login or new device registers
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting("loginAlertsViaMail")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                settings.loginAlertsViaMail ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.loginAlertsViaMail
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
