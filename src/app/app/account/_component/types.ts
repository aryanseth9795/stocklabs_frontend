export type User = {
  id?: string;
  name: string;
  email: string;
  handle?: string;
  joinedAt?: string;
  avatarUrl?: string;
  balance?: number;
  totalInvested?: number;
  createdAt?: string;
};

export type PLStats = {
  realizedPL: number;
  totalBuyAmount: number;
  totalSellAmount: number;
  totalBuyCount: number;
  totalSellCount: number;
  totalTrades: number;
  avgTradeSize: number;
  symbolBreakdown: Array<{
    symbol: string;
    realizedPL: number;
    totalBuy: number;
    totalSell: number;
  }>;
  period: string;
};

export type PLPoint = {
  date: string; // YYYY-MM-DD
  value: number; // net P/L for the day
};
