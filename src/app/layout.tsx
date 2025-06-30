import type { Metadata } from "next";
import "./globals.css";
import TopMenu from "./components/organisms/menu/TopMenu";
import { AuthProvider } from "@/app/context/AuthContext";
import Footer from "./components/molecules/Footer";
import CookieBanner from "./components/atoms/CookieBanner";
import { ErrorPageProvider } from "./context/ErrorPageContext";

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
      <body className="antialiased min-h-screen flex flex-col">
        <ErrorPageProvider>
          <AuthProvider>
            <div className="w-full z-[9988] sticky top-0">
              <TopMenu />
            </div>
            <main className="flex flex-col justify-center items-center flex-1 md:mt-20 mt-[35vh]">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ErrorPageProvider>

        <CookieBanner />
      </body>
    </html>
  );
}
