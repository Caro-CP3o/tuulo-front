"use client";

import { useEffect, useState } from "react";
import { fetchMe, fetchMyFamily } from "@/lib/api";
import { FamilyType, UserType } from "@/types/api";
import { hasRole } from "@/helpers/auth";
import SidebarContent from "./SidebarContent";
import { X } from "lucide-react";

export default function SidebarMenu() {
  // ---------------------------
  // State variables
  // ---------------------------
  const [user, setUser] = useState<UserType | null>(null);
  const [family, setFamily] = useState<FamilyType | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isShortScreen, setIsShortScreen] = useState(false);

  // ---------------------------
  // Effect check width & height on mount
  // ---------------------------
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 898);
      setIsShortScreen(window.innerHeight < 771);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ---------------------------
  // Effect load family on mount
  // ---------------------------
  useEffect(() => {
    async function loadData() {
      // API call fetch user & family
      try {
        const me = await fetchMe();
        const { data: familyData } = await fetchMyFamily();
        setUser(me);
        setFamily(familyData);
      } catch (err) {
        console.error("Failed to load sidebar data:", err);
      }
    }
    loadData();
  }, []);

  // Guard not authenticated
  if (!user || !hasRole(user, "ROLE_USER")) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      {!(isMobile || isShortScreen) && (
        <aside className="sticky top-10 self-start max-h-[calc(100vh-2rem)] bg-white p-4">
          <SidebarContent user={user} family={family} />
        </aside>
      )}

      {/* Mobile hamburger */}
      {(isMobile || isShortScreen) && (
        <div className=" fixed top-4 left-4 z-[9999]">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md bg-white border border-gray-300 shadow"
          >
            <span className="sr-only">Open menu</span>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-blue-900/50 z-[9999]"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 w-full h-full bg-white p-6 shadow-lg z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="mb-4" onClick={() => setMobileOpen(false)}>
              <X />
            </button>
            <SidebarContent user={user} family={family} />
          </aside>
        </div>
      )}
    </>
  );
}
