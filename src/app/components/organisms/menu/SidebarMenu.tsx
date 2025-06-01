"use client";

import { useEffect, useState } from "react";
import { fetchMe, fetchMyFamily } from "@/lib/api";
import { FamilyType, UserType } from "@/types/api";
import { hasRole } from "@/helpers/auth";
// import { User, Family } from "@/types"; // Optional if you want to define types
import {
  UserCircle,
  MessageSquareText,
  Settings,
  Notebook,
  Home,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// type Family = {
//   id: number;
//   name: string;
//   description?: string;
//   coverImage?: { contentUrl: string } | string | null;
// };

// type User = {
//   id: number;
//   alias: string;
//   firstName: string;
//   lastName: string;
//   color: string;
//   description?: string;
//   avatar?: { contentUrl: string } | string | null;
// };

export default function SidebarMenu() {
  const [user, setUser] = useState<UserType | null>(null);
  const [family, setFamily] = useState<FamilyType | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const me = await fetchMe();
        setUser(me);

        // if (me.family && typeof me.family === "object" && me.family.id) {
        //   const { data } = await fetchMyFamily();
        //   setFamily(data);
        // }
        const { data } = await fetchMyFamily();
        setFamily(data);
      } catch (err) {
        console.error("Failed to load sidebar data:", err);
      }
    }
    loadData();
  }, []);

  if (!user) return null;

  if (!user || !hasRole(user, "ROLE_USER")) {
    return null;
  }

  //   const avatarUrl = typeof user.avatar === "object" ? user.avatar : user.avatar;
  const avatarUrl =
    typeof user.avatar === "object" && user.avatar?.contentUrl
      ? `http://localhost:8000${user.avatar.contentUrl}`
      : typeof user.avatar === "string"
      ? `http://localhost:8000${user.avatar}`
      : null;

  const displayName = user.alias || `${user.firstName} ${user.lastName}`;
  const borderColor = user.color || "#ccc";

  return (
    <aside className="fixed w-[18.75rem] px-[45px] pt-16 bg-white border-r border-gray-200 flex flex-col items-center min-h-screen">
      {/* Avatar */}
      {avatarUrl ? (
        <div
          className="w-24 h-24 rounded-full overflow-hidden border-[5px] mb-4"
          style={{ borderColor }}
        >
          <Image
            src={avatarUrl}
            alt="User avatar"
            width={96}
            height={96}
            className="object-cover w-full h-full"
            unoptimized
          />
        </div>
      ) : (
        <div
          className="w-24 h-24 rounded-full overflow-hidden border-[5px] mb-4 bg-gray-200 flex items-center justify-center text-gray-500"
          style={{ borderColor }}
        >
          No Avatar
        </div>
      )}
      {/* User Name */}
      <div className="text-lg font-semibold text-center mb-5">
        {displayName}
      </div>

      {/* Menu Section Title */}
      <div className="uppercase text-gray-500 mb-6 tracking-wider text-center">
        <h1>La famille {family?.name || "Your Family"}</h1>
      </div>

      {/* Menu Items */}
      {/* <nav className="flex flex-col space-y-4 w-full text-center">
        <MenuItem icon={<UserCircle size={20} />} label="Profile" />
        <MenuItem icon={<Notebook size={20} />} label="Notes" />
        <MenuItem icon={<MessageSquareText size={20} />} label="Messages" />
        <MenuItem icon={<Settings size={20} />} label="Settings" />
      </nav> */}
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
        <Link href="#">
          <MenuItem icon={<Settings size={20} />} label="Settings" />
        </Link>
      </nav>
    </aside>
  );
}

function MenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center space-x-3 text-gray-700 hover:text-black cursor-pointer justify-start">
      {icon}
      <span className="text-md font-medium">{label}</span>
    </div>
  );
}
