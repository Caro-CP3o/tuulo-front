"use client";

import { useEffect, useState } from "react";
import { fetchMe, fetchMyFamily } from "@/lib/api";
import { hasRole } from "@/helpers/auth";
import Image from "next/image";
import { UserType } from "@/types/api";

export default function Banner() {
  // ---------------------------
  // State variables
  // ---------------------------
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);

  // ---------------------------
  // Load user and family data on mount
  // ---------------------------
  useEffect(() => {
    async function loadUserAndFamily() {
      try {
        // Fetch logged-in user
        const currentUser = await fetchMe();
        setUser(currentUser);
        // Check if user has ROLE_USER
        if (!hasRole(currentUser, "ROLE_USER")) return;
        // Fetch family data
        const { data, error } = await fetchMyFamily();
        if (error) {
          setError(error);
        } else {
          let url = null;
          // Check if coverImage is a string or an object
          if (typeof data?.coverImage === "string") {
            url = `${process.env.NEXT_PUBLIC_API_URL}${data?.coverImage}`;
          } else if (data?.coverImage?.contentUrl) {
            url = `${process.env.NEXT_PUBLIC_API_URL}${data?.coverImage.contentUrl}`;
          }
          setCoverImage(url);
        }
      } catch {
        setError("Failed to load user or family.");
      }
    }

    loadUserAndFamily();
  }, []);
  // ---------------------------
  // Conditional rendering
  // ---------------------------
  if (!user || !hasRole(user, "ROLE_USER")) {
    return null;
  }

  if (error) {
    return <div className="bg-red-100 text-red-600 p-4">Error: {error}</div>;
  }

  if (!coverImage) {
    return <div className="h-48 bg-gray-100 animate-pulse" />;
  }

  return (
    <div className="h-48 w-full overflow-hidden">
      <Image
        src={coverImage}
        alt="Family Cover"
        className="w-full h-full object-cover"
        width={1200}
        height={400}
        unoptimized
      />
    </div>
  );
}
