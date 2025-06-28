"use client";

import { useEffect, useState } from "react";
import { fetchMyFamily } from "@/lib/api";
import PostItem from "../molecules/PostItem";
import AddPostForm from "../forms/AddPostForm";
import { PostType } from "@/types/api";
import { useAuth } from "@/app/context/AuthContext";
import { ChevronDown } from "lucide-react";

export default function FamilyPostList() {
  // ---------------------------
  // State variables
  // ---------------------------
  const [posts, setPosts] = useState<PostType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setPostForm] = useState(false);
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);

  const { user } = useAuth();

  // ---------------------------
  // Effect load posts on mount
  // ---------------------------
  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      setError(null);

      const { data: family, error: familyError } = await fetchMyFamily();
      if (familyError || !family?.id) {
        setError("Could not load family.");
        setLoading(false);
        return;
      }

      // API call get colection family's posts
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/posts?family=/api/families/${family.id}`,
          {
            headers: {
              Accept: "application/json",
            },
            credentials: "include",
          }
        );
        const posts = await res.json();
        setPosts(
          posts.sort(
            (a: PostType, b: PostType) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      } catch {
        setError("Failed to load posts.");
      }

      setLoading(false);
    }

    loadPosts();
  }, []);

  // ---------------------------
  // Create post handler
  // ---------------------------
  const handlePostCreate = (newPost: PostType) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };
  // ---------------------------
  // Delete post handler
  // ---------------------------
  const handlePostDelete = (deletedPostId: number) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== deletedPostId));
  };

  // Posts filter by like
  const filteredPosts = showOnlyLiked
    ? posts.filter((post) =>
        post.postLikes?.some((like) =>
          typeof like === "object"
            ? like.user?.id === user?.id
            : like === user?.id
        )
      )
    : posts;

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <>
      {/* Add post form */}
      <section className="mb-6">
        <div className="flex flex-col gap-6 items-center mb-10 w-full max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <h2
              className="text-xl font-semibold underline cursor-pointer"
              onClick={() => setPostForm((prev) => !prev)}
            >
              Cliquez ici pour ajouter une publication
            </h2>
            <button
              className={`pt-3 transition-transform duration-300 text-xl ${
                showPostForm ? "rotate-180" : ""
              }`}
              onClick={() => setPostForm((prev) => !prev)}
            >
              <ChevronDown />
            </button>
          </div>
          {showPostForm && <AddPostForm onCreate={handlePostCreate} />}
          <button
            onClick={() => setShowOnlyLiked((prev) => !prev)}
            className={`px-4 py-2 rounded text-sm font-medium text-white ml-auto ${
              showOnlyLiked
                ? "bg-amber-500/50 hover:bg-amber-500"
                : "bg-red-400 hover:bg-red-400/50"
            }`}
          >
            {showOnlyLiked ? "Afficher tout" : "Afficher mes favoris"}
          </button>
        </div>
      </section>
      {/* Posts list */}
      {filteredPosts.length === 0 ? (
        <p className="text-center text-gray-500">Aucune publication trouvée.</p>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostItem key={post.id} post={post} onDelete={handlePostDelete} />
          ))}
        </div>
      )}
    </>
  );
}
