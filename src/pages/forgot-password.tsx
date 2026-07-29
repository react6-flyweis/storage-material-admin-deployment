import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
} from "@/modules/auth/auth.hooks";
import authBg from "@/assets/images/auth-bg.jpg";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const forgotPasswordMutation = useForgotPasswordMutation();
  const verifyOtpMutation = useVerifyOtpMutation();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await forgotPasswordMutation.mutateAsync({ email });
      if (response.success) {
        setSuccessMessage(response.message || "If that email exists, an OTP has been sent");
        setStep("verify");
      } else {
        setErrorMessage(response.message || "Failed to send OTP. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Failed to send OTP. Please try again."
      );
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!otp || otp.trim().length === 0) {
      setErrorMessage("Please enter a valid OTP.");
      return;
    }

    try {
      const response = await verifyOtpMutation.mutateAsync({
        email,
        otp: otp.trim(),
      });

      if (response.success && response.data?.resetToken) {
        navigate("/reset-password", {
          state: { resetToken: response.data.resetToken, email },
        });
      } else {
        setErrorMessage(response.message || "Invalid OTP");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Invalid OTP"
      );
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await forgotPasswordMutation.mutateAsync({ email });
      if (response.success) {
        setSuccessMessage(response.message || "OTP resent successfully");
      } else {
        setErrorMessage(response.message || "Failed to resend OTP.");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Failed to resend OTP."
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

      {/* Forgot Password Form Container */}
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-white px-12 py-10 shadow-2xl">
        {step === "request" ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                Forgot Password
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Enter your email address to receive an OTP verification code
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-normal text-gray-700"
                >
                  E-mail address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 h-12 rounded border-gray-200 placeholder:text-gray-400"
                  required
                />
              </div>

              {errorMessage ? (
                <p className="text-sm text-red-500">{errorMessage}</p>
              ) : null}

              {successMessage ? (
                <p className="text-sm text-green-600">{successMessage}</p>
              ) : null}

              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="h-12 w-full bg-blue-500 text-base font-medium hover:bg-blue-600"
              >
                {forgotPasswordMutation.isPending ? "Sending OTP..." : "Send OTP"}
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
          </>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                Verify OTP
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Enter the OTP sent to{" "}
                <span className="font-medium text-gray-900">{email}</span>
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="otp"
                  className="text-sm font-normal text-gray-700"
                >
                  OTP Code
                </Label>
                <Input
                  id="otp"
                  type="number"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  onInput={(e: React.FormEvent<HTMLInputElement>) => {
                    if (e.currentTarget.value.length > 6) {
                      e.currentTarget.value = e.currentTarget.value.slice(0, 6);
                    }
                  }}
                  className="mt-1.5 h-12 rounded border-gray-200 placeholder:text-gray-400"
                  required
                />
              </div>

              {errorMessage ? (
                <p className="text-sm text-red-500">{errorMessage}</p>
              ) : null}

              {successMessage ? (
                <p className="text-sm text-green-600">{successMessage}</p>
              ) : null}

              <Button
                type="submit"
                disabled={verifyOtpMutation.isPending}
                className="h-12 w-full bg-blue-500 text-base font-medium hover:bg-blue-600"
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
              </Button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("request");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={forgotPasswordMutation.isPending}
                  className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
                >
                  Resend OTP
                </button>
              </div>

              <div className="text-center pt-2 border-t border-gray-100">
                <Link
                  to="/sign-in"
                  className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
