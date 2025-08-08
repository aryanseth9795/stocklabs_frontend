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
  // const data = [
  //   {
  //     stocksymbol: "AAPL",
  //     stockName: "Apple Inc.",
  //     stockPrice: 150,
  //     stockChange: 1.5,
  //     stockChangePercentage: 1.0,
  //   },
  //    {
  //     stocksymbol: "AAPL",
  //     stockName: "Apple Inc.",
  //     stockPrice: 150,
  //     stockChange: 1.5,
  //     stockChangePercentage: 1.0,
  //   },
  //    {
  //     stocksymbol: "AAPL",
  //     stockName: "Apple Inc.",
  //     stockPrice: 150,
  //     stockChange: 1.5,
  //     stockChangePercentage: 1.0,
  //   },
  //    {
  //     stocksymbol: "AAPL",
  //     stockName: "Apple Inc.",
  //     stockPrice: 150,
  //     stockChange: 1.5,
  //     stockChangePercentage: 1.0,
  //   },
  //    {
  //     stocksymbol: "AAPL",
  //     stockName: "Apple Inc.",
  //     stockPrice: 150,
  //     stockChange: 1.5,
  //     stockChangePercentage: 1.0,
  //   },
  //   {
  //     stocksymbol: "AAPL",
  //     stockName: "Apple Inc.",
  //     stockPrice: 150,
  //     stockChange: 1.5,
  //     stockChangePercentage: 1.0,
  //   },
  //   {
  //     stocksymbol: "AAPL",
  //     stockName: "Apple Inc.",
  //     stockPrice: 150,
  //     stockChange: 1.5,
  //     stockChangePercentage: 1.0,
  //   },
  //   {
  //     stocksymbol: "AAPL",
  //     stockName: "Apple Inc.",
  //     stockPrice: 150,
  //     stockChange: 1.5,
  //     stockChangePercentage: 1.0,
  //   },
  //   {
  //     stocksymbol: "AAPL",
  //     stockName: "Apple Inc.",
  //     stockPrice: 150,
  //     stockChange: 1.5,
  //     stockChangePercentage: 1.0,
  //   },
  //   {
  //     stocksymbol: "AAPL",
  //     stockName: "Apple Inc.",
  //     stockPrice: 150,
  //     stockChange: 1.5,
  //     stockChangePercentage: 1.0,
  //   },
  // ];
  const [data, setData] = React.useState<Stock[]>([]);

  const handleUpdate = useCallback((data: Stock[]) => {
    console.log("handleUpdate called");
    console.log(data);
    setData(data);
  }, []);

  useEffect(() => {
    // 2. Grab the singleton socket
    const socket = getSocket();
    console.log(socket);
    // 3. Register your memoized handler
    socket.on("landing", handleUpdate);

    socket.emit("landing");

    // 4. Clean up on unmount (or if handleUpdate ever did change)
    return () => {
      socket.off("landing", handleUpdate);
    };
  }, [handleUpdate]);
  return (
    <div className="w-full h-screen flex flex-col gap-10 p-5">
      <UserInfo
        user={{ name: "Ayush Soni", walletAmount: 10000000, portfolioAmount: 50000 }}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {data?.map((stock, index) => (
          <StockCard key={index} stock={stock} />
        ))}
      </div>
    </div>
  );
}

export default Home;
