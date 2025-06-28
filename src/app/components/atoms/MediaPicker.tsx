"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

export default function MediaPicker({
  file,
  setFile,
}: {
  file: File | null;
  setFile: (file: File | null) => void;
}) {
  // ---------------------------
  // State variables & refs
  // ---------------------------
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);

  // ---------------------------
  // Effect media preview
  // ---------------------------
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setIsVideo(false);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsVideo(file.type.startsWith("video/"));

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // ---------------------------
  // Media picker component
  // ---------------------------
  return (
    <div>
      <div
        onClick={handleClick}
        className="w-full h-48 border rounded px-3 py-2 cursor-pointer flex items-center justify-center overflow-hidden hover:border-blue-400 border-dashed bg-gray-50"
      >
        {previewUrl ? (
          isVideo ? (
            <video
              src={previewUrl}
              controls
              className="object-cover w-full h-full rounded"
            />
          ) : (
            <Image
              src={previewUrl}
              alt="Media preview"
              width={600}
              height={450}
              className="object-cover w-full h-full rounded"
            />
          )
        ) : (
          <span className="text-gray-400 text-sm text-center">
            Cliquez pour ajouter une image ou une vidéo
          </span>
        )}
      </div>

      <input
        type="file"
        accept="image/*,video/*"
        ref={fileInputRef}
        onChange={(e) => {
          const selected = e.target.files?.[0] || null;
          setFile(selected);
        }}
        className="hidden"
      />
    </div>
  );
}
