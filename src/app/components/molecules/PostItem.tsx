"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { MessageCircle, MoreHorizontal, Star } from "lucide-react";
import { PostCommentType, PostType } from "@/types/api";
import {
  togglePostLike,
  isPostLiked,
  deletePost,
  updatePost,
  postComment,
  deleteComment,
  updateComment,
} from "@/lib/api";
import EditPostModal from "../modals/EditPostModal";

type PostItemProps = {
  post: PostType;
  onDelete?: (postId: number) => void;
};

export default function PostItem({ post, onDelete }: PostItemProps) {
  const [postData, setPostData] = useState<PostType>(post);
  const { title, content, createdAt, image, video, author } = postData;

  const [editMode, setEditMode] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const authorFirstName = author.firstName;
  const authorLastName = author.lastName;
  const alias = author?.alias || "";
  const authorColor = author?.color || "#888888";
  const avatarUrl = author?.avatar?.contentUrl
    ? `http://localhost:8000${author.avatar.contentUrl}`
    : "/default-avatar.png";
  const videoUrl = video?.contentUrl
    ? `http://localhost:8000${post.video?.contentUrl}`
    : null;
  const imageUrl = image?.contentUrl
    ? `http://localhost:8000${image.contentUrl}`
    : null;

  // ===  ===
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

  // ===  ===
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

  // ===  ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditMode(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ===  ===
  const handleDeletePost = async () => {
    setDropdownOpen(false);
    if (!confirm("Are you sure you want to delete this post?")) return;

    const result = await deletePost(post.id);

    if (result.error) {
      alert(`Delete failed: ${result.error}`);
    } else {
      alert("Post deleted successfully");
      if (onDelete) onDelete(post.id);
    }
  };

  // === HANDLER TOGGLE LIKE ===
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

  const [commentText, setCommentText] = useState("");
  // const [comments, setComments] = useState<any[]>([]);
  const [comments, setComments] = useState<PostCommentType[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    setCommentLoading(true);
    setCommentError(null);

    try {
      const newComment = await postComment({
        postId: post.id,
        content: commentText,
      });

      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCommentError(err.message);
      } else {
        setCommentError("Erreur lors de l'envoi du commentaire.");
      }
    } finally {
      setCommentLoading(false);
    }
  };
  useEffect(() => {
    // if (showComments && comments.length === 0) {
    if (showComments) {
      const fetchComments = async () => {
        try {
          const response = await fetch(
            `http://localhost:8000/api/post_comments?post=${post.id}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );
          const data = await response.json();

          console.log("Fetched Comments API response:", data);

          if (Array.isArray(data.member)) {
            setComments(data.member); // ← Extract only the array
          } else {
            console.error(
              "Expected Hydra collection with member[] but got:",
              data
            );
            setComments([]);
          }
        } catch (error) {
          console.error("Error fetching comments:", error);
          setComments([]);
        }
      };
      fetchComments();
    }
  }, [showComments, comments.length, post.id]);

  // === HANDLER UPDATE POST ===
  const handleUpdatePost = async (data: {
    title: string;
    content: string;
    imageFile: File | null;
    videoFile: File | null;
  }) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    if (data.imageFile) formData.append("image", data.imageFile);
    if (data.videoFile) formData.append("video", data.videoFile);

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
      setPostData(result.data as PostType);
    }
  };
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const handleEditClick = (id: number, currentContent: string) => {
    setEditingCommentId(id);
    setEditingContent(currentContent);
  };

  const handleDeleteClick = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      try {
        await deleteComment(id);
        // Remove the deleted comment from UI
        setComments((prev) => prev.filter((c) => c.id !== id));
      } catch (error) {
        alert("Erreur lors de la suppression du commentaire.");
      }
    }
  };

  const handleEditSubmit = async () => {
    if (editingCommentId === null) return;
    try {
      const updated = await updateComment(editingCommentId, editingContent);
      setComments((prev) =>
        prev.map((c) =>
          c.id === editingCommentId ? { ...c, content: updated.content } : c
        )
      );
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      alert("Erreur lors de la modification du commentaire.");
    }
  };

  return (
    <>
      <EditPostModal
        isOpen={editMode}
        initialTitle={title}
        initialContent={content}
        imageUrl={imageUrl || undefined}
        onClose={() => setEditMode(false)}
        onSave={handleUpdatePost}
      />

      <div className="flex flex-col">
        <div className="flex flex-col md:flex-row bg-white rounded-xl overflow-hidden shadow-md justify-between">
          {imageUrl && (
            <div className="md:w-1/3 w-full relative aspect-[3/2] md:aspect-auto">
              <Image
                src={imageUrl}
                alt="Post image"
                className="object-cover rounded"
                fill
                unoptimized
              />
            </div>
          )}

          <div className="flex flex-col justify-between w-full">
            <div
              className="flex"
              style={{ backgroundColor: `${authorColor}50` }}
            >
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

            <div className="flex gap-2 p-4 ml-auto">
              <button aria-label="Favorite" onClick={handleLikeClick}>
                <Star
                  className={`w-6 h-6 transition-colors ${
                    isLiked
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-400"
                  } hover:text-yellow-500 hover:fill-yellow-500`}
                />
              </button>
              <button
                aria-label="Comment"
                onClick={() => setShowComments((prev) => !prev)}
              >
                <MessageCircle className="w-6 h-6 hover:text-blue-500" />
              </button>
            </div>
          </div>
        </div>

        {showComments && (
          <div className="p-4 rounded mt-2">
            {/* Comment input */}
            <div>
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Écrire un commentaire..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={commentLoading}
              />
              <button
                onClick={handleCommentSubmit}
                disabled={commentLoading || !commentText.trim()}
                className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {commentLoading ? "Envoi..." : "Commenter"}
              </button>
              {commentError && (
                <p className="text-red-500 text-sm mt-1">{commentError}</p>
              )}
            </div>

            {/* Comments */}
            <div className="mt-4 space-y-2">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-2 bg-gray-100 rounded shadow-sm text-sm"
                >
                  <div className="font-semibold text-gray-700">
                    {comment.user?.alias?.trim() ||
                      `${comment.user?.firstName ?? ""} ${
                        comment.user?.lastName ?? ""
                      }`.trim() ||
                      "Anonymous"}
                  </div>
                  {/* <div>{comment.content}</div> */}
                  {editingCommentId === comment.id ? (
                    <div className="mt-2 space-y-1">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full p-1 border rounded text-sm"
                      />
                      <div className="flex justify-end space-x-2 text-xs mt-1">
                        <button
                          onClick={handleEditSubmit}
                          className="text-green-600 hover:underline"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="text-gray-600 hover:underline"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>{comment.content}</div>
                  )}

                  <div className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                  <div className="text-xs text-right mt-1 space-x-2 text-blue-600">
                    <button
                      onClick={() =>
                        handleEditClick(comment.id, comment.content)
                      }
                      className="hover:underline"
                    >
                      modifier
                    </button>
                    <button
                      onClick={() => handleDeleteClick(comment.id)}
                      className="text-red-600 hover:underline"
                    >
                      effacer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
