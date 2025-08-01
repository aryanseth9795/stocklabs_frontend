import { DollarSignIcon, ChartCandlestick, Wallet } from "lucide-react";
import React from "react";

interface PortfolioInfoProps {
  portfolio: {
    invested: number;
    CurrentValue: number;
    Profit: number;
  };
}

const userInfo = ({ portfolio }: PortfolioInfoProps) => {
  return (
    <div className="w-full h-[35vh] md:h-[30vh] flex flex-col p-5 border rounded-lg shadow-md bg-primary ">
      <h1 className="text-3xl font-bold flex gap-5 justify-start items-center pb-5 pl-5 ">
        {" "}
        Portfolio
      </h1>
      <div className="w-full h-full grid grid-col-1 md:grid-cols-3 gap-10 justify-between">
        <div className="flex  items-center gap-5">
          <Wallet size={60} />
          <div>
            <h3 className="text-lg font-semibold flex gap-2"> Invested</h3>
            <p className="text-gray-600">{portfolio.invested}</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <DollarSignIcon size={60} />
          <div>
            <h3 className="text-lg font-semibold flex gap-2"> Current Value</h3>
            <p className="text-gray-600">₹{portfolio.CurrentValue}</p>
          </div>
        </div>
        <div className="flex gap-5  items-center">
          <ChartCandlestick size={60} />
          <div>
            <h3 className="text-lg font-semibold flex gap-2 "> Profit/Loss</h3>
            <p className="text-gray-600">{portfolio.Profit}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default userInfo;
