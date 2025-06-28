"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
// ---------------------------
// Link from invitation email with code
// ---------------------------
export default function InvitePage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  // ---------------------------
  // State variables
  // ---------------------------
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState<boolean | null>(null);
  const [familyName, setFamilyName] = useState<string>("");

  // ---------------------------
  // Effect load invite code
  // ---------------------------
  useEffect(() => {
    if (code) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/validate-invitation?code=${code}`
      )
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          setValid(true);
          setFamilyName(data.family?.name || "Inconnue");
        })
        .catch(() => setValid(false))
        .finally(() => setLoading(false));
    } else {
      setValid(false);
      setLoading(false);
    }
  }, [code]);

  if (loading) return <p className="p-4">Chargement de l&apos;invitation...</p>;

  if (!valid)
    return <p className="p-4 text-red-600">Invitation invalide ou expirée.</p>;

  return (
    <div className="p-6 max-w-xl mx-auto text-center !space-y-4">
      <h1 className="text-2xl font-bold mb-4">
        🎉 Vous avez été invité à rejoindre la famille{" "}
        <span className="text-red-400 satisfy text-3xl">{familyName}</span>
      </h1>
      <p className="mb-4">
        Code d&apos;invitation: <strong>{code}</strong>
      </p>
      <a
        href={`/register?code=${code}`}
        className="inline-block bg-blue-900 text-white px-4 py-2 rounded hover:bg-red-400"
      >
        Accepter l&apos;invitation
      </a>
    </div>
  );
}
