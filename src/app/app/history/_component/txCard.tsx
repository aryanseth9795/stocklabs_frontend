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
          <p> {Txdata.status}</p>
          <p> {Txdata.type}</p>
        </div>
        <div>
          <p>{Txdata.usedBalance}</p>
          <p>{Txdata.openingBalance} </p>
          <p> {Txdata.closingBalance} </p>
        </div>
      </div>
    </div>
  );
};

export default TxCard;
