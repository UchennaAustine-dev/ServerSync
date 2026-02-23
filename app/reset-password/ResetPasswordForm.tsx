"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useResetPassword } from "@/lib/hooks/auth.hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Reset Password Form Component
 *
 * Requirements:
 * - 2.3: Validates the reset token from URL query parameters
 * - 2.4: Calls POST /auth/reset-password when user submits new password
 * - 2.5: Redirects to login page on success with success message
 * - 2.9: Displays error messages for invalid token or API failures
 */
export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPasswordMutation = useResetPassword();

  const [token, setToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Extract token from URL on mount
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setValidationError(
        "Invalid or missing reset token. Please request a new password reset link.",
      );
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return;
    }

    if (!token) {
      setValidationError("Invalid reset token");
      return;
    }

    resetPasswordMutation.mutate(
      {
        token,
        password: formData.password,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          // Redirect to login after 2 seconds
          setTimeout(() => {
            router.push("/login?reset=success");
          }, 2000);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-tr from-primary/5 to-rose-50/30 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
              <span className="font-heading font-black text-white text-2xl tracking-tighter">
                S
              </span>
            </div>
            <span className="text-2xl font-heading font-black text-secondary tracking-tight">
              ServeSync
            </span>
          </Link>
          <h1 className="text-4xl font-heading font-black text-secondary mb-3 tracking-tight leading-tight">
            Reset{" "}
            <span className="text-primary italic text-3xl">Password.</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            Enter your new password below.
          </p>
        </div>

        <Card className="border-gray-100 bg-white/70 backdrop-blur-2xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[40px] overflow-hidden">
          <CardHeader className="pt-10 pb-2 px-10">
            <CardTitle className="text-2xl font-black text-secondary">
              New Password
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground">
              Choose a strong password for your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10 pt-6">
            {isSuccess ? (
              <div className="space-y-6">
                <Alert className="rounded-2xl border-green-200 bg-green-50 text-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription className="text-sm font-bold">
                    Password reset successful! Redirecting to login...
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {(validationError || resetPasswordMutation.isError) && (
                  <Alert
                    variant="destructive"
                    className="rounded-2xl border-destructive/20 bg-destructive/5 text-destructive"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs font-bold">
                      {validationError ||
                        (resetPasswordMutation.error as any)?.response?.data
                          ?.message ||
                        "Failed to reset password. The reset link may have expired. Please request a new one."}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-primary/20 transition-all font-medium text-lg"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    disabled={resetPasswordMutation.isPending || !token}
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground ml-1 font-medium">
                    Must be at least 8 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-primary/20 transition-all font-medium text-lg"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    disabled={resetPasswordMutation.isPending || !token}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-16 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  disabled={resetPasswordMutation.isPending || !token}
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-50 bg-gray-50/30 py-8">
            <p className="text-sm text-muted-foreground font-medium">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-black text-secondary hover:text-primary transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center mt-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          ServeSync Redesign &copy; 2026
        </p>
      </div>
    </div>
  );
}
