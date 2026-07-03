import { MoveLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import TitleSubtitle from "@/components/TitleSubtitle";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const navigate = useNavigate();
  const [accountSettings, setAccountSettings] = useState({
    twoFactorAuth: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    dashboardNotifications: true,
    weeklyEmailReports: true,
    systemAlerts: true,
    loginAlerts: false,
  });

  const toggleAccountSetting = (key: keyof typeof accountSettings) => {
    setAccountSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleNotificationSetting = (
    key: keyof typeof notificationSettings
  ) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="xl:px-5 px-2 md:pt-5 pb-10 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap md:items-center items-start justify-between">
        <div className="flex items-start gap-4 flex-wrap">
          <Button onClick={() => navigate('/')}>
            <MoveLeft className="w-4 h-4" />
            <p className="font-normal md:text-sm text-xs">Back</p>
          </Button>
          <TitleSubtitle
            title="Settings"
            subtitle="Manage your account preferences and system configuration"
          />
        </div>
        <Button className=" min-w-32">Save All Settings</Button>
      </div>

      {/* Account Settings */}
      <h3 className="md:text-lg font-semibold text-gray-900 my-1">
        Account Settings
      </h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-6">
        {/* Two Factor Authentication */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Two Factor Authentication
            </h4>
            <p className="text-xs text-gray-500">
              Add an extra layer to your account
            </p>
          </div>
          <button
            onClick={() => toggleAccountSetting("twoFactorAuth")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              accountSettings.twoFactorAuth ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                accountSettings.twoFactorAuth
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Email Notifications
            </h4>
            <p className="text-xs text-gray-500">
              Receive notification via email
            </p>
          </div>
          <button
            onClick={() => toggleAccountSetting("emailNotifications")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              accountSettings.emailNotifications ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                accountSettings.emailNotifications
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* SMS Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              SMS Notifications
            </h4>
            <p className="text-xs text-gray-500">
              Receive notification via SMS
            </p>
          </div>
          <button
            onClick={() => toggleAccountSetting("smsNotifications")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              accountSettings.smsNotifications ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                accountSettings.smsNotifications
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <h3 className="md:text-lg font-semibold text-gray-900 my-1">
        Notification Settings
      </h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-6">
        {/* Dashboard Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Dashboard Notifications
            </h4>
            <p className="text-xs text-gray-500">
              Show notifications in the dashboard
            </p>
          </div>
          <button
            onClick={() => toggleNotificationSetting("dashboardNotifications")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notificationSettings.dashboardNotifications
                ? "bg-blue-600"
                : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.dashboardNotifications
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Weekly Email Reports */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Weekly Email Reports
            </h4>
            <p className="text-xs text-gray-500">
              Receive weekly summary reports via email
            </p>
          </div>
          <button
            onClick={() => toggleNotificationSetting("weeklyEmailReports")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notificationSettings.weeklyEmailReports
                ? "bg-blue-600"
                : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.weeklyEmailReports
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* System Alerts */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              System Alerts
            </h4>
            <p className="text-xs text-gray-500">
              Receive critical system alerts
            </p>
          </div>
          <button
            onClick={() => toggleNotificationSetting("systemAlerts")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notificationSettings.systemAlerts ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.systemAlerts
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Login Alerts via Mail */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Login Alerts wia Mail
            </h4>
            <p className="text-xs text-gray-500">
              Get notified when new Login register
            </p>
          </div>
          <button
            onClick={() => toggleNotificationSetting("loginAlerts")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notificationSettings.loginAlerts ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.loginAlerts
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
