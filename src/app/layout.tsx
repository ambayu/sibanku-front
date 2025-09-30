"use client";
import { AlertProvider } from "@/context/AlertContext";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ThemeProvider>
            <AlertProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </AlertProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
