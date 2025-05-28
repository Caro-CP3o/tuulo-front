"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchMe } from "../../../../../lib/api";
import Image from "next/image";

export default function TopMenu() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        await fetchMe();
        setIsLoggedIn(true);
      } catch (err) {
        console.error("User not authenticated:", err);
        setIsLoggedIn(false);
      }
    }

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setIsLoggedIn(false);
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md h-16 flex items-center justify-between px-6 z-[9999]">
      {/* Left spacer for symmetry */}
      <div className="w-8" />

      {/* Center logo */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <Link href="/">
          {/* <span className="font-semibold text-lg">TUULO</span> */}
          <Image
            src="/tuulo_logo.png"
            alt="Tuulo Logo"
            width={120}
            height={40}
            className="h-auto"
          />
        </Link>
      </div>

      {/* Right: Login/Logout */}
      <div className="flex items-center space-x-2">
        <UserCircle size={24} />
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
