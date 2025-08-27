// 'use client';
// import React from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { LogOut } from "lucide-react";
// import axios from "axios";
// import { serverUrl } from "@/constant/config";
// import { toast } from "sonner";
// import clearLocalStorage from "./serverfunc";

// export function LogoutCard() {
//   const [confirming, setConfirming] = React.useState(false);
//   const handleLogout = () => {
//     const tid = toast.loading("Logging out...");
//     try {
//       setConfirming(false);
//     //   localStorage.clear();
//       axios
//         .get(`${serverUrl}/logout`, { withCredentials: true })
//         .then((res) => {
//           console.log(res.data);
//             clearLocalStorage();
//           toast.success("Logged out successfully", { id: tid });
//         });
//       console.log("Logout clicked");
//     } catch {
//       toast.error("Error logging out", { id: tid });
//     }
//   };

//   return (
//     <Card className="bg-neutral-900/60 backdrop-blur border-white/10">
//       <CardHeader className="flex flex-row items-center justify-between">
//         <div>
//           <CardTitle className="text-base">Logout</CardTitle>
//           <CardDescription className="text-zinc-400">
//             Sign out of your account securely.
//           </CardDescription>
//         </div>
//         <Button
//           variant="destructive"
//           className="gap-2"
//           onClick={() => setConfirming(true)}
//         >
//           <LogOut className="size-4" /> Logout
//         </Button>
//       </CardHeader>
//       <CardContent>
//         <p className="text-sm text-zinc-400">
//           You can log out from this device. For security, consider logging out
//           from all devices when using shared systems.
//         </p>
//       </CardContent>

//       <Dialog open={confirming} onOpenChange={setConfirming}>
//         <DialogContent className="bg-neutral-950 border-white/10">
//           <DialogHeader>
//             <DialogTitle>Confirm logout</DialogTitle>
//             <DialogDescription>
//               Are you sure you want to logout? You will need to log in again to
//               access your account.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button variant="ghost" onClick={() => setConfirming(false)}>
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={() =>handleLogout}
//             >
//               <LogOut className="mr-2 size-4" /> Logout now
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </Card>
//   );
// }

"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogOut } from "lucide-react";
import axios from "axios";
import { serverApiUrl } from "@/constant/config";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function clearAllStorage() {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {}
}

export function LogoutCard() {
  const [confirming, setConfirming] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (pending) return;
    setPending(true);
    const tid = toast.loading("Logging out...");
    setConfirming(false);

    try {
      await axios.get(`${serverApiUrl}/logout`, {
        withCredentials: true,
      });

      clearAllStorage();
      toast.success("Logged out successfully", { id: tid });

      router.replace("/app/home");
      router.refresh();
    } catch(error) {
      toast.error(`Error logging out: ${error}`, { id: tid });
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="bg-neutral-900/60 backdrop-blur border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Logout</CardTitle>
          <CardDescription className="text-zinc-400">
            Sign out of your account securely.
          </CardDescription>
        </div>
        <Button
          variant="destructive"
          className="gap-2"
          onClick={() => setConfirming(true)}
          disabled={pending}
        >
          <LogOut className="size-4" /> Logout
        </Button>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-zinc-400">
          You can log out from this device. For security, consider logging out
          from all devices when using shared systems.
        </p>
      </CardContent>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="bg-neutral-950 border-white/10">
          <DialogHeader>
            <DialogTitle>Confirm logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to log in again to
              access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirming(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={pending}
            >
              <LogOut className="mr-2 size-4" />
              {pending ? "Logging out..." : "Logout now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
