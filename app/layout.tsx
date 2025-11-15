import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextLearn - Online Learning Platform",
  description: "Master new skills with NextLearn's comprehensive online courses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />

          {/* ✅ Botpress Scripts */}
          <Script
            src="https://cdn.botpress.cloud/webchat/v3.3/inject.js"
            strategy="afterInteractive"
          />
          <Script
            src="https://files.bpcontent.cloud/2025/09/13/04/20250913045334-TK37OVEZ.js"
            strategy="afterInteractive"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
