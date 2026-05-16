import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "My247Shop",
  description: "My247Shop E-commerce Application",
  manifest: "/api/manifest/default",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My247Shop",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <PWAInstallPrompt />
        {children}
      </body>
    </html>
  );
}
