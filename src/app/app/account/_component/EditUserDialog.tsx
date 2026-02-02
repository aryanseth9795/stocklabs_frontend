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
import { Edit3, User2, Loader2 } from "lucide-react";
import type { User } from "./types";
import axios from "axios";
import { serverApiUrl } from "@/constant/config";
import { toast } from "sonner";

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
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => setLocal(user), [user]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    const tid = toast.loading("Saving profile...");

    try {
      const response = await axios.put(
        `${serverApiUrl}/profile`,
        {
          name: local.name,
          email: local.email,
        },
        { withCredentials: true },
      );

      if (response.data) {
        toast.success("Profile updated successfully", { id: tid });
        onSave(local);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", { id: tid });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User2 className="size-4" /> Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile details. Changes will be saved to your account.
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
              disabled={saving}
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
              disabled={saving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            className="gap-2 text-black"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Edit3 className="size-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
