import React from "react";

interface TransactionData {
  id: string;
  userId: string;
  openingBalance: number;
  closingBalance: number;
  usedBalance: number;
  type: string;
  status: string;
  createdAt: Date;
}
const TxCard = ({ Txdata }: { Txdata: TransactionData }) => {
  return (
    <div className="border p-4 rounded-lg shadow-md bg-primary hover:shadow-lg transition-shadow duration-300">
      <div className="grid grid-cols-2">
        <div>
          {Txdata.status}
          {Txdata.type}
        </div>
        <div>
          <span>{Txdata.usedBalance}</span>
          <span> </span> {Txdata.openingBalance}
          {Txdata.closingBalance}
        </div>
      </div>
    </div>
  );
};

export default TxCard;
