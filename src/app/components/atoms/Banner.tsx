"use client";

import { useEffect, useState } from "react";
import { fetchMyFamily } from "@/lib/api";
import Image from "next/image";

export default function Banner() {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFamily() {
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
    }

    loadFamily();
  }, []);

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
