"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteFamily, getFamilyById, updateFamily } from "@/lib/api";
// import CoverImagePicker from "../atoms/CoverImagePicker";
import { FamilyType } from "@/types/api";
import CoverImagePicker from "@/app/components/atoms/CoverImagePicker";

interface UpdateFamilyFormProps {
  familyId: number;
  onSuccess?: () => void;
}

export default function UpdateFamilyForm({
  familyId,
  onSuccess,
}: UpdateFamilyFormProps) {
  // ---------------------------
  // State variables
  // ---------------------------
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  // ---------------------------
  // Fetch family data
  // ---------------------------
  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const data: FamilyType = await getFamilyById(familyId);
        setName(data.name || "");
        setDescription(data.description || "");
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données de la famille.");
      } finally {
        setLoading(false);
      }
    };

    fetchFamily();
  }, [familyId]);

  // ---------------------------
  // Handler deletes family
  // ---------------------------
  const handleDelete = async () => {
    const confirmed = confirm(
      "Êtes-vous sûr de vouloir supprimer cette famille ? Cette action est irréversible"
    );
    if (!confirmed) return;

    try {
      await deleteFamily(familyId);
      router.push("/home");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Impossible de supprimer la famille.");
    }
  };

  // ---------------------------
  // Form submit handler
  // ---------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    if (!name.trim()) {
      setError("Le nom de la famille est requis.");
      setSubmitting(false);
      return;
    }

    if (coverImage) {
      const isImage = coverImage.type.startsWith("image/");
      if (!isImage) {
        setError("Le fichier de couverture doit être une image.");
        setSubmitting(false);
        return;
      }
      if (coverImage.size > MAX_IMAGE_SIZE) {
        setError("L'image dépasse la taille maximale autorisée de 5MB.");
        setSubmitting(false);
        return;
      }
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    if (coverImage) formData.append("coverImage", coverImage);

    try {
      await updateFamily(familyId, formData);
      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/home");
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Échec de la mise à jour de la famille.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center">Chargement...</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 bg-white p-4 rounded shadow-sm"
    >
      <h2 className="text-xl font-semibold">Mettre à jour la famille</h2>

      <div>
        <label className="block font-medium">Nom de la famille</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 mt-1"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </div>

      <CoverImagePicker coverImage={coverImage} setCoverImage={setCoverImage} />

      <button
        type="submit"
        disabled={submitting}
        className="ml-auto bg-blue-900 text-white px-4 py-2 rounded hover:bg-red-400 disabled:opacity-50"
      >
        {submitting ? "Mise à jour..." : "Mettre à jour"}
      </button>
      <div className="w-full">
        <p className="text-red-400 border border-red-400 rounded-xl font-semibold p-4 mt-6">
          Attention, cette action est irréversible et entraînera la suppression
          de toutes les données associées à cette famille. Cependant vous et les
          membres de la famille conserveront votre profil personnel. Vous aurez
          ainsi la possibilité de créer/rejoindre une nouvelle famille.
        </p>
      </div>
      <button
        type="button"
        onClick={handleDelete}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-fit"
      >
        Supprimer la famille
      </button>

      {error && <p className="text-red-600">{error}</p>}
      {success && (
        <p className="text-green-600">
          Votre famille a été mise à jour avec succès !
        </p>
      )}
    </form>
  );
}
