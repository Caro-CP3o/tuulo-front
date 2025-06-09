"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchMe, logout } from "@/lib/api";
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

  // const handleLogout = async () => {
  //   try {
  //     const res = await fetch("/api/logout", {
  //       method: "POST",
  //       credentials: "include",
  //     });

  //     if (res.ok) {
  //       setIsLoggedIn(false);
  //       router.push("/login");
  //     } else {
  //       console.error("Logout failed");
  //     }
  //   } catch (err) {
  //     console.error("Logout error:", err);
  //   }
  // };

  const handleLogout = async () => {
    try {
      await logout(); // use the shared API function
      setIsLoggedIn(false);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="bg-white shadow-md h-16 flex items-center justify-between px-6 z-[9999]">
      {/* Left spacer for symmetry */}
      <div className="w-8" />

      {/* Center logo */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <Link href="/home">
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
            className="text-sm font-medium hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium hover:text-red-400 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
