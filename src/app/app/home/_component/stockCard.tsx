import React from "react";

interface StockCardProps {
  stock: {
    stockName: string;
    stocksymbol: string;
    stockPrice: number;
    stockPriceINR: number;
    stockChange: number;
    stockChangeINR: number;
    stockChangePercentage: number;
    ts: string;
  };
}

const StockCard = ({ stock }: StockCardProps) => {
  return (
    <div className="border p-4 rounded-lg shadow-md bg-primary hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-center mb-2 p-5">
        <h2 className="text-xl font-bold">{stock.stocksymbol}</h2>
        <h2 className="text-xl font-bold">{stock.stockName}</h2>
      </div>
      <div className="flex justify-between gap-2">
        <p>Price: ${stock.stockPrice}</p>
        <p>
          Change: {stock.stockChange} ({stock.stockChangePercentage}%)
        </p>
      </div>
    </div>
  );
};

export default StockCard;
