import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import SidebarMenu from "./components/organisms/menu/SidebarMenu";
import TopMenu from "./components/organisms/menu/TopMenu";
// import Banner from "./components/atoms/Banner";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <div className="fixed top-0 left-0 right-0 w-full z-[9999]">
          <TopMenu />
        </div>
        <main>{children}</main>
      </body>
    </html>
  );
}

// return (
//   <html lang="en">
//     <body
//       className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
//     >
//       <div className="fixed top-0 left-0 right-0 w-full z-[9999]">
//         <TopMenu />
//         <Banner />
//       </div>
//       <div className="grid grid-cols-4 min-h-screen mx-auto">
//         <div className="col-span-1 pt-[300px] min-h-screen">
//           <SidebarMenu />
//         </div>
//         <main className="col-span-3 mt-[364px]">{children}</main>
//       </div>
//     </body>
//   </html>
// );
