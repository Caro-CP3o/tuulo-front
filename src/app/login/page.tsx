"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
// import { login } from "../../../../lib/api";

export default function LoginPage() {
  // const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // await login(form);
      // router.push(uth/home-family");
      await login(form);
      window.location.href = "/home"; // reloads the page to give access to cookie ?
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Log in to Tuulo</h2>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="w-full px-4 py-2 border rounded-xl"
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="w-full px-4 py-2 border rounded-xl"
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Logging in…" : "Log In"}
        </button>
      </form>
    </div>
  );
}
