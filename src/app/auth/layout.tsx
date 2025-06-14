"use client";

import { useEffect } from "react";
import Banner from "../components/atoms/Banner";
import SidebarMenu from "../components/organisms/menu/SidebarMenu";
import TopMenu from "../components/organisms/menu/TopMenu";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { hasRole } from "@/helpers/auth";
import { useRouter } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !hasRole(user, "ROLE_USER"))) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user || !hasRole(user, "ROLE_USER")) {
    return null; // Optionally render a loading spinner here
  }

  return (
    <AuthProvider>
      <div className="fixed top-0 left-0 w-full z-[9999]">
        <TopMenu />
      </div>
      <Banner />
      <div className="grid grid-cols-4 min-h-screen mx-auto">
        <aside className="col-span-1 min-h-screen z-[9998]">
          <SidebarMenu />
        </aside>
        <main className="col-span-3 mt-[364px]">{children}</main>
      </div>
    </AuthProvider>
  );
}

// import Banner from "../components/atoms/Banner";
// import SidebarMenu from "../components/organisms/menu/SidebarMenu";
// import TopMenu from "../components/organisms/menu/TopMenu";
// import { AuthProvider } from "../context/AuthContext";

// export default async function AppLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <>
//       <div className="fixed top-0 left-0 right-0 w-full z-[9999]">
//         <TopMenu />
//         <Banner />
//       </div>
//       <div className="grid grid-cols-4 min-h-screen mx-auto">
//         <aside className="col-span-1 min-h-screen z-[9998]">
//           <SidebarMenu />
//         </aside>
//         <main className="col-span-3 mt-[364px]">
//           <AuthProvider>{children}</AuthProvider>
//         </main>
//       </div>
//     </>
//   );
// }
