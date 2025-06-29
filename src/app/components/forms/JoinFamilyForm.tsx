"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function JoinFamilyForm() {
  // Retrieve code from url
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code") || "";
  // ---------------------------
  // State variables
  // ---------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invitationCode, setInvitationCode] = useState(codeFromUrl);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --------------------------------------------------
  // Form submit handler
  // --------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // 1. Login user
      const loginRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/login_check`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      if (!loginRes.ok) {
        throw new Error("Login failed. Check your credentials.");
      }

      // 2. Join family
      const joinRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/join-family`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code: invitationCode }),
        }
      );

      const joinData = await joinRes.json();

      if (!joinRes.ok) {
        throw new Error(joinData.error || "Failed to join family");
      }

      setSuccess(joinData.message);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Join a Family</h1>

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}

      <input
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2 p-2 w-full border rounded"
      />

      <input
        type="password"
        required
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-2 p-2 w-full border rounded"
      />

      <input
        type="text"
        required
        placeholder="Invitation Code"
        value={invitationCode}
        onChange={(e) => setInvitationCode(e.target.value)}
        className="mb-4 p-2 w-full border rounded"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Join Family
      </button>
    </form>
  );
}
