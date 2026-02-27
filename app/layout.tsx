// app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FINNEX | Dashboard",
  description:
    "FINNEX dashboard — make smallholder agriculture investable through milestone-based disbursement, scoring, and monitoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}