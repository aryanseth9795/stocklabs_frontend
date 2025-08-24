"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit3, User2 } from "lucide-react";
import type { User } from "./types";

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: User;
  onSave: (u: User) => void;
}) {
  const [local, setLocal] = React.useState<User>(user);
  React.useEffect(() => setLocal(user), [user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-950 border-white/10  text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User2 className="size-4" /> Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your basic details. Changes are local in this demo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={local.name}
              onChange={(e) => setLocal({ ...local, name: e.target.value })}
              className="bg-neutral-900 border-white/10"
              placeholder="Your name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={local.email}
              onChange={(e) => setLocal({ ...local, email: e.target.value })}
              className="bg-neutral-900 border-white/10"
              placeholder="you@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="handle">Handle</Label>
            <Input
              id="handle"
              value={local.handle ?? ""}
              onChange={(e) => setLocal({ ...local, handle: e.target.value })}
              className="bg-neutral-900 border-white/10"
              placeholder="@username"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="gap-2 text-black" onClick={() => onSave(local)}>
            <Edit3 className="size-4" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
