"use client";
import { useState } from "react";
import { House, BriefcaseBusiness, Search, User,ChartCandlestick } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
  const [active, setActive] = useState("Home");

  const navItems = [
    { name: "Home", icon: <House size={40} /> },
    { name: "Portfolio", icon: <BriefcaseBusiness size={40} /> },
    { name: "Search", icon: <Search size={40} /> },
    { name: "History", icon: <ChartCandlestick size={40} /> },
    { name: "Account", icon: <User size={40} /> },
  ];

  return (
    <div className="bg-gray-300 text-black p-1 shadow-md border">
      <nav className="flex ">
        <ul className="flex justify-around items-center w-full px-5">
          {navItems.map((item) => (
            <li
              key={item.name}
              className={`flex flex-col items-center cursor-pointer ${
                active === item.name ? "text-blue-500" : "text-black"
              }`}
              onClick={() => setActive(item.name)}
            >
              <Link href={`/app/${item.name.toLowerCase()}`}>
                {item.icon}
                <span className="text-xs">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
