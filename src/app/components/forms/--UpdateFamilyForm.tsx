"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  familyId: number;
  initialName: string;
  initialDescription: string;
}

export default function UpdateFamilyForm({
  familyId,
  initialName,
  initialDescription,
}: Props) {
  // ---------------------------
  // State variables
  // ---------------------------
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  console.log(familyId);

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

    try {
      // await updateFamily(familyId, formData); // you should implement this
      alert("Family updated successfully!");
      router.push("/home");
    } catch {
      setError("Failed to update family.");
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
