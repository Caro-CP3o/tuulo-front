import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";

// Max allowed image size (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function AvatarPicker({
  avatar,
  setAvatar,
}: {
  avatar: File | null;
  setAvatar: (file: File | null) => void;
}) {
  // ---------------------------
  // Local state & refs
  // ---------------------------
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------
  // Effect to update preview URL when avatar changes
  // ---------------------------
  useEffect(() => {
    if (!avatar) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(avatar);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [avatar]);

  // ---------------------------
  // Handlers
  // ---------------------------
  const handleSelectAvatar = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Le fichier sélectionné doit être une image.");
      setAvatar(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("L'image dépasse la taille maximale autorisée de 5MB.");
      setAvatar(null);
      return;
    }

    setError(null);
    setAvatar(file);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-4">
        <div
          onClick={handleSelectAvatar}
          className="w-24 h-24 mb-4 rounded-full border-2 border-dashed border-gray-300 cursor-pointer flex items-center justify-center overflow-hidden hover:border-blue-400"
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Avatar preview"
              className="object-cover w-full h-full"
              width={96}
              height={96}
            />
          ) : (
            <span className="text-gray-400 text-sm text-center">Aperçu</span>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleSelectAvatar}
          className="text-sm text-gray-600 hover:text-red-400 underline"
        >
          Choisissez votre avatar
        </button>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
