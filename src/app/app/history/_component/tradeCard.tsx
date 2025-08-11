import React from "react";

interface TradeData {
  id: string;
  userId: string;
  openingBalance: number;
  closingBalance: number;
  usedBalance: number;
  type: string;
  status: string;
  createdAt: Date;
}

const TradeCard = ({ TradaData }: { TradaData: TradeData }) => {
  return (
    <div className="border p-4 rounded-lg shadow-md bg-primary hover:shadow-lg transition-shadow duration-300">
      <div className="grid grid-cols-2">
        <div>{TradaData.type}</div>
      </div>
    </div>
  );
};

export default TradeCard;
