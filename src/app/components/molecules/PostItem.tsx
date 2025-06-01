// components/PostItem.tsx

import { PostType, UserType } from "@/types/api";
import Image from "next/image";

type Props = {
  post: PostType & { author: UserType };
};

export default function PostItem({ post }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-2">
      <div className="flex items-center space-x-3">
        {post.author.avatar?.contentUrl && (
          <Image
            src={post.author.avatar.contentUrl}
            alt="avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
        )}
        <div>
          <p
            className="font-semibold text-sm"
            style={{ color: post.author.color }}
          >
            {post.author.alias ||
              `${post.author.firstName} ${post.author.lastName}`}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold">{post.title}</h3>
        <p className="text-sm">{post.content}</p>
      </div>

      {/* Future: Add like/comment buttons */}
    </div>
  );
}
