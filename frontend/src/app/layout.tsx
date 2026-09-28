import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

import QueryProvider from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "LeadFlow CRM | Lead Management & Sales Distribution",
  description: "Enterprise Lead Management, Distribution Engine & Sales Pipeline CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#f7f9fb] text-slate-900">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
