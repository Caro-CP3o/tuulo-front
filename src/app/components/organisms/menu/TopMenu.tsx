"use client";

import Link from "next/link";
import Image from "next/image";
import LoginForm from "../../forms/LoginForm";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api";
import { UserCircle } from "lucide-react";
import { useErrorPage } from "@/app/context/ErrorPageContext";
import { useEffect, useState } from "react";

export default function TopMenu() {
  const { user, loading, refresh } = useAuth();
  const { isErrorPage } = useErrorPage();
  const router = useRouter();

  const familyStatus = user?.familyMembers?.[0]?.status ?? null;

  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // ---------------------------
  // Effect track scroll up & down
  // ---------------------------
  useEffect(() => {
    // Only apply this effect on mobile widths (<= 768px)
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down and scrolled more than 50px → hide
        setIsHidden(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up → show
        setIsHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // ---------------------------
  // Logout handler & refresh context
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

  const baseHeaderClasses =
    "bg-white shadow-md flex justify-center items-center py-2 w-full gap-4 md:px-20 px-4 fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out";

  // Combine with translateY class depending on isHidden
  // When hidden, move header up full height (hide it)
  // When visible, reset transform to 0
  const headerClasses = isHidden
    ? `${baseHeaderClasses} -translate-y-full`
    : `${baseHeaderClasses} translate-y-0`;

  // ---------------------------
  // Conditional rendering
  // ---------------------------
  // If error page (logo)
  if (isErrorPage) {
    return (
      <header
        className={`${headerClasses} flex justify-center items-center py-4`}
      >
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
      <header
        className={`${headerClasses} flex-col md:flex-row justify-between items-center gap-6`}
      >
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
      <header
        className={`${headerClasses} flex-wrap flex justify-center items-center`}
      >
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
      <header
        className={
          headerClasses + " relative flex-wrap justify-center items-center"
        }
      >
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
