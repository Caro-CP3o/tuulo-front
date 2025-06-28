"use client";

import { useEffect, useState } from "react";
import { updateMe, fetchMe, deleteMe } from "@/lib/api";
import Image from "next/image";
import { hasRole } from "@/helpers/auth";
import type { UserType } from "@/types/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function ProfilePage() {
  // ---------------------------
  // State variables
  // ---------------------------
  const [user, setUser] = useState<UserType | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [alias, setAlias] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { refresh } = useAuth();

  // ---------------------------
  // Fetch user profile on mount
  // ---------------------------
  useEffect(() => {
    async function loadProfile() {
      try {
        const fetchedUser = await fetchMe();
        setUser(fetchedUser);
        setFirstName(fetchedUser.firstName);
        setLastName(fetchedUser.lastName);
        setAlias(fetchedUser.alias || "");
        setCurrentAvatarUrl(
          fetchedUser.avatar?.contentUrl
            ? `${process.env.NEXT_PUBLIC_API_URL}${fetchedUser.avatar.contentUrl}`
            : null
        );
      } catch (err) {
        console.error("Fetch error", err);
        setError("Failed to load profile.");
      }
    }
    loadProfile();
  }, []);

  // ---------------------------
  // Redirect to home if user is not authorized
  // ---------------------------
  useEffect(() => {
    if (user && !hasRole(user, "ROLE_USER")) {
      router.push("/");
    }
  }, [user, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Failed to load profile</div>;
  }

  // ---------------------------
  // Handle avatar file change and preview
  // ---------------------------
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // ---------------------------
  // Handle profile form submission
  // ---------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    // Build form data to send only changed fields
    const formData = new FormData();
    if (oldPassword) formData.append("oldPassword", oldPassword);
    if (newPassword) formData.append("password", newPassword);
    if (firstName !== user.firstName) formData.append("firstName", firstName);
    if (lastName !== user.lastName) formData.append("lastName", lastName);
    if ((alias || "") !== (user.alias || ""))
      formData.append("alias", alias || "");
    if (avatar) formData.append("avatar", avatar);

    const result = await updateMe(formData);
    if (result.error) {
      setError(result.error);
    } else {
      alert("Profil mis à jour !");
      if (avatar) setCurrentAvatarUrl(previewUrl);
      setOldPassword("");
      setNewPassword("");

      refresh();
      router.push("/home");
    }

    setLoading(false);
  };

  // ---------------------------
  // Handle account deletion with confirmation
  // ---------------------------
  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ?")) return;

    setLoading(true);
    const result = await deleteMe();

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    alert("Compte supprimé avec succès.");
    router.push("/");
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 md:p-10 w-full max-w-6xl mx-auto">
      {/* ---------------------------
          Left panel: user info summary
        --------------------------- */}
      <div className="flex-1 space-y-4 mt-10">
        <h1 className="text-2xl font-bold !mb-10">
          Informations personnelles de <br /> {firstName} {lastName}
        </h1>

        <div className="text-base">
          <p>
            <span className="font-semibold">Email :</span> {user.email}
          </p>
          <p>
            <span className="font-semibold">Date de naissance :</span>{" "}
            {user.birthDate
              ? new Date(user.birthDate).toLocaleDateString("fr-FR")
              : "—"}
          </p>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Couleur :</span>
            <div
              className="w-5 h-5 rounded-full border"
              style={{ backgroundColor: user.color || "#000000" }}
            />
            {user.color || "—"}
          </div>
        </div>
      </div>

      {/* ---------------------------
          Right panel: edit form & avatar
        --------------------------- */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col items-center">
          {previewUrl || currentAvatarUrl ? (
            <Image
              src={previewUrl || currentAvatarUrl || ""}
              alt="Avatar"
              width={96}
              height={96}
              className="rounded-full object-cover mb-2"
              unoptimized
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 mb-2" />
          )}
          <label className="cursor-pointer text-amber-600 hover:underline">
            Changer votre avatar
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Prénom</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nom</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Alias (optionnel)
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Votre mot de passe actuel"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Display server-side error if any */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              {loading ? "En cours..." : "Mettre à jour"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
              Supprimer mon compte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
