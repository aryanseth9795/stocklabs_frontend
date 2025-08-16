"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import axios from "axios";
import { serverApiUrl } from "@/constant/config";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const Loginhandler = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("login");
    if (!email || !password) {
      toast.error("Please fill all the fields");
    }
    const idtoast = toast.loading("Logging in");
    try {
      await axios.post(
        `${serverApiUrl}/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );
      toast.success("Login successful", { id: idtoast });

      router.push("/app/home");
    } catch (error) {
      toast.error("Something went wrong", { id: idtoast });
      console.log(error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("Auth") === "true") {
      router.push("/app/home");
    }
  }, [router]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <h1 className="text-6xl font-bold p-5 mb-3 text-yellow-400">
        Stock Labs
      </h1>
      <Card className="w-full max-w-sm ">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter Details to login</CardDescription>
          <CardAction>
            <Link href={"/signup"}>
              <Button variant="link" className="text-black-600">
                Sign Up
              </Button>
            </Link>
          </CardAction>
        </CardHeader>
        <form onSubmit={(e) => Loginhandler(e)}>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter Your Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 mt-5">
            <Button type="submit" className="w-full bg-yellow-400">
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
