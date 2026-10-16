import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import PDFInitializer from "@/components/PDFInitializer";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = localFont({
  src: "./fonts/Geist.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMono.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "The Internet Toolbox",
  description:
    "A curated collection of essential internet tools - PDF utilities, file converters, sharing tools, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <PDFInitializer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
