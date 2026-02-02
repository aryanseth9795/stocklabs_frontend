"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "../_component/NavBar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Hide navbar on stock detail pages (TradingView chart)
  const hideNavbar = pathname?.startsWith("/app/stock/");

  return (
    <div className="h-screen w-full">
      <main className="h-full w-full">{children}</main>
      {!hideNavbar && (
        <footer className="text-center fixed bottom-0 left-0 w-full z-10">
          <Navbar />
        </footer>
      )}
    </div>
  );
};

export default MainLayout;
