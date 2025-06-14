"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchMe } from "@/lib/api";
import { UserType } from "@/types/api";

type AuthContextType = {
  user: UserType | null;
  loading: boolean;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await fetchMe();
      setUser(fetched);
    } catch (err: any) {
      console.warn("Failed to fetch user (probably logged out):", err);
      setUser(null);
      // Don't redirect here if already on login page to avoid loop
      if (err.message === "UNAUTHORIZED" && pathname !== "/login") {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);
  useEffect(() => {
    // Skip fetchMe on public pages
    if (["/login", "/register", "/404", "/500"].includes(pathname)) {
      setLoading(false);
      return;
    }

    loadUser();
  }, [pathname, loadUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { fetchMe } from "@/lib/api";
// import { UserType } from "@/types/api";

// type AuthContextType = {
//   user: UserType | null;
//   loading: boolean;
//   refresh: () => void;
// };

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   loading: true,
//   refresh: () => {},
// });

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<UserType | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   const loadUser = async () => {
//     setLoading(true);
//     try {
//       const fetched = await fetchMe();
//       setUser(fetched);
//     } catch (err: any) {
//       console.warn("Failed to fetch user (probably logged out):", err);
//       setUser(null);
//       if (err.message === "UNAUTHORIZED") {
//         router.push("/login");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadUser();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, loading, refresh: loadUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { fetchMe } from "@/lib/api"; // your fetchMe function
// import { UserType } from "@/types/api";

// type AuthContextType = {
//   user: UserType | null;
//   loading: boolean;
//   refresh: () => void;
// };

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   loading: true,
//   refresh: () => {},
// });

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<UserType | null>(null);
//   const [loading, setLoading] = useState(true);

//   const loadUser = async () => {
//     setLoading(true);
//     try {
//       const fetched = await fetchMe();
//       setUser(fetched);
//     } catch (err) {
//       console.warn("Failed to fetch user (probably logged out):", err);
//       setUser(null); // <- this is important
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadUser();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, loading, refresh: loadUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
