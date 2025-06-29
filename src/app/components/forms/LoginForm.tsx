"use client";

import { useState } from "react";
import { login } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  // ---------------------------
  // State variables
  // ---------------------------
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Refresh context after loggin
  const { refresh } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form);
      await refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Une erreur inconnue est survenue."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center flex-wrap">
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="border px-2 py-1 rounded"
        value={form.email}
        onChange={handleChange}
        required
      />
      {/* Password field with toggle */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Mot de passe"
          className="border px-2 py-1 rounded pr-10 w-full"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <button
        type="submit"
        className="bg-blue-900 text-white px-3 py-1 rounded hover:bg-red-400"
        disabled={loading}
      >
        {loading ? "En cours…" : "Se connecter"}
      </button>
      {error && <p className="text-red-400 text-sm ml-2">{error}</p>}
    </form>
  );
}
