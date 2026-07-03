import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} from "@/modules/auth/auth.hooks";
import authBg from "@/assets/images/auth-bg.jpg";
import { Eye, EyeOff, ArrowLeft, Mail, ShieldCheck, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

type ForgotStep = "EMAIL" | "OTP" | "RESET" | "SUCCESS";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ForgotStep>("EMAIL");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OTP inputs state
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // New password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");

  // Mutations
  const forgotPasswordMutation = useForgotPasswordMutation();
  const verifyOtpMutation = useVerifyOtpMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === "OTP" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Handle OTP focus shifting
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Allow numbers only

    const newOtp = [...otp];
    // Keep only the last character entered
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input if a number is entered
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Focus previous input if current is empty on backspace
        otpRefs.current[index - 1]?.focus();
      } else {
        // Clear current value
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return; // Only process exactly 6 digits

    const pastedDigits = pastedData.split("");
    setOtp(pastedDigits);

    // Focus the last input box
    otpRefs.current[5]?.focus();
  };

  // Password strength checks
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const passwordsMatch = newPassword && newPassword === confirmPassword;

  const getStrengthPercent = () => {
    let score = 0;
    if (hasMinLength) score += 25;
    if (hasNumber) score += 25;
    if (hasSpecialChar) score += 25;
    if (hasUppercase) score += 25;
    return score;
  };

  const getStrengthLabel = (strength: number) => {
    if (strength === 0) return "Too Short";
    if (strength <= 25) return "Weak";
    if (strength <= 75) return "Medium";
    return "Strong";
  };

  const strengthPercent = getStrengthPercent();

  // Step 1: Send OTP Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await forgotPasswordMutation.mutateAsync({ email });
      if (response.success) {
        setSuccessMessage(response.message || "Verification code sent to your email!");
        setStep("OTP");
        setResendTimer(60);
        setCanResend(false);
      } else {
        setErrorMessage(response.message || "Failed to send verification code.");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Something went wrong. Please check your email address."
      );
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (!canResend) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setOtp(Array(6).fill(""));

    try {
      const response = await forgotPasswordMutation.mutateAsync({ email });
      if (response.success) {
        setSuccessMessage("Verification code resent successfully!");
        setResendTimer(60);
        setCanResend(false);
        otpRefs.current[0]?.focus();
      } else {
        setErrorMessage(response.message || "Failed to resend verification code.");
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "Failed to resend verification code.");
    }
  };

  // Step 2: Verify OTP Submit
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setErrorMessage("Please enter a valid 6-digit OTP code.");
      return;
    }

    try {
      const response = await verifyOtpMutation.mutateAsync({
        email,
        otp: otpCode,
      });

      if (response.success && response.data?.resetToken) {
        setResetToken(response.data.resetToken);
        setSuccessMessage("OTP verified successfully!");
        setStep("RESET");
      } else {
        setErrorMessage(response.message || "Invalid or expired OTP code.");
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "Verification failed. Please try again.");
    }
  };

  // Step 3: Reset Password Submit
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (strengthPercent < 100) {
      setErrorMessage("Please fulfill all password strength requirements.");
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await resetPasswordMutation.mutateAsync({
        resetToken,
        newPassword,
      });

      if (response.success) {
        setStep("SUCCESS");
        // Automatically redirect to Sign In after 2.5 seconds
        setTimeout(() => {
          navigate("/sign-in");
        }, 2500);
      } else {
        setErrorMessage(response.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "Reset failed. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authBg})` }}
      >
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-xl bg-white/95 shadow-2xl backdrop-blur-md p-10 sm:p-12 border border-white/20 transition-all duration-300">
        
        {/* Back navigation button (only if not completed) */}
        {step !== "SUCCESS" && (
          <button
            onClick={() => {
              if (step === "OTP") setStep("EMAIL");
              else if (step === "RESET") setStep("OTP");
              else navigate("/sign-in");
            }}
            className="group absolute top-8 left-8 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
        )}

        {/* --- Step 1: Email Input --- */}
        {step === "EMAIL" && (
          <div>
            <div className="mb-8 text-center mt-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                No worries! Enter your email below and we will send you a 6-digit OTP verification code.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-lg border-gray-200 pl-4 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="h-12 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-base font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-75"
              >
                {forgotPasswordMutation.isPending ? "Sending OTP..." : "Send Verification Code"}
              </Button>
            </form>
          </div>
        )}

        {/* --- Step 2: Verify OTP --- */}
        {step === "OTP" && (
          <div>
            <div className="mb-8 text-center mt-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Security Verification</h1>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                We sent a 6-digit code to <span className="font-semibold text-gray-900">{email}</span>. Please enter it below.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="flex justify-between gap-2.5" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpRefs.current[idx] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-xl font-bold text-gray-900 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm"
                  />
                ))}
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={verifyOtpMutation.isPending}
                className="h-12 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-base font-semibold transition-all shadow-md"
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify Code"}
              </Button>

              <div className="text-center pt-2">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Resend Verification Code
                  </button>
                ) : (
                  <p className="text-sm text-gray-500 font-medium">
                    Resend code in <span className="font-semibold text-blue-600">{resendTimer}s</span>
                  </p>
                )}
              </div>
            </form>
          </div>
        )}

        {/* --- Step 3: Reset Password --- */}
        {step === "RESET" && (
          <div>
            <div className="mb-6 text-center mt-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
                <KeyRound className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
              <p className="mt-2 text-sm text-gray-500">
                Choose a strong password that you haven't used before.
              </p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-5">
              {/* New Password */}
              <div>
                <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                  New Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-12 rounded-lg border-gray-200 pr-10 pl-4 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 rounded-lg border-gray-200 pr-10 pl-4 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Metre */}
              <div className="space-y-2.5 pt-1">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                  <span>Strength: {getStrengthLabel(strengthPercent)}</span>
                  <span>{strengthPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      strengthPercent <= 25
                        ? "bg-red-500"
                        : strengthPercent <= 50
                        ? "bg-orange-500"
                        : strengthPercent <= 75
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${strengthPercent}%` }}
                  />
                </div>

                {/* Validation checklist */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-1 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className={hasMinLength ? "text-green-600 font-bold" : "text-gray-300"}>✓</span>
                    <span className={hasMinLength ? "text-gray-900" : ""}>Min 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={hasUppercase ? "text-green-600 font-bold" : "text-gray-300"}>✓</span>
                    <span className={hasUppercase ? "text-gray-900" : ""}>An uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={hasNumber ? "text-green-600 font-bold" : "text-gray-300"}>✓</span>
                    <span className={hasNumber ? "text-gray-900" : ""}>A number</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={hasSpecialChar ? "text-green-600 font-bold" : "text-gray-300"}>✓</span>
                    <span className={hasSpecialChar ? "text-gray-900" : ""}>Special character</span>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending || strengthPercent < 100 || !passwordsMatch}
                className="h-12 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-base font-semibold transition-all shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
              >
                {resetPasswordMutation.isPending ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          </div>
        )}

        {/* --- Step 4: Success Redirection --- */}
        {step === "SUCCESS" && (
          <div className="text-center py-6 animate-fade-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 mb-6 animate-scale-up">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Password Reset Completed!</h1>
            <p className="mt-3 text-sm text-gray-500 max-w-sm mx-auto">
              Your password has been successfully updated. You are now being redirected back to the login page to sign in.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-1.5 items-center">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
