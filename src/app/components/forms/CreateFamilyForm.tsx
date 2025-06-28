"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFamilyAndLinkUser } from "@/lib/api";
import CoverImagePicker from "../atoms/CoverImagePicker";

type CreateFamilyFormProps = {
  onSuccess?: () => void;
};

export default function CreateFamilyForm({ onSuccess }: CreateFamilyFormProps) {
  // ---------------------------
  // State variables
  // ---------------------------
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  // --------------------------------------------------
  // Form submit handler
  // --------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    // Field validation
    if (!name.trim()) {
      setError("Le nom de la famille est requis.");
      setLoading(false);
      return;
    }

    // Image validation
    if (coverImage) {
      const isImage = coverImage.type.startsWith("image/");
      if (!isImage) {
        setError("Le fichier de couverture doit être une image.");
        setLoading(false);
        return;
      }
      if (coverImage.size > MAX_IMAGE_SIZE) {
        setError("L'image dépasse la taille maximale autorisée de 5MB.");
        setLoading(false);
        return;
      }
    }

    // Prapare form data
    const data = new FormData();
    data.append("name", name.trim());
    data.append("description", description.trim());
    if (coverImage) data.append("coverImage", coverImage);

    // API call
    const { error } = await createFamilyAndLinkUser(data);

    if (error) {
      setError(error);
    } else {
      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/home");
      }
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-4 rounded shadow-sm"
    >
      <h2 className="text-xl font-semibold">Créer une famille</h2>

      <div>
        <label className="block font-medium">Le nom de votre famille</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 mt-1"
          required
        />
      </div>

      <div>
        <label className="block font-medium">
          Une courte description ou une citation qui représente votre famille
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </div>

      <CoverImagePicker coverImage={coverImage} setCoverImage={setCoverImage} />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-red-400 disabled:opacity-50"
      >
        {loading ? "Création en cours..." : "Créér ma famille"}
      </button>

      {error && <p className="text-red-600">{error}</p>}
      {success && (
        <p className="text-green-600">
          Votre famille a été créée avec succès !
        </p>
      )}
    </form>
  );
}
