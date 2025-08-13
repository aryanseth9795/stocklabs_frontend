import React from "react";
import PortfolioCard from "./_component/portfolioCard";
import PortfolioInfo from "./_component/portfolioInfo";

function Portfolio() {
  const data = [
    {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
      invested: 1000,
      currentValue: 1500,
    },
     {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
      invested: 1000,
      currentValue: 1500,
    },
     {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
      invested: 1000,
      currentValue: 1500,
         
   
    },
     {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
         invested:500,
    currentValue: 1000
    },
     {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
         invested:500,
    currentValue: 1000
    },
    {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
         invested:500,
    currentValue: 1000
    },
    {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
         invested:500,
    currentValue: 1000
    },
    {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
         invested:500,
    currentValue: 1000
    },
    {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
         invested:500,
    currentValue: 1000
    },
    {
      stocksymbol: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150,
      stockChange: 1.5,
      stockChangePercentage: 1.0,
      invested:500,
    currentValue: 1000
    },
  ];

  return (
    <div className="w-full h-screen flex flex-col gap-10 p-5">
      <PortfolioInfo
        portfolio={{invested:15000, CurrentValue: 1000, Profit: 1000-500 }}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {data?.map((stock, index) => (
          <PortfolioCard key={index} stock={stock} />
        ))}
      </div>
    </div>
  );
}

export default Portfolio;