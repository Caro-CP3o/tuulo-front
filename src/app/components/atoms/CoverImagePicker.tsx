"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

export default function CoverImagePicker({
  coverImage,
  setCoverImage,
}: {
  coverImage: File | null;
  setCoverImage: (file: File | null) => void;
}) {
  // ---------------------------
  // Local state & refs
  // ---------------------------
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // ---------------------------
  // Effect to preview coverImage
  // ---------------------------
  useEffect(() => {
    if (!coverImage) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(coverImage);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [coverImage]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block font-medium mb-2">Une image de couverture</label>
      <div
        onClick={handleClick}
        className="w-full h-32 border rounded px-3 py-2 cursor-pointer flex items-center justify-center overflow-hidden hover:border-blue-400 border-dashed bg-gray-50"
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Cover preview"
            width={800}
            height={450}
            className="object-cover w-full h-full rounded"
          />
        ) : (
          <span className="text-gray-400 text-sm text-center">
            Cliquez pour ajouter une image
          </span>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setCoverImage(e.target.files[0]);
          }
        }}
        className="hidden"
      />
    </div>
  );
}
