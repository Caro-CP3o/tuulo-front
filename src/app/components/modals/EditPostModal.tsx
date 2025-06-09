"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

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
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setImagePreview(null);
    setImageFile(null);
    setVideoFile(null);
  }, [isOpen, initialTitle, initialContent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-30">
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
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              } else {
                setImageFile(null);
                setImagePreview(null);
              }
            }}
            className="block"
          />
          {imageUrl && !imagePreview && (
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
          {imagePreview && (
            <div className="relative w-full aspect-[3/2] rounded overflow-hidden">
              <Image
                src={imagePreview}
                alt="New selected image"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <input
            type="file"
            ref={videoInputRef}
            accept="video/*"
            className="block"
            onChange={(e) => {
              setVideoFile(e.target.files?.[0] || null);
            }}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() =>
                onSave({
                  title,
                  content,
                  imageFile,
                  videoFile,
                })
              }
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
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
