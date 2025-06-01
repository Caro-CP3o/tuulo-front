"use client";

import { useState } from "react";
import { createPost } from "@/lib/api"; // adjust path as needed

export default function PostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          formData.append("image", file);
        } else if (file.type.startsWith("video/")) {
          formData.append("video", file); // your backend currently supports one video
        }
      });
    }

    const res = await createPost(formData);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setTitle("");
      setContent("");
      setFiles(null);
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-xl mx-auto p-4 border rounded-xl shadow-sm bg-white"
    >
      <h2 className="text-xl font-semibold">Create a Post</h2>

      <div>
        <label className="block font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 w-full border rounded px-3 py-2"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block font-medium">
          Upload image(s) and/or a video
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="mt-1"
        />
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">Post created successfully!</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Posting..." : "Create Post"}
      </button>
    </form>
  );
}
