import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ClientWrapper from "@/components/client-wrapper";
import ConditionalLayout from "@/components/ConditionalLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Delivery Partner - India's Largest Marketplace for Intracity Logistics",
  description: "Book mini trucks, bikes and tempos for all your logistics needs. Delivery Partner provides on-demand logistics services across major cities in India.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientWrapper>
          <TooltipProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </ClientWrapper>
      </body>
    </html>
  );
}