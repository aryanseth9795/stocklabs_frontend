"use client";

import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { serverApiUrl } from "@/constant/config";
import { toast } from "sonner";
import { errorMessage } from "@/lib/format";

/**
 * Password reset — a two-step OTP flow.
 *
 * This page used to POST { email, password } to /forget, which is only step 1
 * (send an OTP). The server ignored the password field, so the reset never
 * happened — yet the page announced "Password reset successful" and redirected
 * to login. Users were locked out with an unexplained OTP in their inbox
 * (review F-02). The mobile app implements the correct flow; this now matches.
 *
 *   1. POST /forget         { email }                      → emails a 6-digit OTP
 *   2. POST /forget/verify  { email, otp, newPassword }    → changes the password
 */
type Step = "email" | "otp";

export default function ForgotPasswordForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string }>();

  // ─── Step 1: request an OTP ────────────────────────────────────────────────
  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(undefined);

    if (!email || !email.includes("@")) {
      setMsg({ type: "error", text: "Please enter a valid email." });
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${serverApiUrl}/forget`, { email });

      // The server answers generically whether or not the address exists, so we
      // move to step 2 either way rather than confirming which emails are
      // registered.
      setStep("otp");
      setMsg({
        type: "success",
        text:
          res?.data?.message ||
          "If that email exists, an OTP has been sent. It is valid for 10 minutes.",
      });
      toast.success("Check your inbox for the OTP.");
    } catch (err) {
      const text = errorMessage(err, "Unable to send the OTP.");
      setMsg({ type: "error", text });
      toast.error(text);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: verify the OTP and set the new password ───────────────────────
  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(undefined);

    if (!otp.trim() || otp.trim().length !== 6) {
      setMsg({ type: "error", text: "Enter the 6-digit OTP from your email." });
      return;
    }
    if (!password || password.length < 6) {
      setMsg({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      return;
    }

    try {
      setLoading(true);
      // Only THIS call changes the password. Success is claimed only after it
      // returns successfully.
      await axios.post(`${serverApiUrl}/forget/verify`, {
        email,
        otp: otp.trim(),
        newPassword: password,
      });

      toast.success("Password reset successfully. You can now sign in.");
      setPassword("");
      setOtp("");
      router.push("/login");
    } catch (err) {
      const text = errorMessage(err, "Unable to reset password.");
      setMsg({ type: "error", text });
      toast.error(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>
          {step === "email" ? "Forgot Password" : "Enter OTP"}
        </CardTitle>
        <CardDescription>
          {step === "email"
            ? "Enter your email and we'll send you a one-time code."
            : `Enter the 6-digit code sent to ${email} and choose a new password.`}
        </CardDescription>
      </CardHeader>

      <form onSubmit={step === "email" ? requestOtp : resetPassword} noValidate>
        <CardContent className="space-y-4">
          {step === "email" ? (
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="otp">One-Time Code</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  disabled={loading}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {msg && (
            <p
              className={`text-sm ${
                msg.type === "error" ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {msg.text}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-2 mt-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {step === "email" ? "Send OTP" : "Reset Password"}
          </Button>

          {step === "otp" && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={loading}
              onClick={() => {
                setStep("email");
                setOtp("");
                setMsg(undefined);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Use a different email
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
