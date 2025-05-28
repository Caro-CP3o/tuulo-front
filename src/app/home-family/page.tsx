"use client";

import { useEffect, useState } from "react";
import { fetchMyFamily } from "../../../lib/api";
import Image from "next/image";

type Family = {
  id: number;
  name: string;
  description?: string;
  coverImage?: { contentUrl: string } | string | null;
};

export default function FamilyPage() {
  const [family, setFamily] = useState<Family | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFamily = async () => {
      const { data, error } = await fetchMyFamily();
      if (error) {
        setError(error);
      } else {
        setFamily(data);
      }
    };

    loadFamily();
  }, []);

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  if (!family) {
    return <div>Loading family info...</div>;
  }

  const coverImageUrl =
    typeof family.coverImage === "string"
      ? `http://localhost:8000${family.coverImage}`
      : family.coverImage?.contentUrl
      ? `http://localhost:8000${family.coverImage.contentUrl}`
      : null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{family.name}</h1>

      {coverImageUrl && (
        <Image
          src={coverImageUrl}
          alt="Family Cover"
          className="w-full h-64 object-cover rounded-lg mb-4"
          width={1200}
          height={256}
          unoptimized
        />
      )}

      <p className="text-gray-700">
        {family.description || "No description provided."}
      </p>
    </div>
  );
}
