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
  // ---------------------------
  // State variables
  // ---------------------------
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showLoginForm, setShowLoginForm] = useState(false);

  // ---------------------------
  // Effect track scroll up & down
  // ---------------------------
  useEffect(() => {
    // Only apply this effect on mobile widths (<= 768px)
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 10) {
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
  // Error page (logo))
  // ---------------------------
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
  // ---------------------------
  // Case 1: No user (logo + login form)
  // ---------------------------
  if (!loading && !user) {
    return (
      <header
        className={`${headerClasses} flex justify-between items-center w-full`}
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
        <div className="flex-1"></div>
        {/* Desktop: show login form */}
        <div className="hidden md:block">
          <LoginForm />
        </div>
        {/* Mobile: toggle login form */}
        <div className="md:hidden">
          <button onClick={() => setShowLoginForm(!showLoginForm)}>
            <UserCircle
              size={28}
              className={
                showLoginForm ? "text-emerald-600/70" : "text-blue-900/70"
              }
            />
          </button>
        </div>
        {/* Mobile: show/hide form below */}
        {showLoginForm && (
          <div className="absolute top-full left-0 w-full bg-white shadow-md p-4 z-50">
            <LoginForm />
          </div>
        )}
      </header>
    );
  }
  // ---------------------------
  // Case 2: Logged in with status pending/rejected (logo + logout button
  // ---------------------------
  if (
    user &&
    (familyStatus === "pending" ||
      familyStatus === "rejected" ||
      familyStatus === null)
  ) {
    return (
      <header
        className={`${headerClasses} flex justify-between items-center w-full`}
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
        <div className="flex-1"></div>
        {/* Desktop: full welcome + logout */}
        <div className="hidden md:flex flex-col items-end">
          <span>Bienvenue, {user.firstName} !</span>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-400 hover:text-red-500"
          >
            <UserCircle size={20} className="mr-1" />
            <span className="text-sm">Se déconnecter</span>
          </button>
        </div>
        {/* Mobile: just logout icon */}
        <div className="md:hidden">
          <button onClick={handleLogout}>
            <UserCircle size={28} className="text-red-400" />
          </button>
        </div>
      </header>
    );
  }
  // ---------------------------
  // Case 3: Logged in with status active (logo + welcome message)
  // ---------------------------
  if (user && familyStatus === "active") {
    return (
      <header
        className={`${headerClasses} flex justify-between items-center w-full`}
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
        <div className="flex-1"></div>
        {/* Desktop: welcome text */}
        <span className="hidden md:flex">Bienvenue, {user.firstName}!</span>
        {/* Mobile: user icon with green shade */}
        <div className="md:hidden">
          <UserCircle size={28} className="text-emerald-600/50" />
        </div>
      </header>
    );
  }

  return null;
}
