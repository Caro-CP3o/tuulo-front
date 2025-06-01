"use client";

import { PostType, UserType } from "@/types/api";
import PostItem from "../molecules/PostItem";

type Props = {
  posts: (PostType & { author: UserType })[];
};

export default function PostsList({ posts }: Props) {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}
