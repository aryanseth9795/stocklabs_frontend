

"use client";
import { useState } from "react";
import { House, BriefcaseBusiness, Search, User, ChartCandlestick } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
  const [active, setActive] = useState("Home");

  const navItems = [
    { name: "Home", Icon: House },
    { name: "Portfolio", Icon: BriefcaseBusiness },
    { name: "Search", Icon: Search },
    { name: "History", Icon: ChartCandlestick },
    { name: "Account", Icon: User },
  ];

  return (
    <div className="sticky bottom-0 z-50 w-full border-t border-white/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-black/40 text-white">
      <nav className="mx-auto max-w-3xl">
        <ul className="relative grid grid-cols-5 gap-1 px-3 py-2">
          {navItems.map(({ name, Icon }) => {
            const isActive = active === name;
            return (
              <li key={name} className="relative">
                <Link
                  href={`/app/${name.toLowerCase()}`}
                  className={`group flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition ${
                    isActive ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                  onClick={() => setActive(name)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="relative">
                    <Icon size={24} className="transition group-hover:scale-105" />
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute -inset-3 -z-10 rounded-2xl bg-gradient-to-br from-indigo-400/15 via-cyan-300/10 to-emerald-300/15 blur-md"
                      />
                    )}
                  </div>
                  <span className="text-[11px] leading-none">{name}</span>
                </Link>
                {isActive && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-300"
                  />
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
