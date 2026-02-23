"use client";

import { useState } from "react";
import Link from "next/link";
import { useForgotPassword } from "@/lib/hooks/auth.hooks";
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
import { AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Forgot Password Page
 *
 * Requirements:
 * - 2.1: Calls POST /auth/forgot-password when user submits form
 * - 2.2: Displays confirmation message on success
 * - 2.9: Displays error messages for invalid email or API failures
 */
export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPassword();
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setIsSuccess(true);
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
            Forgot{" "}
            <span className="text-primary italic text-3xl">Password?</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        <Card className="border-gray-100 bg-white/70 backdrop-blur-2xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[40px] overflow-hidden">
          <CardHeader className="pt-10 pb-2 px-10">
            <CardTitle className="text-2xl font-black text-secondary">
              Reset Password
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground">
              Enter your email and we'll send you a reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10 pt-6">
            {isSuccess ? (
              <div className="space-y-6">
                <Alert className="rounded-2xl border-green-200 bg-green-50 text-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription className="text-sm font-bold">
                    Check your email! We've sent password reset instructions to{" "}
                    <span className="font-black">{email}</span>
                  </AlertDescription>
                </Alert>
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground font-medium">
                    Didn't receive the email? Check your spam folder or try
                    again.
                  </p>
                  <Button
                    variant="outline"
                    className="rounded-2xl font-black"
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail("");
                    }}
                  >
                    Try Another Email
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {forgotPasswordMutation.isError && (
                  <Alert
                    variant="destructive"
                    className="rounded-2xl border-destructive/20 bg-destructive/5 text-destructive"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs font-bold">
                      {(forgotPasswordMutation.error as any)?.response?.data
                        ?.message ||
                        "Failed to send reset email. Please check your email address and try again."}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={forgotPasswordMutation.isPending}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-16 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-50 bg-gray-50/30 py-8">
            <Link
              href="/login"
              className="text-sm text-muted-foreground font-medium hover:text-secondary transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </CardFooter>
        </Card>

        <p className="text-center mt-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          ServeSync Redesign &copy; 2026
        </p>
      </div>
    </div>
  );
}
