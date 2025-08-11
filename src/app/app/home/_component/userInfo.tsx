// import { DollarSignIcon, User, Wallet } from "lucide-react";
// import React from "react";

// interface UserInfoProps {
//   user: {
//     name: string;
//     walletAmount: number;
//     portfolioAmount: number;
//   };
// }

// const userInfo = ({ user }: UserInfoProps) => {
//   return (
//     <div className="w-full h-[35vh] md:h-[25vh] flex flex-col p-5 border rounded-lg shadow-md bg-primary ">
//       <h1 className="text-xl font-bold flex gap-5 justify-start items-center ">
//         {" "}
//         Dashboard
//       </h1>
//       <div className="w-full h-full grid grid-col-1 md:grid-cols-3 gap-10 justify-between">
//         <div className="flex justify-start items-center gap-5">
//           <User size={60} />
//           <p className="text-gray-600">{user.name}</p>
//         </div>
//         <div className="flex items-center gap-5">
//           <Wallet size={60} />
//           <div>
//             <h3 className="text-lg font-semibold flex gap-2">
//               {" "}
//               Wallet Balance
//             </h3>
//             <p className="text-gray-600">₹{user.walletAmount}</p>
//           </div>
//         </div>
//         <div className="flex gap-5  items-center">
//           <DollarSignIcon size={60} />
//           <div>
//             <h3 className="text-lg font-semibold flex gap-2 "> Portfolio</h3>
//             <p className="text-gray-600">{user.portfolioAmount}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default userInfo;
"use client";
import { DollarSignIcon, User, Wallet } from "lucide-react";
import React from "react";

interface UserInfoProps {
  user: { name: string; walletAmount: number; portfolioAmount: number };
}

const nf = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }); // fixed locale

const UserInfo = ({ user }: UserInfoProps) => {
  return (
    <div className="w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8 shadow-2xl">
      <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-6 flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="rounded-xl bg-white/10 p-3"><User size={28} /></div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/60">User</p>
            <p className="text-base md:text-lg font-medium">{user.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="rounded-xl bg-white/10 p-3"><Wallet size={28} /></div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/60">Wallet Balance</p>
            <p className="text-base md:text-lg font-medium">₹{nf.format(user.walletAmount)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="rounded-xl bg-white/10 p-3"><DollarSignIcon size={28} /></div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/60">Portfolio</p>
            <p className="text-base md:text-lg font-medium">₹{nf.format(user.portfolioAmount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;


