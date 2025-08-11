// "use client";
// import React, { useEffect, useCallback } from "react";
// import UserInfo from "./_component/userInfo";
// import StockCard from "./_component/stockCard";
// import { getSocket } from "@/lib/socket";

// function Home() {
//   interface Stock {
//     stockName: string;
//     stocksymbol: string;
//     stockPrice: number;
//     stockPriceINR: number;
//     stockChange: number;
//     stockChangeINR: number;
//     stockChangePercentage: number;
//     ts: string;
//   }
//   // const data = [
//   //   {
//   //     stocksymbol: "AAPL",
//   //     stockName: "Apple Inc.",
//   //     stockPrice: 150,
//   //     stockChange: 1.5,
//   //     stockChangePercentage: 1.0,
//   //   },
//   //    {
//   //     stocksymbol: "AAPL",
//   //     stockName: "Apple Inc.",
//   //     stockPrice: 150,
//   //     stockChange: 1.5,
//   //     stockChangePercentage: 1.0,
//   //   },
//   //    {
//   //     stocksymbol: "AAPL",
//   //     stockName: "Apple Inc.",
//   //     stockPrice: 150,
//   //     stockChange: 1.5,
//   //     stockChangePercentage: 1.0,
//   //   },
//   //    {
//   //     stocksymbol: "AAPL",
//   //     stockName: "Apple Inc.",
//   //     stockPrice: 150,
//   //     stockChange: 1.5,
//   //     stockChangePercentage: 1.0,
//   //   },
//   //    {
//   //     stocksymbol: "AAPL",
//   //     stockName: "Apple Inc.",
//   //     stockPrice: 150,
//   //     stockChange: 1.5,
//   //     stockChangePercentage: 1.0,
//   //   },
//   //   {
//   //     stocksymbol: "AAPL",
//   //     stockName: "Apple Inc.",
//   //     stockPrice: 150,
//   //     stockChange: 1.5,
//   //     stockChangePercentage: 1.0,
//   //   },
//   //   {
//   //     stocksymbol: "AAPL",
//   //     stockName: "Apple Inc.",
//   //     stockPrice: 150,
//   //     stockChange: 1.5,
//   //     stockChangePercentage: 1.0,
//   //   },
//   //   {
//   //     stocksymbol: "AAPL",
//   //     stockName: "Apple Inc.",
//   //     stockPrice: 150,
//   //     stockChange: 1.5,
//   //     stockChangePercentage: 1.0,
//   //   },
//   //   {
//   //     stocksymbol: "AAPL",
//   //     stockName: "Apple Inc.",
//   //     stockPrice: 150,
//   //     stockChange: 1.5,
//   //     stockChangePercentage: 1.0,
//   //   },
//   //   {
//   //     stocksymbol: "AAPL",
//   //     stockName: "Apple Inc.",
//   //     stockPrice: 150,
//   //     stockChange: 1.5,
//   //     stockChangePercentage: 1.0,
//   //   },
//   // ];
//   const [data, setData] = React.useState<Stock[]>([]);

//   const handleUpdate = useCallback((data: Stock[]) => {
//     console.log("handleUpdate called");
//     console.log(data);
//     setData(data);
//   }, []);

//   useEffect(() => {
//     // 2. Grab the singleton socket
//     const socket = getSocket();
//     console.log(socket);
//     // 3. Register your memoized handler
//     socket.on("landing", handleUpdate);

//     socket.emit("landing");

//     // 4. Clean up on unmount (or if handleUpdate ever did change)
//     return () => {
//       socket.off("landing", handleUpdate);
//     };
//   }, [handleUpdate]);
//   return (
//     <div className="w-full h-screen flex flex-col gap-10 p-5">
//       <UserInfo
//         user={{ name: "Ayush Soni", walletAmount: 10000000, portfolioAmount: 50000 }}
//       />
//       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
//         {data?.map((stock, index) => (
//           <StockCard key={index} stock={stock} />
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Home;

"use client";
import React, { useEffect, useCallback } from "react";
import UserInfo from "./_component/userInfo";
import StockCard from "./_component/stockCard";
import { getSocket } from "@/lib/socket";

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

  const [data, setData] = React.useState<Stock[]>([]);

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

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Soft gradient glows behind content */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-500/40 via-cyan-400/25 to-emerald-400/25" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.10),rgba(0,0,0,0))]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex flex-col gap-8">
        {/* Top strip like hero chip */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-5 flex items-center justify-between">
          <div className="text-sm sm:text-base text-white/80">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs mr-3">
              Dashboard
            </span>
            Learn, Trade, Win – Without the Risk.
          </div>
        </div>

        <UserInfo
          user={{ name: "Ayush Soni", walletAmount: 10000000, portfolioAmount: 50000 }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {data?.map((stock, index) => (
            <StockCard key={index} stock={stock} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
