import React from "react";
import Navbar from "../_component/NavBar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen w-full">
      <main className="h-full w-full">{children}</main>
      <footer className="text-center fixed bottom-0 left-0 w-full z-10 "><Navbar/></footer>
    </div>
  );
};

export default MainLayout;
