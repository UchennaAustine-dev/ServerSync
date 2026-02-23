// app/login/LoginForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLogin } from "@/lib/hooks/auth.hooks";
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
import {
  useScreenReaderAnnouncement,
  useLoadingAnnouncement,
  useErrorAnnouncement,
} from "@/lib/hooks/useAccessibility";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const { announceSuccess } = useScreenReaderAnnouncement();

  // Announce loading and error states
  useLoadingAnnouncement(loginMutation.isPending, "Signing in");
  useErrorAnnouncement(
    loginMutation.isError
      ? (loginMutation.error as any)?.response?.data?.message ||
          "Invalid email or password"
      : null,
  );

  // Check for password reset success
  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      setShowResetSuccess(true);
      announceSuccess("Password reset successful! You can now log in.");
      // Hide message after 5 seconds
      setTimeout(() => setShowResetSuccess(false), 5000);
    }
  }, [searchParams, announceSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    loginMutation.mutate(formData, {
      onSuccess: () => {
        router.push("/dashboard");
      },
    });
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Abstract Background Shapes */}
      <div
        className="absolute top-0 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-tr from-primary/5 to-rose-50/30 rounded-full blur-3xl -z-10"
        aria-hidden="true"
      />

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
            Welcome <span className="text-primary italic text-3xl">Back.</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            Your next great meal is just a login away.
          </p>
        </div>

        <Card className="border-gray-100 bg-white/70 backdrop-blur-2xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[40px] overflow-hidden">
          <CardHeader className="pt-10 pb-2 px-10">
            <div className="p-4 rounded-3xl bg-secondary/5 border border-secondary/5 mb-6">
              <p className="text-xs font-bold text-secondary flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                DEMO ACCESS
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Email:{" "}
                <span className="text-secondary font-black">
                  demo@serversync.com
                </span>{" "}
                <br />
                Pass:{" "}
                <span className="text-secondary font-black">password</span>
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-10 pb-10">
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              aria-label="Login form"
            >
              {showResetSuccess && (
                <Alert
                  className="rounded-2xl border-green-200 bg-green-50 text-green-800"
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <AlertDescription className="text-xs font-bold">
                    Password reset successful! You can now log in with your new
                    password.
                  </AlertDescription>
                </Alert>
              )}

              {loginMutation.isError && (
                <Alert
                  variant="destructive"
                  className="rounded-2xl border-destructive/20 bg-destructive/5 text-destructive"
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  <AlertDescription className="text-xs font-bold">
                    {(loginMutation.error as any)?.response?.data?.message ||
                      "Invalid email or password. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@serversync.com"
                  className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-primary/20 transition-all font-medium text-lg"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={loginMutation.isError}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label
                    htmlFor="password"
                    className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                  >
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all"
                  >
                    Forgot?
                  </Link>
                </div>
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
                  autoComplete="current-password"
                  aria-required="true"
                  aria-invalid={loginMutation.isError}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-16 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                disabled={loginMutation.isPending}
                aria-busy={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2
                      className="mr-3 h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Entering...</span>
                  </>
                ) : (
                  "Sign In to ServeSync"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-50 bg-gray-50/30 py-8">
            <p className="text-sm text-muted-foreground font-medium">
              New to ServeSync?{" "}
              <Link
                href="/register"
                className="font-black text-secondary hover:text-primary transition-colors"
              >
                Create an account
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
