"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InvitationModal({ onClose }: { onClose: () => void }) {
  // ---------------------------
  // State variables
  // ---------------------------
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // ---------------------------
  // Form submission handler
  // ---------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // API call to link user to family
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/join-family`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code }),
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Erreur de liaison à la famille.");

      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  return (
    <div className="fixed inset-0 bg-blue-900 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-md shadow">
        <h2 className="text-xl font-bold mb-4">Rejoindre une famille</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Code d’invitation"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          {error && <p className="text-red-400">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="text-gray-600">
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-900 hover:bg-red-400/50 text-white px-4 py-2 rounded"
            >
              Rejoindre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
