import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import * as Sentry from "@sentry/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/modules/auth/auth.hooks";
import authBg from "@/assets/images/auth-bg.jpg";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().trim().min(1, "Email is required"),
  password: z.string().trim().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface RedirectState {
  from?: {
    pathname?: string;
  };
}

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setErrorMessage(null);

    try {
      const response = await loginMutation.mutateAsync(data);

      if (!response.success) {
        const errorMsg = response.message || "Login failed. Please try again.";
        setErrorMessage(errorMsg);
        
        Sentry.captureMessage("Failed sign-in attempt", {
          level: "warning",
          extra: {
            statusCode: 200,
            authProvider: "local",
            email: data.email,
            responseMessage: response.message,
          },
        });
        return;
      }

      const state = location.state as RedirectState | null;
      const nextPath = state?.from?.pathname || "/dashboard";

      navigate(nextPath, { replace: true });
    } catch (error) {
      setErrorMessage("Unable to sign in. Please verify your credentials.");
      
      let statusCode: number | undefined;
      let errorCode: string | undefined;
      let requestId: string | undefined;

      if (axios.isAxiosError(error)) {
        statusCode = error.response?.status;
        errorCode = error.response?.data?.code || error.response?.data?.errorCode;
        requestId = error.response?.headers?.["x-request-id"] ||
                    error.response?.headers?.["x-correlation-id"] ||
                    error.response?.headers?.["x-correlationid"];
      }

      const isExpectedAuthFailure = statusCode === 401 || statusCode === 403;

      if (isExpectedAuthFailure) {
        Sentry.captureMessage("Failed sign-in attempt", {
          level: "warning",
          extra: {
            statusCode,
            errorCode,
            authProvider: "local",
            requestId,
            email: data.email,
          },
        });
      } else {
        Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
          level: "error",
          extra: {
            statusCode,
            errorCode,
            authProvider: "local",
            requestId,
            email: data.email,
          },
        });
      }
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

      {/* Sign In Form */}
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-white px-12 py-10 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Sign In</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to continue to your admin workspace
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label
              htmlFor="email"
              className="text-sm font-normal text-gray-700"
            >
              E-mail or phone number
            </Label>
            <Input
              id="email"
              type="text"
              placeholder="Enter your email"
              {...register("email")}
              className="mt-1.5 h-12 rounded border-gray-200 placeholder:text-gray-400"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label
              htmlFor="password"
              className="text-sm font-normal text-gray-700"
            >
              Password
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className="h-12 rounded border-gray-200 pr-10 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {errorMessage ? (
            <p className="text-sm text-red-500">{errorMessage}</p>
          ) : null}

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="h-12 w-full bg-blue-500 text-base font-medium hover:bg-blue-600"
          >
            {loginMutation.isPending ? "Signing in..." : "Login"}
          </Button>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
