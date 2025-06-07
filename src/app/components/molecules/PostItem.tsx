"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { MessageCircle, MoreHorizontal, Star } from "lucide-react";
import { PostType } from "@/types/api";
import { togglePostLike, isPostLiked, deletePost, updatePost } from "@/lib/api"; // <- Add isPostLiked

type PostItemProps = {
  post: PostType;
  onDelete?: (postId: number) => void;
};

export default function PostItem({ post, onDelete }: PostItemProps) {
  const { title, content, createdAt, image, video, author } = post;

  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(title || "");
  const [editContent, setEditContent] = useState(content || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleUpdatePost = async () => {
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("content", editContent);

    const newImageFile = fileInputRef.current?.files?.[0];
    const newVideoFile = videoInputRef.current?.files?.[0];

    if (newImageFile) {
      formData.append("image", newImageFile);
    }

    if (newVideoFile) {
      formData.append("video", newVideoFile);
    }

    const result = await updatePost(
      post.id.toString(),
      formData,
      post.image?.["@id"] || null,
      post.video?.["@id"] || null
    );

    setDropdownOpen(false);
    setEditMode(false);

    if (result.error) {
      alert(`Update failed: ${result.error}`);
    } else {
      alert("Post updated successfully");
      // Optionally reload or re-fetch the updated post
    }
  };
  // const handleUpdatePost = async () => {
  //   const formData = new FormData();
  //   formData.append("title", editTitle);
  //   formData.append("content", editContent);

  //   if (fileInputRef.current?.files?.length) {
  //     for (const file of Array.from(fileInputRef.current.files)) {
  //       formData.append("image", file);
  //     }
  //   }

  //   if (videoInputRef.current?.files?.[0]) {
  //     formData.append("video", videoInputRef.current.files[0]);
  //   }

  //   const result = await updatePost(post.id, formData);
  //   setDropdownOpen(false);
  //   setEditMode(false);

  //   if (result.error) {
  //     alert(`Update failed: ${result.error}`);
  //   } else {
  //     alert("Post updated successfully");
  //     // Optionally: refresh the post list or update UI
  //   }
  // };
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // const authorName =
  //   author?.alias ||
  //   (author?.firstName && author?.lastName
  //     ? `${author.firstName} ${author.lastName}`
  //     : author?.firstName || "Unknown");
  const authorFirstName = author.firstName;
  const authorLastName = author.lastName;
  const alias = author?.alias || "";

  const avatarUrl = author?.avatar?.contentUrl
    ? `http://localhost:8000${author.avatar.contentUrl}`
    : "/default-avatar.png";

  const videoUrl = video?.contentUrl
    ? `http://localhost:8000${post.video?.contentUrl}`
    : null;
  const imageUrl = image?.contentUrl
    ? `http://localhost:8000${image.contentUrl}`
    : null;

  const authorColor = author?.color || "#888888";

  console.log("Image URL:", imageUrl);

  // ✅ Load like status on mount
  useEffect(() => {
    async function loadLikeStatus() {
      try {
        const liked = await isPostLiked(post.id);
        setIsLiked(liked);
      } catch (err) {
        console.error("Error loading like status:", err);
      }
    }

    loadLikeStatus();
  }, [post.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditMode(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDeletePost = async () => {
    setDropdownOpen(false);
    if (!confirm("Are you sure you want to delete this post?")) return;

    const result = await deletePost(post.id);

    if (result.error) {
      alert(`Delete failed: ${result.error}`);
    } else {
      alert("Post deleted successfully");
      if (onDelete) onDelete(post.id);
      // refresh or update post list here
    }
  };

  // --- Handle toggle like ---
  const handleLikeClick = async () => {
    if (loading) return;
    setLoading(true);

    const result = await togglePostLike(post.id);

    if (result.status === "liked") {
      setIsLiked(true);
    } else if (result.status === "unliked") {
      setIsLiked(false);
    } else if (result.error) {
      alert(result.error);
    }

    setLoading(false);
  };

  return (
    <>
      {editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-30">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Modifier le post</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Titre"
                className="border p-2 rounded"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Contenu"
                className="border p-2 rounded"
              />
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                className="block"
              />
              <input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                className="block"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handleUpdatePost}
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-300 text-black px-4 py-1 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row bg-white rounded-xl overflow-hidden shadow-md justify-between">
        {imageUrl && (
          <div className="md:w-1/3 w-full relative aspect-[3/2] md:aspect-auto">
            <Image
              // src={`http://localhost:8000${image?.contentUrl}`}
              src={imageUrl}
              alt="Post image"
              className="object-cover rounded"
              fill
              unoptimized
            />
          </div>
        )}

        <div className="flex flex-col justify-between w-full">
          <div className="flex" style={{ backgroundColor: `${authorColor}50` }}>
            <div className="flex flex-col items-center p-4">
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={50}
                height={50}
                className="rounded-full object-cover mb-2"
                unoptimized
              />
              {videoUrl && (
                <video controls className="mt-2 w-full max-w-md">
                  <source src={videoUrl} />
                </video>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <p className="satisfy text-xl">
                {authorFirstName} {authorLastName} - {alias}
              </p>
              <p className="text-sm">
                {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="relative ml-auto" ref={dropdownRef}>
              <button
                aria-label="More options"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <MoreHorizontal className="w-6 h-6 text-gray-600" />
              </button>

              {dropdownOpen && (
                <ul className="absolute right-1 mt-2 w-40 bg-white rounded shadow-md z-10">
                  <li>
                    <button
                      // onClick={handleUpdatePost}
                      onClick={() => {
                        setEditMode(true);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 rounded hover:bg-gray-100"
                    >
                      Mettre à jour le post
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleDeletePost}
                      className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 text-red-600"
                    >
                      Effacer le post
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between p-4">
            <h2 className="text-xl font-semibold capitalize">{title}</h2>
            <p className="mt-2 capitalize">{content}</p>
          </div>

          <div className="flex gap-2 text-gray-500 hover:text-black p-4 ml-auto">
            <button aria-label="Favorite" onClick={handleLikeClick}>
              <Star
                className={`w-6 h-6 transition-colors ${
                  isLiked ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                } hover:text-yellow-500 hover:fill-yellow-500`}
              />
            </button>
            <button aria-label="Comment">
              <MessageCircle className="w-6 h-6 hover:text-blue-500" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
