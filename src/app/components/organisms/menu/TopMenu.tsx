"use client";

import Link from "next/link";
import Image from "next/image";
import LoginForm from "../../forms/LoginForm";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api";
import { UserCircle } from "lucide-react";
import { useErrorPage } from "@/app/context/ErrorPageContext";

export default function TopMenu() {
  const { user, loading, refresh } = useAuth();
  const { isErrorPage } = useErrorPage();
  const router = useRouter();

  const familyStatus = user?.familyMembers?.[0]?.status ?? null;

  // ---------------------------
  // Logount handler & refresh context
  // ---------------------------
  const handleLogout = async () => {
    try {
      await logout();
      await refresh();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
  // ---------------------------
  // Conditional rendering
  // ---------------------------
  // If error page (logo)
  if (isErrorPage) {
    return (
      <header className="bg-white shadow-md flex justify-center items-center py-4">
        <Link href="/">
          <Image
            src="/tuulo_logo.png"
            alt="Tuulo Logo"
            width={150}
            height={60}
            className="h-auto"
          />
        </Link>
      </header>
    );
  }

  // Case 1: No user (logo + login form)
  if (!loading && !user) {
    return (
      <header className="bg-white shadow-md flex-col flex md:flex-row justify-between items-center py-2 px-4 md:px-20 gap-6">
        <Link href="/">
          <Image
            src="/tuulo_logo.png"
            alt="Tuulo Logo"
            width={150}
            height={60}
            className="h-auto"
          />
        </Link>
        <div className="py-6 md:py-0">
          <LoginForm />
        </div>
      </header>
    );
  }

  // Case 2: Logged in with status pending/rejected (logo + logout button)
  if (
    user &&
    (familyStatus === "pending" ||
      familyStatus === "rejected" ||
      familyStatus === null)
  ) {
    return (
      <header className="bg-white shadow-md flex justify-center items-center py-2 px-4 md:px-20 flex-wrap w-full">
        <Link href="/">
          <Image
            src="/tuulo_logo.png"
            alt="Tuulo Logo"
            width={150}
            height={60}
            className="h-auto"
          />
        </Link>
        <div className="flex flex-wrap md:flex-col flex-row gap-1 absolute top-20 md:top-6 right-12 items-end">
          <span>Bienvenue, {user.firstName} !</span>
          <div className="flex items-center space-x-2 text-red-400 hover:text-red-400 ">
            <UserCircle size={20} />
            <button
              onClick={handleLogout}
              className="mt-1 text-sm transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Case 3: Logged in with status active (logo + welcome message)
  if (user && familyStatus === "active") {
    return (
      <header className="relative bg-white shadow-md flex justify-center items-center py-2 flex-wrap w-full gap-4 md:px-20 px-4">
        <Link href="/home">
          <Image
            src="/tuulo_logo.png"
            alt="Tuulo Logo"
            width={150}
            height={60}
            className="h-auto"
          />
        </Link>
        <span className="absolute right-12 items-end hidden md:flex">
          Bienvenue, {user.firstName}!
        </span>
      </header>
    );
  }

  return null;
}
