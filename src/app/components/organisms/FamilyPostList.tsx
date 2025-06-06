// components/organisms/FamilyPostList.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchMyFamily } from "@/lib/api";
import PostItem from "../molecules/PostItem";
import { PostType } from "@/types/api";

// type Post = {
//   id: number;
//   title: string;
//   content: string;
//   createdAt: string;
//   images?: { contentUrl: string }[];
//   video?: { contentUrl: string };
//   author?: { alias?: string; firstName?: string };
// };

export default function FamilyPostList() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      try {
        const res = await fetch(
          `http://localhost:8000/api/posts?family=/api/families/${family.id}`,
          {
            headers: {
              Accept: "application/json",
            },
            credentials: "include",
          }
        );
        const posts = await res.json();
        setPosts(posts);
      } catch {
        setError("Failed to load posts.");
      }

      setLoading(false);
    }

    loadPosts();
  }, []);

  const handlePostDelete = (deletedPostId: number) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== deletedPostId));
  };

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} onDelete={handlePostDelete} />
      ))}
    </div>
  );
}
