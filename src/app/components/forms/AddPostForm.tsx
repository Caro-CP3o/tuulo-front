"use client";

import { useState } from "react";
import { createPost } from "@/lib/api";
import { PostType } from "@/types/api";
import MediaPicker from "../atoms/MediaPicker";

type PostFormProps = {
  onCreate?: (post: PostType) => void;
};

export default function PostForm({ onCreate }: PostFormProps) {
  // ---------------------------
  // State variables
  // ---------------------------
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

  // ---------------------------
  // Form submission handler
  // ---------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    if (file) {
      // File validation for type and size
      if (file.type.startsWith("image/")) {
        if (file.size > MAX_IMAGE_SIZE) {
          setError("L'image dépasse la taille maximale autorisée de 5MB.");
          setLoading(false);
          return;
        }
        formData.append("image", file);
      } else if (file.type.startsWith("video/")) {
        if (file.size > MAX_VIDEO_SIZE) {
          setError("La vidéo dépasse la taille maximale autorisée de 50MB.");
          setLoading(false);
          return;
        }
        formData.append("video", file);
      } else {
        setError("Format de fichier non supporté.");
        setLoading(false);
        return;
      }
    }
    const res = await createPost(formData);

    if (res.error) {
      setError(res.error);
    } else {
      const newPost: PostType = res.data;
      onCreate?.(newPost);
      setSuccess(true);
      setTitle("");
      setContent("");
      setFile(null);
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col w-full bg-white rounded-xl overflow-hidden shadow-md"
    >
      <div className="flex flex-col gap-6 md:flex-row w-full">
        <MediaPicker file={file} setFile={setFile} />
        {error && <p className="text-red-600">{error}</p>}
        {success && (
          <p className="text-green-600 mt-auto">
            Votre publication a bien été ajoutée!
          </p>
        )}
      </div>
      <div className="contenu flex-grow flex flex-col">
        <div className="">
          <label className="block font-medium">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 border rounded px-3 py-2 w-full"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Contenu</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 border rounded px-3 py-2 w-full"
            rows={4}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-red-400 disabled:opacity-50"
        >
          {loading ? "En cours d'ajout..." : "Créér une publication"}
        </button>
      </div>
    </form>
  );
}
