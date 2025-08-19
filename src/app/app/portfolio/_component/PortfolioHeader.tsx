"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  CalendarClock,
  ChevronDown,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";

export type AccountOption = { id: string; label: string };

export function PortfolioHeader(props: {
  title: string;
  lastUpdated?: string;
  accounts: AccountOption[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onDownloadCSV: () => void;
  onRefresh: () => void;
  onOpenFilters: () => void;
}) {
  const {
    title,
    lastUpdated,
    accounts,
    selectedAccountId,
    onSelectAccount,
    onDownloadCSV,
    onRefresh,
    onOpenFilters,
  } = props;
  const selected =
    accounts.find((a) => a.id === selectedAccountId)?.label ?? "Select";

  return (
    <header className="sticky top-0 z-10 -mx-4 mb-2 border-b border-neutral-800/80 bg-neutral-950/70 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/50 shadow-[0_0_0_1px_rgba(255,255,255,.04)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-100 sm:text-2xl">
            {title}
          </h1>
          {lastUpdated && (
            <Badge
              variant="secondary"
              className="border border-neutral-800 bg-neutral-900/70 text-neutral-400"
            >
              <CalendarClock className="mr-1 h-3 w-3" />
              Updated {new Date(lastUpdated).toLocaleString()}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-neutral-800 bg-neutral-900/70 text-neutral-200 hover:bg-neutral-800"
              >
                {selected}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-neutral-800 bg-neutral-900 text-neutral-200">
              {accounts.map((acc) => (
                <DropdownMenuItem
                  key={acc.id}
                  onClick={() => onSelectAccount(acc.id)}
                  className="focus:bg-neutral-800"
                >
                  {acc.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            onClick={onOpenFilters}
            className="border-neutral-800 bg-neutral-900/70 text-neutral-200 hover:bg-neutral-800"
          >
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
          <Button
            variant="outline"
            onClick={onRefresh}
            className="border-neutral-800 bg-neutral-900/70 text-neutral-200 hover:bg-neutral-800"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button
            onClick={onDownloadCSV}
            className="bg-neutral-200 text-neutral-900 hover:bg-white"
          >
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
        </div>
      </div>
    </header>
  );
}

export default PortfolioHeader;