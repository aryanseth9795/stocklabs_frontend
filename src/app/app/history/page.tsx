"use client";

import React, { useEffect, useState } from "react";
import Toggle from "./_component/toggle";
import axios from "axios";
import { serverApiUrl } from "@/constant/config";
import TradeCard from "./_component/tradeCard";
import TxCard from "./_component/txCard";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const History = () => {
  const [isTrade, setIsTrade] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState([]);
  const [isAuthed, setIsAuthed] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("Auth")) setIsAuthed(true);
    else setIsAuthed(false);
  }, []);

  useEffect(() => {
    if (!isAuthed) return;
    try {
      setIsLoading(true);
      if (isTrade) {
        axios
          .get(`${serverApiUrl}/tradehistory`, { withCredentials: true })
          .then((res) => {
            setData(res.data);
            setIsLoading(false);
          });
      } else {
        axios
          .get(`${serverApiUrl}/transactions`, { withCredentials: true })
          .then((res) => {
            setData(res.data);
            setIsLoading(false);
          });
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }, [isTrade, isAuthed]);

  return (
    <div className="p-6 md:p-8">
      <div className="sticky top-0 z-10 bg-background/60 backdrop-blur-sm pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {isTrade ? "Trade History" : "Transaction History"}
          </h2>
          <Toggle isTrade={isTrade} setIsTrade={setIsTrade} />
        </div>
      </div>

      {isAuthed ? (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border bg-white/40 dark:bg-neutral-900/40 p-5 shadow-sm"
              >
                <div className="h-5 w-1/3 rounded bg-gray-300/60 dark:bg-neutral-700/60 mb-4" />
                <div className="h-4 w-2/3 rounded bg-gray-300/60 dark:bg-neutral-700/60 mb-2" />
                <div className="h-4 w-1/2 rounded bg-gray-300/60 dark:bg-neutral-700/60" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {data && data.length > 0 ? (
              isTrade ? (
                data.map((t, idx) => <TradeCard key={idx} trade={t} />)
              ) : (
                data.map((x, idx) => <TxCard key={idx} tx={x} />)
              )
            ) : (
              <div className="col-span-full rounded-2xl border p-8 text-center text-sm text-muted-foreground">
                {isTrade ? "No trades found." : "No transactions found."}
              </div>
            )}
          </div>
        )
      ) : null}

      {/* Auth dialog */}
      <Dialog open={!isAuthed}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock size={18} /> Login required
            </DialogTitle>
            <DialogDescription>
              Login first to access your Transaction or Trade.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
