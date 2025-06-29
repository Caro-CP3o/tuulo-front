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
import { useErrorPage } from "./ErrorPageContext";

type AuthContextType = {
  user: UserType | null;
  loading: boolean;
  refresh: () => void;
  setUser: (user: UserType | null) => void;
};

// ---------------------------
// Create AuthContext with default values
// ---------------------------
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: () => {},
  setUser: () => {},
});

const publicPages = [
  "/",
  "/login",
  "/register",
  "/invitation-pending",
  "/invitation-rejected",
  "/404",
  "/500",
  "/registration-success",
  "/not-found",
];

// ---------------------------
// AuthProvider: wraps the app and provides auth state
// ---------------------------
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // ---------------------------
  // State variables
  // ---------------------------
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const { isErrorPage, isInitialized } = useErrorPage();

  // ---------------------------
  // loadUser: fetch current user and handle redirects
  // ---------------------------
  const loadUser = useCallback(async () => {
    console.log("Running loadUser...");

    if (isErrorPage) {
      console.log("Skipping loadUser logic on error page");
      setLoading(false);
      return;
    }

    setLoading(true);
    // API call fetch user
    try {
      const fetched = await fetchMe();
      setUser(fetched);

      // fetch family member status
      const status = fetched.familyMembers?.[0]?.status;

      const onPublicPage = publicPages.includes(pathname);

      // Redirect based on family member status
      if (status === "pending") {
        if (pathname !== "/invitation-pending") {
          router.push("/invitation-pending");
        }
      } else if (status === "rejected") {
        if (
          pathname !== "/invitation-rejected" &&
          pathname !== "/create-family"
        ) {
          router.push("/invitation-rejected");
        }
      } else if (status === "active") {
        if (onPublicPage) {
          router.push("/home");
        }
      } else {
        // No family or unknown status
        if (pathname !== "/create-family") {
          router.push("/create-family");
        }
      }
    } catch (err: unknown) {
      console.error("Error fetching user:", err);
      setUser(null);

      // To access err.message safely, you need to check if err is an Error
      if (err instanceof Error) {
        if (err.message === "UNAUTHORIZED" && pathname !== "/login") {
          // router.push("/login");
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  }, [pathname, router, isErrorPage]);

  // ---------------------------
  // Effects on mount
  // ---------------------------
  useEffect(() => {
    if (!isInitialized) return; // wait for context

    const isPublic = publicPages.includes(pathname);
    const justLoggedOut = localStorage.getItem("justLoggedOut"); // flag

    // Special case: user just logged out, clear state without refetching
    if (isPublic && justLoggedOut) {
      localStorage.removeItem("justLoggedOut");
      setUser(null);
      setLoading(false);
      return;
    }

    loadUser();
  }, [pathname, loadUser, isInitialized]);

  // ---------------------------
  // Provide context value to children
  // ---------------------------
  return (
    <AuthContext.Provider value={{ user, loading, refresh: loadUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
