"use client";

import { useState } from "react";
import { joinFamilyRequest } from "../../lib/api";
// import { joinFamilyRequest } from "@/lib/api";

export default function JoinRequestForm() {
  const [email, setEmail] = useState("");
  const [familyCode, setFamilyCode] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await joinFamilyRequest({ email, familyCode });
    setMessage(res.message || res.error || "Something went wrong");
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Request to Join Family</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          value={familyCode}
          onChange={(e) => setFamilyCode(e.target.value)}
          placeholder="Family code"
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
