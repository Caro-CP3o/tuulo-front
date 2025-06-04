"use client";

import { useEffect, useState } from "react";
import { fetchMe, fetchMyFamily } from "@/lib/api";
import { hasRole } from "@/helpers/auth";
import Image from "next/image";
import { UserType } from "@/types/api";

export default function Banner() {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    async function loadUserAndFamily() {
      try {
        const currentUser = await fetchMe();
        setUser(currentUser);

        if (!hasRole(currentUser, "ROLE_USER")) return;

        const { data, error } = await fetchMyFamily();
        if (error) {
          setError(error);
        } else {
          let url = null;

          if (typeof data.coverImage === "string") {
            url = `http://localhost:8000${data.coverImage}`;
          } else if (data.coverImage?.contentUrl) {
            url = `http://localhost:8000${data.coverImage.contentUrl}`;
          }

          setCoverImage(url);
        }
      } catch {
        setError("Failed to load user or family.");
      }
    }

    loadUserAndFamily();
  }, []);

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
    <div className="h-48 w-full overflow-hidden z-[300]">
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
