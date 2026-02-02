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
import { useState } from "react";
import axios from "axios";
import { serverApiUrl } from "@/constant/config";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/ContextApi";

const SignUp = () => {
  const router = useRouter();
  const { setIsAuthed } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const SignupHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !name) {
      toast.error("Please fill all the fields");
      return;
    }
    const idtoast = toast.loading("Signing Up");
    try {
      const res = await axios.post(
        `${serverApiUrl}/signup`,
        { name, email, password },
        { withCredentials: true },
      );
      if (res.status === 200) {
        toast.success("Sign up successful", { id: idtoast });
        setIsAuthed(true);
        router.push("/app/home");
      }
    } catch (error) {
      toast.error("Something Went wrong", { id: idtoast });
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <h1 className="text-6xl font-bold p-5 mb-3 text-yellow-400">
        Stock Labs
      </h1>
      <Card className="w-full max-w-sm ">
        <CardHeader>
          <CardTitle>Craete Your Account</CardTitle>
          <CardDescription>Enter Details to SignUp</CardDescription>
          <CardAction>
            <Link href={"/login"}>
              <Button variant="link" className="text-black-600">
                Sign In
              </Button>
            </Link>
          </CardAction>
        </CardHeader>
        <form onSubmit={(e) => SignupHandler(e)}>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="text"
                  type="text"
                  placeholder="Enter Your Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter Your Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 mt-5">
            <Button type="submit" className="w-full bg-amber-500">
              SignUp
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignUp;
