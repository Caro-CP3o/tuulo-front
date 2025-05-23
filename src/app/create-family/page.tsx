"use client";
import { useState } from "react";
import { createFamily } from "../../../lib/api";

export default function CreateFamilyForm() {
  const [name, setName] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const res = await fetch("/api/family/create", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ name, coverImage, description }),
  //   });
  //   const data = await res.json();
  //   setMessage(data.message || data.error);
  // };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await createFamily({ name, coverImage, description });
    setMessage(res.message || res.error || "Something went wrong");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">New family - step 2</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Family Name"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="Your Email"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Password"
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Family
        </button>
      </form>
      {message && <p className="mt-4 text-gray-700">{message}</p>}
    </div>
  );
}
