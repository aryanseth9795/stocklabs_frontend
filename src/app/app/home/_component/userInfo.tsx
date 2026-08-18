"use client";
import React from "react";
import Link from "next/link";
import { DollarSignIcon, User, Wallet, LogIn } from "lucide-react";

const nf = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const UserInfo = ({
  user,
  Auth,
}: {
  user: { name: string; walletAmount: number; portfolioAmount: number };
  Auth: boolean;
}) => {
  return Auth ? (
    <div className="w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-6 md:p-8 shadow-2xl">
      <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight mb-5 sm:mb-6 flex items-center gap-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
        Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
        {/* Each tile is icon + text on one row. The text column carries
            `min-w-0` so a long name or a seven-figure balance truncates inside
            the tile rather than widening it past the card. */}
        <div className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
          <div className="shrink-0 rounded-xl bg-white/10 p-2.5 sm:p-3">
            <User className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-white/60">
              User
            </p>
            <p className="truncate text-base md:text-lg font-medium">
              {user.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
          <div className="shrink-0 rounded-xl bg-white/10 p-2.5 sm:p-3">
            <Wallet className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-white/60">
              Wallet Balance
            </p>
            <p className="truncate text-base md:text-lg font-medium">
              ₹{nf.format(user.walletAmount)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
          <div className="shrink-0 rounded-xl bg-white/10 p-2.5 sm:p-3">
            <DollarSignIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-white/60">
              Portfolio
            </p>
            <p className="truncate text-base md:text-lg font-medium">
              ₹{nf.format(user.portfolioAmount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  ) : (
    /* Two nested p-8s put 4rem of padding on each side of a 328px phone,
       leaving the copy a ~200px column and stretching the empty state well
       past the fold. The padding starts small and opens up with the viewport. */
    <div className="w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-8 md:p-10 shadow-2xl">
      <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight mb-5 sm:mb-6 flex items-center gap-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-rose-400" />
        Overview
      </h1>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 md:p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          <LogIn size={28} />
        </div>
        <p className="text-base sm:text-lg md:text-xl font-semibold mb-2">
          Log in to see your dashboard
        </p>
        <p className="text-sm text-white/70 mb-6">
          Access your portfolio, wallet balance, and personalized insights after
          you sign in.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 py-3 font-medium hover:bg-white/20 transition"
        >
          <LogIn size={18} />
          Login
        </Link>
      </div>
    </div>
  );
};

export default UserInfo;
