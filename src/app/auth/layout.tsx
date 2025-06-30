"use client";

import { useEffect } from "react";
import Banner from "../components/atoms/Banner";
import SidebarMenu from "../components/organisms/menu/SidebarMenu";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { hasRole } from "@/helpers/auth";
import { useRouter } from "next/navigation";
import { ErrorPageProvider } from "../context/ErrorPageContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // ---------------------------
  // Redirection for unauthenticated user
  // ---------------------------
  useEffect(() => {
    if (!loading && (!user || !hasRole(user, "ROLE_USER"))) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (!user || !hasRole(user, "ROLE_USER")) return null;

  // ---------------------------
  // Rendering private pages
  // ---------------------------
  return (
    <ErrorPageProvider>
      <AuthProvider>
        <div className="w-full z-[9978]">
          <Banner />
        </div>
        <div className="md:grid md:grid-cols-4 min-h-screen mx-auto w-full">
          <SidebarMenu />
          <main className="main-auth col-span-full md:col-span-3 px-4 w-full pb-40">
            <div className="children-main max-w-4xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </AuthProvider>
    </ErrorPageProvider>
  );
}
