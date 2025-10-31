"use client";

import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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



export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string }>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(undefined);

    // simple client-side checks
    if (!email || !email.includes("@")) {
      setMsg({ type: "error", text: "Please enter a valid email." });
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
      const url = `${serverApiUrl}/forget`;
      const res = await axios.post(url, { email, password });

      if (res.status === 200) {
        setMsg({
          type: "success",
          text: "Password reset successful. You can now sign in.",
        });
        toast.success(res?.data?.message || "Password reset successful.");
        setPassword("");
        setEmail("");
        window.location.href = "/login";
      } else {
        setMsg({
          type: "error",
          text: "Something went wrong. Please try again.",
        });
      }
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to reset password.";
      setMsg({ type: "error", text: serverMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email and a new password to reset your account password.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4">
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
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-0 grid place-items-center px-3 text-muted-foreground hover:text-foreground"
                aria-label={showPw ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {msg?.text && (
            <p
              className={`text-sm ${
                msg.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {msg.text}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex justify-center w-full mt-2">
          <Button type="submit" disabled={loading} aria-busy={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

