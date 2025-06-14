"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { registerUser } from "@/lib/api";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [color, setColor] = useState("#000000");
  const [alias, setAlias] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) setInvitationCode(code);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("birthDate", birthDate);
    formData.append("color", color);
    if (alias) formData.append("alias", alias);
    if (avatar) formData.append("avatar", avatar);
    if (invitationCode) formData.append("invitationCode", invitationCode);

    try {
      const result = await registerUser(formData);
      if (result.error) {
        setError(result.error);
      } else {
        alert(
          "Félicitaions ! Vous faites désormais partie de la grande famille Tuulo ! Veuillez consulter votre boîte mail pour confirmer votre inscription."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est sruvenue ! Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Email"
        className="w-full p-2 border rounded"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="Password"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
        placeholder="First Name"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
        placeholder="Last Name"
        className="w-full p-2 border rounded"
      />
      <input
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        placeholder="Alias (optional)"
        className="w-full p-2 border rounded"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setAvatar(e.target.files[0]);
          }
        }}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        value={invitationCode}
        onChange={(e) => setInvitationCode(e.target.value)}
        placeholder="Invitation code (if you have one)"
        className="w-full p-2 border rounded"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
