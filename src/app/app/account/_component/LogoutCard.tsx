"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut } from "lucide-react";


export function LogoutCard() {
const [confirming, setConfirming] = React.useState(false);


return (
<Card className="bg-neutral-900/60 backdrop-blur border-white/10">
<CardHeader className="flex flex-row items-center justify-between">
<div>
<CardTitle className="text-base">Logout</CardTitle>
<CardDescription className="text-zinc-400">Sign out of your account securely.</CardDescription>
</div>
<Button variant="destructive" className="gap-2" onClick={() => setConfirming(true)}>
<LogOut className="size-4" /> Logout
</Button>
</CardHeader>
<CardContent>
<p className="text-sm text-zinc-400">You can log out from this device. For security, consider logging out from all devices when using shared systems.</p>
</CardContent>


<Dialog open={confirming} onOpenChange={setConfirming}>
<DialogContent className="bg-neutral-950 border-white/10">
<DialogHeader>
<DialogTitle>Confirm logout</DialogTitle>
<DialogDescription>This is a demo. Wire this to your auth logic (e.g., revoke session, clear cookies, redirect).</DialogDescription>
</DialogHeader>
<DialogFooter>
<Button variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
<Button
variant="destructive"
onClick={() => {
setConfirming(false);
console.log("Logout clicked");
}}
>
<LogOut className="mr-2 size-4" /> Logout now
</Button>
</DialogFooter>
</DialogContent>
</Dialog>
</Card>
);
}