import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SidebarMenu from "./components/organisms/menu/SidebarMenu";
import TopMenu from "./components/organisms/menu/TopMenu";
import Banner from "./components/atoms/Banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tuulo",
  description: "It takes a village !",
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
        <TopMenu />
        <Banner />
        <div className="flex min-h-screen">
          <SidebarMenu />
          <main className="flex-1 mt-16">{children}</main>
        </div>
      </body>
    </html>
  );
}
