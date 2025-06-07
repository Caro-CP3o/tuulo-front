"use client";

import React from "react";
// import AddPostForm from "../../components/molecules/AddPostForm";
import FamilyPostList from "../../components/organisms/FamilyPostList";

export default function HomePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 pb-8">
      <section className="space-y-4">
        <FamilyPostList />
      </section>
    </main>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { fetchFamilyPosts, fetchMyFamily } from "@/lib/api";
// import AddPostForm from "@/app/components/molecules/AddPostForm";

// import { FamilyType, PostType, UserType } from "@/types/api";
// import FamilyPostList from "@/app/components/organisms/FamilyPostList";
// // import PostsList from "@/app/components/molecules/PostsList";

// // type Family = {
// //   id: number;
// //   name: string;
// //   description?: string;
// //   coverImage?: { contentUrl: string } | string | null;
// // };

// export default function FamilyPage() {
//   const [family, setFamily] = useState<FamilyType | null>(null);
//   const [user, setUser] = useState<UserType | null>(null);
//   const [posts, setPosts] = useState<(PostType & { author: UserType })[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadFamilyAndPosts = async () => {
//       const { data: familyData, error: familyError } = await fetchMyFamily();
//       if (familyError) {
//         setError(familyError);
//         return;
//       }

//       setFamily(familyData);

//       const { data: postsData, error: postsError } = await fetchFamilyPosts(
//         familyData.id
//       );
//       if (postsError) {
//         // setError(postsError);
//       } else {
//         setPosts(postsData);
//       }
//     };

//     loadFamilyAndPosts();
//   }, []);

//   if (error) {
//     return <div className="text-red-600">Error: {error}</div>;
//   }

//   if (!family) {
//     return <div>Loading family info...</div>;
//   }

//   return (
//     <div className="max-w-2xl mx-auto p-6">
//       <AddPostForm />
//       <div className="mt-8">
//         <FamilyPostList />
//       </div>
//     </div>
//   );
// }

// const coverImageUrl =
//   typeof family.coverImage === "string"
//     ? `http://localhost:8000${family.coverImage}`
//     : family.coverImage?.contentUrl
//     ? `http://localhost:8000${family.coverImage.contentUrl}`
//     : null;

// <h1 className="text-3xl font-bold mb-4">{family.name}</h1>
// {coverImageUrl && (
//   <Image
//     src={coverImageUrl}
//     alt="Family Cover"
//     className="w-full h-64 object-cover rounded-lg mb-4"
//     width={1200}
//     height={256}
//     unoptimized
//   />
// )}
// <p className="text-gray-700">
//   {family.description || "No description provided."}
// </p>
