import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPasswordMutation } from "@/modules/auth/auth.hooks";
import authBg from "@/assets/images/auth-bg.jpg";
import { Eye, EyeOff } from "lucide-react";

interface ResetLocationState {
  resetToken?: string;
  email?: string;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResetLocationState | null;

  const [resetToken, setResetToken] = useState(state?.resetToken || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetPasswordMutation = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!resetToken) {
      setErrorMessage("Reset token is missing or expired. Please request a new OTP.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await resetPasswordMutation.mutateAsync({
        resetToken,
        newPassword,
      });

      if (response.success) {
        setSuccessMessage(response.message || "Password reset successfully. Redirecting to login...");
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);
      } else {
        setErrorMessage(response.message || "Failed to reset password. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Failed to reset password. Please try again."
      );
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authBg})` }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Reset Password Form Container */}
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-white px-12 py-10 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Create a new password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!state?.resetToken && (
            <div>
              <Label
                htmlFor="resetToken"
                className="text-sm font-normal text-gray-700"
              >
                Reset Token
              </Label>
              <Input
                id="resetToken"
                type="text"
                placeholder="Enter reset token"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                className="mt-1.5 h-12 rounded border-gray-200 placeholder:text-gray-400"
                required
              />
            </div>
          )}

          <div>
            <Label
              htmlFor="newPassword"
              className="text-sm font-normal text-gray-700"
            >
              New Password
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-12 rounded border-gray-200 pr-10 placeholder:text-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-normal text-gray-700"
            >
              Confirm New Password
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 rounded border-gray-200 pr-10 placeholder:text-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {errorMessage ? (
            <p className="text-sm text-red-500">{errorMessage}</p>
          ) : null}

          {successMessage ? (
            <p className="text-sm text-green-600">{successMessage}</p>
          ) : null}

          <Button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="h-12 w-full bg-blue-500 text-base font-medium hover:bg-blue-600"
          >
            {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
          </Button>

          <div className="text-center">
            <Link
              to="/sign-in"
              className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
