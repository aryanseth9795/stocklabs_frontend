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

/**
 * Rupee format with precision scaled to the magnitude.
 *
 * A flat two decimals works for BTC at ₹60,85,004.60 and renders SHIB — worth a
 * few thousandths of a rupee — as a flat "₹0.00", along with a change of
 * "+₹0.00". The board showed four such rows, all reading zero.
 *
 * Decimals are padded as well as capped so the digits sit in fixed columns and
 * the number does not change width on every tick.
 */
export const fmtINRPrice = (n: number) => {
  const v = Number.isFinite(n) ? n : 0;
  const abs = Math.abs(v);
  const digits = abs >= 100 ? 2 : abs >= 1 ? 2 : abs >= 0.01 ? 4 : abs >= 0.0001 ? 6 : 8;
  return v.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

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
