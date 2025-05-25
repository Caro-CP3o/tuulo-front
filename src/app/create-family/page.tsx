"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
import { createFamily } from "../../../lib/api";

export default function CreateFamilyPage() {
  // const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createFamily({
      name,
      description: description || null,
      coverImage: coverImage || null,
    });

    if ("error" in result) {
      setError(result.error);
    } else {
      // router.push("/dashboard"); // adjust the route as needed
      alert(
        "The family has been created. You're gonna be redirected to the login page."
      );
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow-sm">
      <h1 className="text-xl font-semibold mb-4">Create Your Family</h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Family Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full mt-1 border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium">Cover Image URL</label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full mt-1 border rounded p-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Family"}
        </button>
      </form>
    </div>
  );
}
