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
import { useAuth } from "@/app/context/AuthContext";
import CustomAlert from "../modals/CustomAlert";

type PostItemProps = {
  post: PostType;
  onDelete?: (postId: number) => void;
};

// ---------------------------
// Post item component
// ---------------------------
export default function PostItem({ post, onDelete }: PostItemProps) {
  // ---------------------------
  // State variables
  // ---------------------------
  const [postData, setPostData] = useState<PostType>(post);
  const [pendingAction, setPendingAction] = useState<
    null | (() => Promise<void>)
  >(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<PostCommentType[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  console.log("confirmdel: ", confirmDelete);

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const { title, content, createdAt, image, video, author } = postData;
  const { user } = useAuth();

  // Ownership and roles
  const isAuthor = user?.id === author.id;
  const isFamilyAdmin = user?.roles?.includes("ROLE_FAMILY_ADMIN");
  const isCommentAuthor = (commentAuthorId: number) =>
    user?.id === commentAuthorId;

  const authorFirstName = author.firstName;
  const authorLastName = author.lastName;
  const alias = author?.alias || "";
  const authorColor = author?.color || "#888888";
  const avatarUrl = author?.avatar?.contentUrl
    ? `${process.env.NEXT_PUBLIC_API_URL}${author.avatar.contentUrl}`
    : "/default-avatar.png";
  const videoUrl = video?.contentUrl
    ? `${process.env.NEXT_PUBLIC_API_URL}${post.video?.contentUrl}`
    : null;
  const imageUrl = image?.contentUrl
    ? `${process.env.NEXT_PUBLIC_API_URL}${image.contentUrl}`
    : null;

  // Date formatting
  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // check if the date is invalid
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // ---------------------------
  // Effect load likes on mount
  // ---------------------------
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

  // ---------------------------
  // Effect open / close dropdown
  // ---------------------------
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

  // ---------------------------
  // Delete post handler
  // ---------------------------
  const handleDeletePost = async () => {
    setDropdownOpen(false);
    setAlertTitle("Supprimer la publication ?");
    setAlertMessage("Êtes-vous sûr de vouloir supprimer cette publication ?");
    setPendingAction(() => async () => {
      try {
        const result = await deletePost(post.id);
        if (result.error) throw new Error(result.error);
        showAlert("Succès !", "La publication a été supprimée avec succès.");
        if (onDelete) onDelete(post.id);
      } catch (err) {
        showAlert(
          "Erreur",
          err instanceof Error ? err.message : "Erreur inattendue."
        );
      }
    });
    setAlertOpen(true);
  };

  // ---------------------------
  // Toggle post like handler
  // ---------------------------
  const handleLikeClick = async () => {
    if (loading) return;
    setLoading(true);

    const result = await togglePostLike(post.id);

    if (result.status === "liked") {
      setIsLiked(true);
    } else if (result.status === "unliked") {
      setIsLiked(false);
    } else if (result.error) {
      showAlert("Erreur", result.error);
    }

    setLoading(false);
  };

  // ---------------------------
  // Comment submit handler
  // ---------------------------
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    setCommentLoading(true);
    setCommentError(null);

    // API call to post comment
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
  // ---------------------------
  // Effect to load comments
  // ---------------------------
  useEffect(() => {
    if (showComments) {
      const fetchComments = async () => {
        // API call to get comments
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/post_comments?post=${post.id}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );
          const data = await response.json();

          if (Array.isArray(data.member)) {
            setComments(data.member);
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

  // ---------------------------
  // Update comment handler
  // ---------------------------
  const handleUpdatePost = (data: {
    title: string;
    content: string;
    imageFile: File | null;
    videoFile: File | null;
  }) => {
    setAlertTitle("Confirmer la modification ?");
    setAlertMessage(
      "Souhaitez-vous vraiment mettre à jour cette publication ?"
    );

    // Prepare form
    setPendingAction(() => async () => {
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
        showAlert("Erreur", `Échec de la mise à jour : ${result.error}`);
      } else {
        showAlert("Succès !", "La publication a été mise à jour.");
        setPostData(result.data as PostType);
      }
    });

    setAlertOpen(true);
  };
  // ---------------------------
  // Edit comment handler
  // ---------------------------
  const handleEditClick = (id: number, currentContent: string) => {
    setEditingCommentId(id);
    setEditingContent(currentContent);
  };

  // ---------------------------
  // Delete comment handler
  // ---------------------------
  const handleDeleteClick = async (id: number) => {
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      showAlert("Erreur", "Erreur lors de la suppression du commentaire.");
    }
  };

  // ---------------------------
  // Submit updated comment handler
  // ---------------------------
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
    } catch {
      showAlert("Erreur", "Erreur lors de la modification du commentaire.");
    }
  };

  return (
    <>
      {/* Edit comment modal */}
      <EditPostModal
        isOpen={editMode}
        initialTitle={title}
        initialContent={content}
        imageUrl={imageUrl || undefined}
        onClose={() => setEditMode(false)}
        onSave={handleUpdatePost}
      />
      {/* Custom alert modal */}
      <CustomAlert
        isOpen={alertOpen}
        onClose={() => {
          setAlertOpen(false);
          setConfirmDelete(false);
        }}
        onConfirm={async () => {
          setAlertOpen(false);
          if (pendingAction) {
            await pendingAction();
            setPendingAction(null);
          }
        }}
        title={alertTitle}
        message={alertMessage}
      />
      <div className="flex flex-col w-full bg-white rounded-xl overflow-hidden shadow-md">
        {/* POST */}
        <div className="flex flex-col md:flex-row w-full">
          {/* Image or video*/}
          {(imageUrl || videoUrl) && (
            <div className="md:w-1/3 w-full relative aspect-[3/2] md:aspect-auto">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Post image"
                  className="object-cover rounded"
                  fill
                  unoptimized
                />
              ) : (
                <video controls className="w-full h-full object-cover rounded">
                  <source src={videoUrl ?? undefined} />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              )}
            </div>
          )}
          {/* Author info & avatar */}
          <div className="flex flex-col justify-between w-full">
            <div
              className="flex"
              style={{ backgroundColor: `${authorColor}50` }}
            >
              <div className="flex flex-col items-center p-4 max-w-full">
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={50}
                  height={50}
                  className="rounded-full object-cover mb-2 bg-white"
                  unoptimized
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="satisfy text-xl">
                  {authorFirstName} {authorLastName} - {alias}
                </p>
                <p className="text-sm">
                  {new Date(createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  posté à{" "}
                  {formatTime(
                    post.updatedAt && post.updatedAt !== "0000-00-00T00:00:00Z"
                      ? post.updatedAt
                      : post.createdAt
                  )}
                </p>
              </div>
              {/* Dropdown menu */}
              <div className="relative ml-auto" ref={dropdownRef}>
                <button
                  aria-label="More options"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <MoreHorizontal className="w-6 h-6 text-gray-600" />
                </button>

                {dropdownOpen && (isAuthor || isFamilyAdmin) && (
                  <ul className="absolute right-1 mt-2 w-40 bg-white rounded shadow-md z-10">
                    {/* User & role check */}
                    {isAuthor && (
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
                    )}
                    {(isAuthor || isFamilyAdmin) && (
                      <li>
                        <button
                          onClick={handleDeletePost}
                          className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 text-red-600"
                        >
                          Effacer le post
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
            {/* Post content */}
            <div className="flex flex-col justify-between p-4">
              <h2 className="text-xl font-semibold capitalize">{title}</h2>
              <p className="mt-2 capitalize">{content}</p>
            </div>
            {/* Like icon toggle*/}
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
              {/* Comment icon toggle*/}
              <button
                aria-label="Comment"
                onClick={() => setShowComments((prev) => !prev)}
              >
                <MessageCircle className="w-6 h-6 hover:text-blue-500" />
              </button>
            </div>
          </div>
        </div>
        {/* Comments section */}
        {showComments && (
          <div className="p-4 rounded mt-2 w-full">
            {/* Comment input */}
            <div className="flex flex-col flex-end mb-4">
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
                className="max-w-fit mt-2 px-4 py-1 bg-blue-900 text-white rounded hover:bg-red-400 disabled:opacity-25 ml-auto"
              >
                {commentLoading ? "Envoi..." : "Commenter"}
              </button>
              {commentError && (
                <p className="text-red-500 text-sm mt-1">{commentError}</p>
              )}
            </div>

            {/* Comments */}
            {comments.map((comment) => {
              const canEditOrDelete =
                isCommentAuthor(comment.user.id) || isFamilyAdmin;
              return (
                <div
                  key={comment.id}
                  className="p-4 bg-red-50/50 rounded shadow-sm text-sm mt-2"
                >
                  <h3 className="font-semibold">
                    {comment.user?.alias?.trim() ||
                      `${comment.user?.firstName ?? ""} ${
                        comment.user?.lastName ?? ""
                      }`.trim() ||
                      "Anonymous"}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString("fr-FR", {
                      timeZone: "Europe/Paris",
                    })}
                  </span>
                  {/* Comment update */}
                  {editingCommentId === comment.id ? (
                    <div className="flex flex-col gap-2 mt-1">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="border rounded p-1"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleEditSubmit}
                          className="text-blue-600 text-sm"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="text-gray-500 text-sm"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="my-3">{comment.content}</p>
                      {/* User and role check */}
                      {canEditOrDelete && (
                        <div className="flex gap-2 mt-1 text-sm text-amber-400 justify-end">
                          {isCommentAuthor(comment.user.id) && (
                            <button
                              onClick={() =>
                                handleEditClick(comment.id, comment.content)
                              }
                              className="hover:underline"
                            >
                              Modifier
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(comment.id)}
                            className="hover:underline text-red-400"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
