// File: src/app/app/account/page.tsx
"use client";
import React from "react";
import { UserCard, PLCard, LogoutCard } from "./_component";
import type { User, PLPoint } from "./_component/types";

const demoUser: User = {
  name: "Aryan Seth",
  email: "aryan@example.com",
  handle: "@aryan",
  joinedAt: "2024-11-02",
};

const demoPL: PLPoint[] = Array.from({ length: 90 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (89 - i));
  const base = Math.sin(i / 7) * 1200 + Math.random() * 400 - 200;
  return { date: d.toISOString().slice(0, 10), value: Math.round(base) };
});

export default function AccountPage() {
  return (
    <div className="min-h-screen w-full bg-neutral-950 text-zinc-100 mb-20">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
            <p className="text-sm text-zinc-400">
              Manage your profile, review P/L, and logout.
            </p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <UserCard defaultUser={demoUser} />
          </div>

          <div className="lg:col-span-2">
            <PLCard data={demoPL} />
          </div>
        </div>

        <div className="mt-10 mb-20">
          <LogoutCard />
        </div>
      </div>
    </div>
  );
}
