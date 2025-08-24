"use client";
import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import type { User } from "./types";
import { EditUserDialog } from "./EditUserDialog";

function UserAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const initials = useMemo(() => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [name]);

  return (
    <div className="relative inline-flex size-14 items-center justify-center rounded-full bg-gradient-to-b from-neutral-800 to-neutral-900 ring-1 ring-white/10">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name}
          className="size-14 rounded-full object-cover"
        />
      ) : (
        <span className="text-lg font-semibold text-zinc-200">{initials}</span>
      )}
      <span className="absolute -inset-px rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_8px_20px_rgba(0,0,0,0.6)]" />
    </div>
  );
}
export function UserCard({ defaultUser }: { defaultUser: User }) {
  const [user, setUser] = useState<User>(defaultUser);
  const [open, setOpen] = useState(false);

  return (
    <Card className="bg-neutral-900/60 backdrop-blur border-white/10">
      <CardHeader className="flex flex-row items-center gap-4">
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
        <div className="space-y-1">
          <CardTitle className="text-base">{user.name}</CardTitle>
          <CardDescription className="text-zinc-400">
            {user.email}
          </CardDescription>
          {!!user.handle && (
            <p className="text-xs text-zinc-500">{user.handle}</p>
          )}
          {!!user.joinedAt && (
            <p className="text-xs text-zinc-500">
              Joined: {new Date(user.joinedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => setOpen(true)}
          >
            <Edit3 className="size-4" />
            Edit Profile
          </Button>
        </div>
      </CardContent>

      <EditUserDialog
        open={open}
        user={user}
        onOpenChange={setOpen}
        onSave={(u) => {
          setUser(u);
          setOpen(false);
        }}
      />
    </Card>
  );
}
