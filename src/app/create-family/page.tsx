"use client";

import CreateFamilyForm from "../components/forms/CreateFamilyForm";
import { useState } from "react";
import InvitationModal from "../components/modals/InvitationModal";
import { useRouter } from "next/navigation";
import { deleteMe } from "@/lib/api";

export default function CreateFamilyPage() {
  // ---------------------------
  // State variables
  // ---------------------------
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // ---------------------------
  // Delete user handler
  // ---------------------------
  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ?")) return;

    try {
      setLoading(true);
      const result = await deleteMe();

      if (result.error) {
        setError(result.error);
        return;
      }

      alert("Compte supprimé avec succès.");
      router.push("/"); // Or "/login" if you want user to re-auth
    } catch (err) {
      setError("Une erreur est survenue lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-12 justify-center items-center flex-wrap w-full max-w-7xl my-8">
        {/* Create new family form */}
        <div>
          <CreateFamilyForm />
        </div>
        <div className="text-center">
          <button
            className="bg-red-400 rounded p-3 text-white text-lg hover:bg-white hover:text-blue-900 hover:border hover:border-blue-900"
            onClick={() => setShowModal(true)}
          >
            J&apos;ai déjà un code d&apos;invitation
          </button>
        </div>
        {/* Join existing family with code modal */}
        {showModal && (
          <InvitationModal onClose={() => setShowModal(false)} />
        )}{" "}
      </div>
      <div className="flex justify-center mt-20">
        <button
          onClick={handleDelete}
          className="underline text-red-600 hover:text-white hover:bg-red-500 px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Suppression en cours..." : "Supprimer mon compte"}
        </button>
      </div>
    </>
  );
}
