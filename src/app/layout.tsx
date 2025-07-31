import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import "./globals.css";

const MerriweatherFont = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
});
export const metadata: Metadata = {
  title: "StockLabs",
  description: "DEVELOPED BY ARYAN SETH",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={MerriweatherFont.className}>{children}</body>
    </html>
  );
}
