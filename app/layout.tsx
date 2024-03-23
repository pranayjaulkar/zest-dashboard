import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import ModalProvider from "@/providers/ModalProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import LoadingBarProvider from "@/providers/LoadingBarProvider";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ecommerce",
  description: "Ecommerce Website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Suspense fallback={null}>
              <LoadingBarProvider />
            </Suspense>
            <ToastProvider />
            <ModalProvider />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
