import React from "react";
import UserInfo from "./_component/userInfo";
import StockCard from "./_component/stockCard";

function Home() {
  const data = [
    {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
    },
     {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
    },
     {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
    },
     {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
    },
     {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
    },
    {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
    },
    {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
    },
    {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
    },
    {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
    },
    {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
    },
  ];

  return (
    <div className="w-full h-screen flex flex-col gap-10 p-5">
      <UserInfo
        user={{ name: "John Doe", walletAmount: 1000, portfolioAmount: 5000 }}
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
