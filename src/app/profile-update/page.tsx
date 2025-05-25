//

"use client";

import { useEffect, useState } from "react";
import { updateMe, fetchMe } from "../../../lib/api";
import Image from "next/image";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [color, setColor] = useState("");
  const [alias, setAlias] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await fetchMe();
        setEmail(user.email);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setBirthDate(user.birthDate || "");
        setColor(user.color || "#000000");
        setAlias(user.alias || "");
        // setCurrentAvatarUrl(user.avatar?.contentUrl || null);
        setCurrentAvatarUrl(
          user.avatar?.contentUrl
            ? `http://localhost:8000${user.avatar.contentUrl}`
            : null
        );
      } catch (err) {
        console.error("Fetch error", err);
        setError("Failed to load profile.");
      }
    }
    loadProfile();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // const formData = new FormData();
    // if (password) formData.append("password", password);
    // formData.append("firstName", firstName);
    // formData.append("lastName", lastName);
    // formData.append("birthDate", birthDate);
    // formData.append("alias", alias);
    // if (avatar) formData.append("avatar", avatar);
    const user = await fetchMe();

    const formData = new FormData();
    if (password) formData.append("password", password);
    if (firstName !== user.firstName) formData.append("firstName", firstName);
    if (lastName !== user.lastName) formData.append("lastName", lastName);
    if (birthDate !== user.birthDate) formData.append("birthDate", birthDate);
    if ((alias || "") !== (user.alias || ""))
      formData.append("alias", alias || "");
    if (avatar) formData.append("avatar", avatar);

    const result = await updateMe(formData);
    if (result.error) {
      setError(result.error);
    } else {
      alert("Profile updated successfully!");
      if (avatar) setCurrentAvatarUrl(previewUrl);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4">{firstName}&apos;s Profile</h1>

      {/* <div className="flex flex-col items-center mb-4">
        {previewUrl || currentAvatarUrl ? (
          <img
            src={previewUrl || currentAvatarUrl || ""}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover mb-2"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mb-2">
            No Avatar
          </div>
        )}
        <label className="cursor-pointer text-blue-600 hover:underline">
          Change Avatar
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </label>
      </div> */}
      <div className="flex flex-col items-center mb-4">
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
        <label className="cursor-pointer text-blue-600 hover:underline">
          Change Avatar
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          readOnly
          className="w-full p-2 border rounded bg-gray-100"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="color"
          value={color}
          readOnly
          className="w-full p-2 border rounded bg-gray-100"
        />
        <input
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="Alias (optional)"
          className="w-full p-2 border rounded"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
