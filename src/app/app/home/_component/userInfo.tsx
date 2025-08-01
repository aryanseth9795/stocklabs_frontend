import { DollarSignIcon, User, Wallet } from "lucide-react";
import React from "react";

interface UserInfoProps {
  user: {
    name: string;
    walletAmount: number;
    portfolioAmount: number;
  };
}

const userInfo = ({ user }: UserInfoProps) => {
  return (
    <div className="w-full h-[35vh] md:h-[25vh] flex flex-col p-5 border rounded-lg shadow-md bg-primary ">
      <h1 className="text-xl font-bold flex gap-5 justify-start items-center ">
        {" "}
        Dashboard
      </h1>
      <div className="w-full h-full grid grid-col-1 md:grid-cols-3 gap-10 justify-between">
        <div className="flex justify-start items-center gap-5">
          <User size={60} />
          <p className="text-gray-600">{user.name}</p>
        </div>
        <div className="flex items-center gap-5">
          <Wallet size={60} />
          <div>
            <h3 className="text-lg font-semibold flex gap-2">
              {" "}
              Wallet Balance
            </h3>
            <p className="text-gray-600">₹{user.walletAmount}</p>
          </div>
        </div>
        <div className="flex gap-5  items-center">
          <DollarSignIcon size={60} />
          <div>
            <h3 className="text-lg font-semibold flex gap-2 "> Portfolio</h3>
            <p className="text-gray-600">{user.portfolioAmount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default userInfo;
