"use client";

import { MessageCircle, Star } from "lucide-react";
import Image from "next/image";
import { PostType } from "@/types/api";

type PostItemProps = {
  post: PostType;
};

export default function PostItem({ post }: PostItemProps) {
  const { title, content, createdAt, images, video, author } = post;

  const authorName =
    author?.alias ||
    (author?.firstName && author?.lastName
      ? `${author.firstName} ${author.lastName}`
      : author?.firstName || "Unknown");

  const avatarUrl = author?.avatar?.contentUrl
    ? `http://localhost:8000${author.avatar.contentUrl}`
    : "/default-avatar.png"; // Fallback avatar

  const videoUrl = video?.contentUrl
    ? `http://localhost:8000${video.contentUrl}`
    : null;

  const authorColor = author?.color || "#888888";

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-xl overflow-hidden shadow-md justify-between">
      {Array.isArray(images) && images.length > 0 && (
        <div className="md:w-1/3 w-full relative aspect-[3/2] md:aspect-auto">
          <Image
            src={`http://localhost:8000${images[0].contentUrl}`}
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
            <p className="satisfy text-xl">Posté par {authorName}</p>
            <p className="text-sm">
              {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between p-4">
          <h2 className="text-xl font-semibold capitalize">{title}</h2>
          <p className="mt-2 capitalize">{content}</p>
        </div>

        <div className="flex gap-2 text-gray-500 hover:text-black p-4 ml-[auto]">
          <button aria-label="Favorite">
            <Star className="w-6 h-6 hover:text-yellow-500" />
          </button>
          <button aria-label="Comment">
            <MessageCircle className="w-6 h-6 hover:text-blue-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

// // components/organisms/PostItem.tsx
// "use client";

// // import { fetchMe, likePost } from "@/lib/api";
// import { MessageCircle, Star } from "lucide-react";
// import Image from "next/image";
// // import { useEffect, useState } from "react";

// type PostItemProps = {
//   post: {
//     id: number;
//     title: string;
//     content: string;
//     createdAt: string;
//     images?: { contentUrl: string }[];
//     video?: { contentUrl: string };
//     author?: {
//       alias?: string;
//       firstName?: string;
//       lastName?: string;
//       avatar?: { contentUrl: string };
//       color: string;
//     };
//   };
// };

// export default function PostItem({ post }: PostItemProps) {
//   // const authorAlias = post.author?.alias || post.author?.firstName || "Unknown";
//   // const [userId, setUserId] = useState<number | null>(null);
//   // const [liked, setLiked] = useState(false); // basic UI feedback
//   // useEffect(() => {
//   //   fetchMe()
//   //     .then((user) => setUserId(user.id))
//   //     .catch(console.error);
//   // }, []);

//   // const handleLike = async () => {
//   //   if (!userId) return;
//   //   const { error } = await likePost(post.id, userId);
//   //   if (!error) setLiked(true);
//   //   else console.error(error);
//   // };
//   const authorName =
//     (post.author?.firstName && post.author?.lastName) ||
//     post.author?.firstName ||
//     "Unknown";
//   const authorColor = post.author?.color || "#888888";

//   return (
//     <div
//       key={post.id}
//       className="flex flex-col md:flex-row bg-white rounded-xl overflow-hidden shadow-md justify-between"
//     >
//       {post.images && post.images.length > 0 && (
//         <div className="md:w-1/3 w-full relative aspect-[3/2] md:aspect-auto">
//           {post.images.map((img, idx) => (
//             <Image
//               key={idx}
//               src={`http://localhost:8000${img.contentUrl}`}
//               alt={`Image ${idx}`}
//               className="object-cover rounded"
//               fill
//             />
//           ))}
//         </div>
//       )}
//       <div className="flex flex-col justify-between w-full">
//         <div className="flex" style={{ backgroundColor: `${authorColor}50` }}>
//           <div className="flex flex-col items-center p-4">
//             <Image
//               src={`http://localhost:8000${post.author?.avatar?.contentUrl}`}
//               alt="Avatar"
//               width={50}
//               height={50}
//               className="rounded-full object-cover mb-2"
//               unoptimized
//             />
//             {post.video && (
//               <video controls className="mt-2 w-full max-w-md">
//                 <source src={`http://localhost:8000${post.video.contentUrl}`} />
//               </video>
//             )}
//           </div>
//           <div className="flex flex-col justify-center">
//             <p className="satisfy text-xl">Posté par {authorName}</p>
//             <p className="text-sm">
//               {new Date(post.createdAt).toLocaleDateString()}
//             </p>
//           </div>
//         </div>
//         <div className="flex flex-col justify-between p-4">
//           <h2 className="text-xl font-semibold capitalize">{post.title}</h2>
//           <p className="mt-2 capitalize">{post.content}</p>
//         </div>
//         <div className="flex gap-2 text-gray-500 hover:text-black p-4 ml-[auto]">
//           <button aria-label="Favorite">
//             <Star
//               className="w-6 h-6 hover:text-yellow-500"
//               // onClick={handleLike}
//             />
//           </button>
//           <button aria-label="Comment">
//             <MessageCircle className="w-6 h-6 hover:text-blue-500" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
