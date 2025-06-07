"use client";

import { useState } from "react";
import { createPost } from "@/lib/api";
import { PostType } from "@/types/api";

type PostFormProps = {
  onCreate?: (post: PostType) => void;
};

export default function PostForm({ onCreate }: PostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          formData.append("image", file);
        } else if (file.type.startsWith("video/")) {
          formData.append("video", file);
        }
      });
    }

    const res = await createPost(formData);

    if (res.error) {
      setError(res.error);
    } else {
      const newPost: PostType = res.data;
      onCreate?.(newPost); // ✅ Call with full post object
      setSuccess(true);
      setTitle("");
      setContent("");
      setFiles(null);
    }

    setLoading(false);
  };

  // "use client";

  // import { useState } from "react";
  // import { createPost } from "@/lib/api"; // adjust path as needed
  // import { PostType } from "@/types/api";

  // type PostFormProps = {
  //   posts: PostType;
  //   onCreate?: (postId: number) => void;
  // };

  // export default function PostForm({ posts, onCreate }: PostFormProps) {
  //   const [title, setTitle] = useState("");
  //   const [content, setContent] = useState("");
  //   const [files, setFiles] = useState<FileList | null>(null);
  //   const [error, setError] = useState<string | null>(null);
  //   const [success, setSuccess] = useState(false);
  //   const [loading, setLoading] = useState(false);

  //   const handleSubmit = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //     setLoading(true);
  //     setError(null);
  //     setSuccess(false);

  //     const formData = new FormData();
  //     formData.append("title", title);
  //     formData.append("content", content);

  //     if (files) {
  //       Array.from(files).forEach((file) => {
  //         if (file.type.startsWith("image/")) {
  //           formData.append("image", file);
  //         } else if (file.type.startsWith("video/")) {
  //           formData.append("video", file); // backend supports 1 video
  //         }
  //       });
  //     }

  //     const res = await createPost(formData);

  //     if (res.error) {
  //       setError(res.error);
  //     } else {
  //       const newPost: PostType = res.data; // <- adjust this if your API returns { data: PostType }
  //       onCreate(newPost); // ⬅️ Update parent state with new post
  //       setSuccess(true);
  //       setTitle("");
  //       setContent("");
  //       setFiles(null);
  //     }

  //     setLoading(false);
  //   };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl overflow-hidden justify-between mb-8 p-4 space-y-2 shadow-sm bg-white"
    >
      <h2 className="text-xl font-semibold">Create a Post</h2>

      <div>
        <label className="block font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 w-full border rounded px-3 py-2"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block font-medium">
          Ajoutez une image ou une vidéo
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="mt-1 mr-2 border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-red-400 disabled:opacity-50"
      >
        {loading ? "Posting..." : "Create Post"}
      </button>

      {error && <p className="text-red-600">{error}</p>}
      {success && (
        <p className="text-green-600">Votre publication a bien été ajoutée!</p>
      )}
    </form>
  );
}

// "use client";

// import { useState } from "react";
// import { createPost } from "@/lib/api"; // adjust path as needed
// import { PostType } from "@/types/api";

// export default function PostForm({
//   onCreate,
// }: {
//   onCreate: (post: PostType) => void;
// }) {
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [files, setFiles] = useState<FileList | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccess(false);

//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("content", content);

//     if (files) {
//       Array.from(files).forEach((file) => {
//         if (file.type.startsWith("image/")) {
//           formData.append("image", file);
//         } else if (file.type.startsWith("video/")) {
//           formData.append("video", file); // your backend currently supports one video
//         }
//       });
//     }

//     const res = await createPost(formData);

//     if (res.error) {
//       setError(res.error);
//     } else {
//       setSuccess(true);
//       setTitle("");
//       setContent("");
//       setFiles(null);
//     }

//     setLoading(false);
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="rounded-xl overflow-hidden justify-between mb-8 p-4 space-y-2 p-4 shadow-sm bg-white"
//     >
//       <h2 className="text-xl font-semibold">Create a Post</h2>

//       <div>
//         <label className="block font-medium">Title</label>
//         <input
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           className="mt-1 w-full border rounded px-3 py-2"
//           required
//         />
//       </div>

//       <div>
//         <label className="block font-medium">Content</label>
//         <textarea
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           className="mt-1 w-full border rounded px-3 py-2"
//           rows={4}
//           required
//         />
//       </div>

//       <div>
//         <label className="block font-medium">
//           Ajoutez une image ou une vidéo
//         </label>
//         <input
//           type="file"
//           accept="image/*,video/*"
//           multiple
//           onChange={(e) => setFiles(e.target.files)}
//           className="mt-1 mr-2 border rounded px-3 py-2"
//         />
//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-red-400 disabled:opacity-50 "
//         >
//           {loading ? "Posting..." : "Create Post"}
//         </button>
//       </div>

//       {error && <p className="text-red-600">{error}</p>}
//       {success && (
//         <p className="text-green-600">Votre publication a bien été ajoutée!</p>
//       )}
//     </form>
//   );
// }
