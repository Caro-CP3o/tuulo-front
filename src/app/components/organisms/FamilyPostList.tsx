"use client";

import { useEffect, useState } from "react";
import { fetchMyFamily } from "@/lib/api";
import PostItem from "../molecules/PostItem";
import AddPostForm from "../molecules/AddPostForm";
import { PostType } from "@/types/api";

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
  const handlePostCreate = (newPost: PostType) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };
  console.log("posts:", posts);
  // const handlePostCreate = (postId: number) => {
  //   setPosts((prevPosts) => [{ id: postId } as PostType, ...prevPosts]); // Add to top of list
  // };
  const handlePostDelete = (deletedPostId: number) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== deletedPostId));
  };

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <>
      <section className="">
        <AddPostForm onCreate={handlePostCreate} />
      </section>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostItem key={post.id} post={post} onDelete={handlePostDelete} />
        ))}
      </div>
    </>
  );
}
