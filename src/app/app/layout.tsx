"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "../_component/NavBar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Hide navbar on stock detail pages (TradingView chart)
  const hideNavbar = pathname?.startsWith("/app/stock/");

  return (
    // `min-h-screen`, not `h-screen`: with a hard height and an `h-full` main,
    // any page taller than the viewport was laid out inside a box it had
    // already outgrown.
    <div className="min-h-screen w-full">
      <main className="w-full">{children}</main>
      {!hideNavbar && (
        // The bar floats over the board — pages reserve room for it with
        // `pb-navbar` on their own inner container (see globals.css), so the
        // last row of content is not left underneath it.
        <footer className="fixed inset-x-0 bottom-0 z-50">
          <Navbar />
        </footer>
      )}
    </div>
  );
};

export default MainLayout;
