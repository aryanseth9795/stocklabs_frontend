import axios from "axios";

/**
 * Currency helpers.
 *
 * The whole platform is denominated in rupees: the user's balance, every order
 * the server writes, and the mobile app's UI. The web app used to price crypto
 * in USD (`stockPrice`) against that INR ledger, which made portfolio P&L a
 * subtraction of rupees from dollars — see review F-01. Everything money-shaped
 * on the web now goes through these.
 */

export const fmtINR = (n: number, maximumFractionDigits = 2) =>
  (Number.isFinite(n) ? n : 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits,
  });

/** Compact rupee format for large figures (wallet balances, totals). */
export const fmtINRCompact = (n: number) =>
  (Number.isFinite(n) ? n : 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

export const fmtPct = (n: number) =>
  `${n >= 0 ? "+" : ""}${(Number.isFinite(n) ? n : 0).toFixed(2)}%`;

/**
 * Pulls the server's error message out of a failed request.
 *
 * The API returns specific, user-actionable messages ("User Already Exists",
 * "Invalid Email or Password", "quantity must be greater than zero"). Login and
 * signup used to throw all of that away and show "Something Went wrong"
 * regardless — see review F-05.
 */
export function errorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
    if (err.code === "ERR_NETWORK") return "Cannot reach the server.";
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
