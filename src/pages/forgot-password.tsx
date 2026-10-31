import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
} from "@/modules/auth/auth.hooks";
import authBg from "@/assets/images/auth-bg.jpg";
import { ADMIN_USER_ROLE } from "@/modules/auth/auth.types";
import { getApiErrorMessage } from "@/lib/api-error";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

const verifyOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .min(1, "Please enter a valid OTP")
    .length(6, "OTP must be 6 digits"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const forgotPasswordMutation = useForgotPasswordMutation();
  const verifyOtpMutation = useVerifyOtpMutation();

  const requestForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const verifyForm = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleEmailSubmit = async (data: ForgotPasswordFormData) => {
    setSuccessMessage(null);
    requestForm.clearErrors();

    try {
      const response = await forgotPasswordMutation.mutateAsync({
        email: data.email,
        role: ADMIN_USER_ROLE,
      });

      if (response.success) {
        setSubmittedEmail(data.email);
        setSuccessMessage(
          response.message || "If that email exists, an OTP has been sent",
        );
        verifyForm.reset();
        setStep("verify");
      } else {
        requestForm.setError("root", {
          type: "manual",
          message: response.message || "Failed to send OTP. Please try again.",
        });
      }
    } catch (err: unknown) {
      const message = getApiErrorMessage(
        err,
        "Failed to send OTP. Please try again.",
      );
      requestForm.setError("root", {
        type: "manual",
        message,
      });
    }
  };

  const handleOtpSubmit = async (data: VerifyOtpFormData) => {
    setSuccessMessage(null);
    verifyForm.clearErrors();

    try {
      const response = await verifyOtpMutation.mutateAsync({
        email: submittedEmail,
        otp: data.otp.trim(),
        role: ADMIN_USER_ROLE,
      });

      if (response.success && response.data?.resetToken) {
        navigate("/reset-password", {
          replace: true,
          state: {
            resetToken: response.data.resetToken,
            email: submittedEmail,
            role: ADMIN_USER_ROLE,
          },
        });
      } else {
        verifyForm.setError("root", {
          type: "manual",
          message: response.message || "Invalid OTP",
        });
      }
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, "Invalid OTP");
      verifyForm.setError("root", {
        type: "manual",
        message,
      });
    }
  };

  const handleResendOtp = async () => {
    if (!submittedEmail) return;
    setSuccessMessage(null);
    verifyForm.clearErrors();

    try {
      const response = await forgotPasswordMutation.mutateAsync({
        email: submittedEmail,
        role: ADMIN_USER_ROLE,
      });

      if (response.success) {
        setSuccessMessage(response.message || "OTP resent successfully");
      } else {
        verifyForm.setError("root", {
          type: "manual",
          message: response.message || "Failed to resend OTP.",
        });
      }
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, "Failed to resend OTP.");
      verifyForm.setError("root", {
        type: "manual",
        message,
      });
    }
  };

  const requestRootError = requestForm.formState.errors.root?.message;
  const requestEmailError = requestForm.formState.errors.email?.message;

  const verifyRootError = verifyForm.formState.errors.root?.message;
  const verifyOtpError = verifyForm.formState.errors.otp?.message;

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

            <form
              onSubmit={requestForm.handleSubmit(handleEmailSubmit)}
              className="space-y-6"
            >
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
                  {...requestForm.register("email")}
                  className="mt-1.5 h-12 rounded border-gray-200 placeholder:text-gray-400"
                />
                {requestEmailError && (
                  <p className="mt-1 text-sm text-red-500">{requestEmailError}</p>
                )}
              </div>

              {requestRootError && (
                <p className="text-sm text-red-500">{requestRootError}</p>
              )}

              {successMessage && (
                <p className="text-sm text-green-600">{successMessage}</p>
              )}

              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="h-12 w-full bg-blue-500 text-base font-medium hover:bg-blue-600"
              >
                {forgotPasswordMutation.isPending
                  ? "Sending OTP..."
                  : "Send OTP"}
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
                <span className="font-medium text-gray-900">
                  {submittedEmail}
                </span>
              </p>
            </div>

            <form
              onSubmit={verifyForm.handleSubmit(handleOtpSubmit)}
              className="space-y-6"
            >
              <div>
                <Label
                  htmlFor="otp"
                  className="text-sm font-normal text-gray-700"
                >
                  OTP Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  {...verifyForm.register("otp")}
                  className="mt-1.5 h-12 rounded border-gray-200 placeholder:text-gray-400"
                />
                {verifyOtpError && (
                  <p className="mt-1 text-sm text-red-500">{verifyOtpError}</p>
                )}
              </div>

              {verifyRootError && (
                <p className="text-sm text-red-500">{verifyRootError}</p>
              )}

              {successMessage && (
                <p className="text-sm text-green-600">{successMessage}</p>
              )}

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
                    setSuccessMessage(null);
                    requestForm.clearErrors();
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
