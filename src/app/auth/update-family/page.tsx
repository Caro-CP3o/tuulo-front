"use client";

import { useEffect, useState } from "react";
import { getFamilyById } from "@/lib/api";
import { useRouter } from "next/navigation";

interface UpdateFamilyPageProps {
  familyId: number;
}

export default function UpdateFamilyPage({ familyId }: UpdateFamilyPageProps) {
  // ---------------------------
  // State variables
  // ---------------------------
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ---------------------------
  // Fetch family on mount
  // ---------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFamilyById(familyId);
        setName(data.name || "");
        setDescription(data.description || "");
      } catch (e) {
        setError("Failed to load family data.");
      }
    };

    fetchData();
  }, [familyId]);

  // ---------------------------
  // Handle form submission
  // ---------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Build form data to send only changed fields
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (coverImage) formData.append("coverImage", coverImage);

    if (error) {
      setError(error);
    } else {
      alert("Family updated successfully!");
      router.push("/home");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Update Family</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Family Name</label>
          <input
            type="text"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">Description</label>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Update Family
        </button>
      </form>
    </div>
  );
}
