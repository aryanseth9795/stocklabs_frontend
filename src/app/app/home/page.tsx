"use client";
import React, { useEffect, useCallback } from "react";
import UserInfo from "./_component/userInfo";
import StockCard from "./_component/stockCard";
import BuySellDialog from "./_component/buySellDialog";
import { getSocket } from "@/lib/socket";
import axios from "axios";
import { serverApiUrl } from "@/constant/config";
import { useAuth } from "@/lib/ContextApi";
import { toast } from "sonner";

function Home() {
  interface Stock {
    stockName: string;
    stocksymbol: string;
    stockPrice: number;
    stockPriceINR: number;
    stockChange: number;
    stockChangeINR: number;
    stockChangePercentage: number;
    ts: string;
  }

  const { user, setUser, setIsAuthed, isAuthed } = useAuth();
  const [data, setData] = React.useState<Stock[]>([]);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Stock | null>(null);

  const handleUpdate = useCallback((payload: Stock[]) => {
    setData(payload);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socket.on("landing", handleUpdate);
    socket.emit("landing");
    return () => {
      socket.off("landing", handleUpdate);
    };
  }, [handleUpdate]);

  const fetchUserDetail = useCallback(async () => {
    const tId = toast.loading("Loading...");
    try {
      const detail = await axios.get(`${serverApiUrl}/me`, {
        withCredentials: true,
      });
      toast.success(detail.data.message, { id: tId });
      setUser(detail.data.user);
      setIsAuthed(true);
      return true;
    } catch (error) {
      toast.error("Login For More Features !", { id: tId });
    
      return false;
    }
  }, [setIsAuthed, setUser]);

  useEffect(() => {
    if (
      localStorage.getItem("Auth") === "false" ||
      localStorage.getItem("Auth") === null
    ) {
      fetchUserDetail().then((res) => {
        console.log("User detail fetched:", res);
        if (res) {
          localStorage.setItem("Auth", "true");
        } else {
          localStorage.setItem("Auth", "false");
        }
      });
    } else {
      fetchUserDetail();
    }
  }, []);

  

  const onCardClick = (s: Stock) => {
    setSelected(s);
    setOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-500/40 via-cyan-400/25 to-emerald-400/25" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.10),rgba(0,0,0,0))]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex flex-col gap-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-5 flex items-center justify-between">
          <div className="text-sm sm:text-base text-white/80">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs mr-3">
              Dashboard
            </span>
            Learn, Trade, Win – Without the Risk.
          </div>
        </div>

        <UserInfo
          user={{
            name: String(user?.name),
            walletAmount: Number(user?.balance),
            portfolioAmount: Number(user?.totalInvested),
          }}
          Auth={isAuthed}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {data?.map((stock, index) => (
            <StockCard
              key={index}
              stock={stock}
              onClick={() => onCardClick(stock)}
            />
          ))}
        </div>
      </div>

      {open && (
        <BuySellDialog
          open={open}
          onOpenChange={setOpen}
          stock={selected}
          walletUSD={Number(user?.balance) || 0}
          userId={user?.id || ""}
          accountfetch={fetchUserDetail}
        />
      )}
    </div>
  );
}

export default Home;
