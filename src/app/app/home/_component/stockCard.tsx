
// import React from "react";

// interface StockCardProps {
//   stock: {
//     stockName: string;
//     stocksymbol: string;
//     stockPrice: number;
//     stockPriceINR: number;
//     stockChange: number;
//     stockChangeINR: number;
//     stockChangePercentage: number;
//     ts: string;
//   };
// }

// const StockCard = ({ stock }: StockCardProps) => {
//   const isUp = stock.stockChange >= 0;

//   return (
//     <div className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow hover:shadow-xl hover:border-white/20 transition">
//       {/* subtle gradient ring on hover */}
//       <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-indigo-400/10 via-cyan-300/10 to-emerald-300/10" />

//       <div className="relative flex items-start justify-between mb-3">
//         <div>
//           <h2 className="text-xl font-semibold tracking-tight">{stock.stocksymbol}</h2>
//           <p className="text-xs text-white/60 mt-0.5">{stock.stockName}</p>
//         </div>

//         <span
//           className={`text-xs px-2 py-1 rounded-full border ${
//             isUp
//               ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10"
//               : "text-rose-300 border-rose-400/30 bg-rose-400/10"
//           }`}
//         >
//           {isUp ? "▲" : "▼"} {stock.stockChangePercentage}%
//         </span>
//       </div>

//       <div className="relative flex items-end justify-between">
//         <div className="space-y-1">
//           <p className="text-sm text-white/60">Price (USD)</p>
//           <p className="text-2xl font-semibold leading-none">${stock.stockPrice}</p>
//         </div>
//         <div className="text-right space-y-1">
//           <p className="text-sm text-white/60">Δ (USD)</p>
//           <p className={`text-lg font-medium ${isUp ? "text-emerald-300" : "text-rose-300"}`}>
//             {isUp ? "+" : ""}
//             {stock.stockChange} ({stock.stockChangePercentage}%)
//           </p>
//         </div>
//       </div>

//       <div className="mt-4 text-[11px] text-white/50">
//         Last update: {stock.ts}
//       </div>
//     </div>
//   );
// }

// export default StockCard;


"use client";
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
  onClick?: () => void;
}

const StockCard = ({ stock, onClick }: StockCardProps) => {
  const isUp = stock.stockChange >= 0;

  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow hover:shadow-xl hover:border-white/20 transition outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-indigo-400/10 via-cyan-300/10 to-emerald-300/10" />

      <div className="relative flex items-start justify-between mb-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{stock.stocksymbol}</h2>
          <p className="text-xs text-white/60 mt-0.5">{stock.stockName}</p>
        </div>

        <span
          className={`text-xs px-2 py-1 rounded-full border ${
            isUp
              ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10"
              : "text-rose-300 border-rose-400/30 bg-rose-400/10"
          }`}
        >
          {isUp ? "▲" : "▼"} {stock.stockChangePercentage}%
        </span>
      </div>

      <div className="relative flex items-end justify-between">
        <div className="space-y-1">
          <p className="text-sm text-white/60">Price (USD)</p>
          <p className="text-2xl font-semibold leading-none">${stock.stockPrice}</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-sm text-white/60">Δ (USD)</p>
          <p className={`text-lg font-medium ${isUp ? "text-emerald-300" : "text-rose-300"}`}>
            {isUp ? "+" : ""}
            {stock.stockChange} ({stock.stockChangePercentage}%)
          </p>
        </div>
      </div>

      <div className="mt-4 text-[11px] text-white/50">Last update: {stock.ts}</div>
    </button>
  );
};

export default StockCard;
