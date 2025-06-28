import { UserType, FamilyType } from "@/types/api";

import {
  UserCircle,
  MessageSquareText,
  Settings,
  Notebook,
  Home,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import AvatarBlock from "./AvatarBlock";
import MenuItem from "./MenuItem";
import { useRouter } from "next/navigation";
import { logout as logoutApi } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { hasRole } from "@/helpers/auth";

export default function SidebarContent({
  user,
  family,
}: {
  user: UserType;
  family: FamilyType | null;
}) {
  const displayName = user.alias || `${user.firstName} ${user.lastName}`;
  const router = useRouter();
  const { setUser } = useAuth();
  // ---------------------------
  // Logout handler
  // ---------------------------
  const handleLogout = async () => {
    try {
      await logoutApi();
      localStorage.setItem("justLoggedOut", "1");
      setUser(null);
      router.push("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  return (
    <>
      <div className="border-r-3 border-red-400/25 md:p-10 p-1 flex flex-col items-center justify-center">
        <AvatarBlock avatar={user.avatar || null} color={user.color} />
        <div className="satisfy text-2xl text-center mb-5">{displayName}</div>
        <div className="uppercase mb-6 text-m font-semibold text-center">
          <h2>La famille {family?.name || "Your Family"}</h2>
        </div>
        <nav className="flex flex-col space-y-4 w-full text-center">
          <Link href="/home">
            <MenuItem icon={<Home size={20} />} label="Home" />
          </Link>
          <Link href="/profile">
            <MenuItem icon={<UserCircle size={20} />} label="Profile" />
          </Link>
          <Link href="#">
            <MenuItem icon={<Notebook size={20} />} label="Notes" />
          </Link>
          <Link href="#">
            <MenuItem icon={<MessageSquareText size={20} />} label="Messages" />
          </Link>
          {/* Admin section */}
          {hasRole(user, "ROLE_FAMILY_ADMIN") && (
            <Link href="/settings">
              <MenuItem icon={<Settings size={20} />} label="Settings" />
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-800 transition-colors"
          >
            <MenuItem icon={<LogOut size={20} />} label="Se déconnecter" />
          </button>
        </nav>
      </div>
    </>
  );
}
