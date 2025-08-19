// "use client";
// import React from "react";
// import PortfolioCard from "./_component/portfolioCard";
// import PortfolioInfo from "./_component/portfolioInfo";
// import { useAuth } from "@/lib/ContextApi";

// function Portfolio() {
//   const data = [
//     {
//       stocksymbol: "AAPL",
//       stockName: "Apple Inc.",
//       stockPrice: 150,
//       stockChange: 1.5,
//       stockChangePercentage: 1.0,
//       invested: 1000,
//       currentValue: 1500,
//     },
//     {
//       stocksymbol: "AAPL",
//       stockName: "Apple Inc.",
//       stockPrice: 150,
//       stockChange: 1.5,
//       stockChangePercentage: 1.0,
//       invested: 1000,
//       currentValue: 1500,
//     },
//     {
//       stocksymbol: "AAPL",
//       stockName: "Apple Inc.",
//       stockPrice: 150,
//       stockChange: 1.5,
//       stockChangePercentage: 1.0,
//       invested: 1000,
//       currentValue: 1500,
//     },
//     {
//       stocksymbol: "AAPL",
//       stockName: "Apple Inc.",
//       stockPrice: 150,
//       stockChange: 1.5,
//       stockChangePercentage: 1.0,
//       invested: 500,
//       currentValue: 1000,
//     },
//     {
//       stocksymbol: "AAPL",
//       stockName: "Apple Inc.",
//       stockPrice: 150,
//       stockChange: 1.5,
//       stockChangePercentage: 1.0,
//       invested: 500,
//       currentValue: 1000,
//     },
//     {
//       stocksymbol: "AAPL",
//       stockName: "Apple Inc.",
//       stockPrice: 150,
//       stockChange: 1.5,
//       stockChangePercentage: 1.0,
//       invested: 500,
//       currentValue: 1000,
//     },
//     {
//       stocksymbol: "AAPL",
//       stockName: "Apple Inc.",
//       stockPrice: 150,
//       stockChange: 1.5,
//       stockChangePercentage: 1.0,
//       invested: 500,
//       currentValue: 1000,
//     },
//     {
//       stocksymbol: "AAPL",
//       stockName: "Apple Inc.",
//       stockPrice: 150,
//       stockChange: 1.5,
//       stockChangePercentage: 1.0,
//       invested: 500,
//       currentValue: 1000,
//     },
//     {
//       stocksymbol: "AAPL",
//       stockName: "Apple Inc.",
//       stockPrice: 150,
//       stockChange: 1.5,
//       stockChangePercentage: 1.0,
//       invested: 500,
//       currentValue: 1000,
//     },
//     {
//       stocksymbol: "AAPL",
//       stockName: "Apple Inc.",
//       stockPrice: 150,
//       stockChange: 1.5,
//       stockChangePercentage: 1.0,
//       invested: 500,
//       currentValue: 1000,
//     },
//   ];

//   const { user } = useAuth();
//   console.log(user);
//   return (
//     <div className="w-full h-screen flex flex-col gap-10 p-5">
//       <PortfolioInfo
//         portfolio={{ invested: 15000, CurrentValue: 1000, Profit: 1000 - 500 }}
//       />
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//         {data?.map((stock, index) => (
//           <PortfolioCard key={index} stock={stock} />
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Portfolio;
"use client";
import React from "react";

import { PortfolioHeader } from "./_component/PortfolioHeader";
import { KPIStatCard } from "./_component/KPIStatCard";
import { AllocationDonut } from "./_component/AllocationDonut";
import { PerformanceChart } from "./_component/PerformanceChart";
import { HoldingsTable } from "./_component/HoldingsTable";
import { FiltersToolbar } from "./_component/FiltersToolbar";
import { TradeHistoryList } from "./_component/TradeHistoryList";
import { CashCard } from "./_component/CashCard";
import { EmptyState } from "./_component/EmptyState";
import { ErrorState } from "./_component/ErrorState";
import {
  KPISkeletonGrid,
  TableSkeleton,
  ChartSkeleton,
} from "./_component/Skeletons";
import { BuySellDialog } from "./_component/BuySellDialog";

import {
  demoHoldings,
  demoKPIs,
  demoAlloc,
  demoPerf30D,
  demoTrades,
  demoSummary,
} from "./_component/demoData";

export default function PortfolioPage() {
  const [range, setRange] = React.useState<"30D" | "6M" | "1Y">("30D");
  const perfSeries =
    range === "30D" ? demoPerf30D : range === "6M" ? demoPerf30D : demoPerf30D;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <PortfolioHeader
          title="Portfolio"
          lastUpdated={new Date().toISOString()}
          accounts={[
            { id: "acc-1", label: "Primary" },
            { id: "acc-2", label: "Long-term" },
          ]}
          selectedAccountId="acc-1"
          onSelectAccount={() => {}}
          onDownloadCSV={() => {}}
          onRefresh={() => {}}
          onOpenFilters={() => {}}
        />

        {/* KPI Row */}
        <section className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {demoKPIs.map((kpi) => (
              <KPIStatCard key={kpi.label} {...kpi} />
            ))}
          </div>
        </section>

        {/* Charts Row */}
        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-7">
          <div className="lg:col-span-3">
            <AllocationDonut title="Allocation by Sector" data={demoAlloc} />
          </div>
          <div className="lg:col-span-4">
            <PerformanceChart
              title="Performance"
              range={range}
              onRangeChange={setRange}
              series={perfSeries}
            />
          </div>
        </section>

        {/* Filters + Table */}
        <section className="mt-6">
          <FiltersToolbar
            query=""
            sector="All"
            sortBy="weightPct"
            sortDir="desc"
            showOnlyLosers={false}
            hidePenny={false}
            sectors={["All", "Tech", "Finance", "Energy", "Healthcare"]}
            onChangeQuery={() => {}}
            onChangeSector={() => {}}
            onToggleLosers={() => {}}
            onTogglePenny={() => {}}
            onChangeSort={() => {}}
          />

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <HoldingsTable
                holdings={demoHoldings}
                sortBy="weightPct"
                sortDir="desc"
                onSortChange={() => {}}
                onRowBuy={() => {}}
                onRowSell={() => {}}
                onRowDetails={() => {}}
              />
            </div>
            <aside className="lg:col-span-4 space-y-4">
              <CashCard summary={demoSummary} />
              <TradeHistoryList groups={demoTrades} />
            </aside>
          </div>
        </section>

        {/* Dialog shell demo (closed-state UI only) */}
        <BuySellDialog
          open={false}
          onOpenChange={() => {}}
          symbol="AAPL"
          price={150.12}
        />
      </div>
    </main>
  );
}

