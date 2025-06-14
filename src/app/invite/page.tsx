"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function InvitePage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (code) {
      // Optional: validate code with backend
      fetch(`http://localhost:8000/api/validate-invitation?code=${code}`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then(() => setValid(true))
        .catch(() => setValid(false))
        .finally(() => setLoading(false));
    } else {
      setValid(false);
      setLoading(false);
    }
  }, [code]);

  if (loading) return <p className="p-4">Loading invitation...</p>;
  if (!valid)
    return (
      <p className="p-4 text-red-600">Invalid or expired invitation code.</p>
    );

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🎉 You’ve been invited!</h1>
      <p className="mb-4">
        Invitation code: <strong>{code}</strong>
      </p>
      <a
        href={`/register?code=${code}`}
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Accept Invitation
      </a>
    </div>
  );
}
