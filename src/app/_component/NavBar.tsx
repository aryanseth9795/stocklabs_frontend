"use client";
import {
  House,
  BriefcaseBusiness,
  User,
  ChartCandlestick,
  Gem,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/ContextApi";

const nameMap: Record<string, string> = {
  home: "Home",
  commodities: "Commodities",
  portfolio: "Portfolio",
  history: "History",
  account: "Account",
};

const Navbar = () => {
  const pathname = usePathname();
  const { isAuthed } = useAuth();
  const parts = (pathname || "/").split("/").filter(Boolean);
  const appIdx = parts.indexOf("app");
  const seg = appIdx >= 0 && parts[appIdx + 1] ? parts[appIdx + 1] : "home";
  const active = nameMap[seg.toLowerCase()] ?? "Home";

  /**
   * Five tabs, always.
   *
   * Login used to be a sixth <li> appended to a `grid-cols-5` list, so on a
   * logged-out phone it fell onto a second row on its own and doubled the
   * height of the bar. It takes the Account slot instead: a signed-out visitor
   * cannot use /app/account anyway — it renders a blurred page behind a "Login
   * Required" dialog whose only real action is that same /login link.
   */
  const navItems = [
    { name: "Home", href: "/app/home", Icon: House, accent: false },
    { name: "Commodities", href: "/app/commodities", Icon: Gem, accent: false },
    {
      name: "Portfolio",
      href: "/app/portfolio",
      Icon: BriefcaseBusiness,
      accent: false,
    },
    {
      name: "History",
      href: "/app/history",
      Icon: ChartCandlestick,
      accent: false,
    },
    isAuthed
      ? { name: "Account", href: "/app/account", Icon: User, accent: false }
      : { name: "Login", href: "/login", Icon: LogIn, accent: true },
  ];

  return (
    <div className="w-full border-t border-white/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-black/40 text-white pb-[env(safe-area-inset-bottom)]">
      <nav className="mx-auto max-w-3xl">
        {/* `grid-flow-col auto-cols-fr` splits the row evenly across however
            many tabs there are, so nothing can wrap onto a second line. */}
        <ul className="relative grid grid-flow-col auto-cols-fr gap-0.5 px-1 py-2 sm:gap-1 sm:px-3">
          {navItems.map(({ name, href, Icon, accent }) => {
            const isActive = active === name;
            return (
              <li key={name} className="relative min-w-0">
                <Link
                  href={href}
                  className={`group flex flex-col items-center justify-center gap-1 rounded-2xl px-0 py-2 transition sm:px-2 ${
                    accent
                      ? "text-emerald-400 hover:text-emerald-300"
                      : isActive
                        ? "text-white"
                        : "text-white/70 hover:text-white"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="relative">
                    <Icon
                      size={24}
                      className="transition group-hover:scale-105"
                    />
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute -inset-3 -z-10 rounded-2xl bg-gradient-to-br from-indigo-400/15 via-cyan-300/10 to-emerald-300/15 blur-md"
                      />
                    )}
                  </div>
                  {/* "Commodities" is eleven characters of Merriweather in a
                      fifth of a phone: at a flat 11px it overran its cell and
                      crowded its neighbour. The size tracks the viewport
                      instead, and truncate is the backstop. */}
                  <span className="w-full truncate text-center text-[clamp(9px,2.6vw,11px)] leading-none tracking-tight sm:tracking-normal">
                    {name}
                  </span>
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
