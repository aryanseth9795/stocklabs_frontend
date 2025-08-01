import React from "react";

interface StockCardProps {
  stock: {
    stockName: string;
    stocksymbol: string;
    invested: number;
    currentValue: number;
    stockPrice: number;
    stockChange: number;
    stockChangePercentage: number;
  };
}

const StockCard = ({ stock }: StockCardProps) => {
  return (
    <div
      className={`border p-4 rounded-lg shadow-md ${stock.invested-stock.currentValue<0 ? "bg-green-300" : "bg-red-300"} hover:shadow-lg transition-shadow duration-300`}
    >
      <div className="flex justify-around items-center  p-5">
        <h2 className="text-xl font-bold">{stock.stocksymbol}</h2>
        <h2 className="text-xl font-bold">{stock.stockName}</h2>
      </div>
      <div className="flex justify-around gap-2">
        <p>Invested: ${stock.invested}</p>
        <p>Current Value: ${stock.currentValue}</p>
      </div>
      <div className="flex justify-around gap-2">
        <p>Price: ${stock.stockPrice}</p>
        <p>
          Change: {stock.stockChange} ({stock.stockChangePercentage}%)
        </p>
      </div>
    </div>
  );
};

export default StockCard;
