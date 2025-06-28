"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import MediaPicker from "../atoms/MediaPicker";

type EditPostModalProps = {
  isOpen: boolean;
  initialTitle: string;
  initialContent: string;
  imageUrl?: string;
  onClose: () => void;
  onSave: (data: {
    title: string;
    content: string;
    imageFile: File | null;
    videoFile: File | null;
  }) => void;
};

export default function EditPostModal({
  isOpen,
  initialTitle,
  initialContent,
  imageUrl,
  onClose,
  onSave,
}: EditPostModalProps) {
  // ---------------------------
  // State variables
  // ---------------------------
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [file, setFile] = useState<File | null>(null);

  // ---------------------------
  // Effect filled out form
  // ---------------------------
  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setFile(null);
  }, [isOpen, initialTitle, initialContent]);

  if (!isOpen) return null;

  const isImageFile = file?.type?.startsWith("image/");
  const isVideoFile = file?.type?.startsWith("video/");

  return (
    <div className="fixed inset-0 z-[9988] flex items-center justify-center bg-white/70">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Modifier le post</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre"
            className="border p-2 rounded"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contenu"
            className="border p-2 rounded"
          />
          <MediaPicker file={file} setFile={setFile} />

          {/* Display existing image if no new file is selected */}
          {!file && imageUrl && (
            <div className="relative w-full aspect-[3/2] rounded overflow-hidden">
              <Image
                src={imageUrl}
                alt="Current post image"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* preview of new image/video */}
          {file && isImageFile && (
            <div className="relative w-full aspect-[3/2] rounded overflow-hidden">
              <Image
                src={URL.createObjectURL(file)}
                alt="Image sélectionnée"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          {file && isVideoFile && (
            <video
              src={URL.createObjectURL(file)}
              controls
              className="w-full rounded"
            />
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() =>
                onSave({
                  title,
                  content,
                  imageFile: isImageFile ? file : null,
                  videoFile: isVideoFile ? file : null,
                })
              }
              className="bg-blue-900 text-white px-4 py-1 rounded hover:bg-red-400"
            >
              Enregistrer
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
