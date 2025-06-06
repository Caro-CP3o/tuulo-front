import type { MediaObjectType, PostType, UserType } from "@/types/api";

// Types
// type PostWithAuthor = PostType & { author: UserType };

// === JOIN FAMILY REQUEST ===
export async function joinFamilyRequest(data: { email: string; familyCode: string }) {
  const res = await fetch("/api/family/join-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}

// === APPROVE FAMILY JOIN ===
export async function approveFamilyJoin(token: string) {
  const res = await fetch(`/api/family/approve?token=${token}`, {
    credentials: "include",
  });

  return res.json();
}

// === REGISTER USER ===
export async function registerUser(formData: FormData) {
  try {
    const imageFile = formData.get("avatar") as File | null;
    let imageIri: string | null = null;

    if (imageFile) {
      const imageData = new FormData();
      imageData.append("file", imageFile);

      const res = await fetch("http://localhost:8000/api/media_objects", {
        method: "POST",
        body: imageData,
      });

      if (!res.ok) {
        const error = await res.json();
        return { error: `Image upload failed: ${error.message || JSON.stringify(error)}` };
      }

      const media = await res.json();
      imageIri = media["@id"];
    }

    const userPayload = {
      email: formData.get("email"),
      password: formData.get("password"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      birthDate: formData.get("birthDate"),
      color: formData.get("color"),
      alias: formData.get("alias") || null,
      avatar: imageIri,
    };

    const res = await fetch("http://localhost:8000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userPayload),
    });

    const data = await res.json();
    return res.ok ? { data } : { error: data.message || JSON.stringify(data) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error" };
  }
}

// === LOGIN ===
export async function login(credentials: { email: string; password: string }) {
  const res = await fetch("http://localhost:8000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Unexpected server error");
  }

  if (!res.ok) throw new Error(data?.error || "Login failed");
  return data;
}

// === LOGOUT ===
export async function logout() {
  const res = await fetch("http://localhost:8000/api/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Logout failed");
}

// === FETCH ME ===
export async function fetchMe(): Promise<UserType> {
  const res = await fetch("http://localhost:8000/api/profile", {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Could not load profile");

  return res.json();
}

// === CREATE FAMILY ===
export async function createFamily(data: {
  name: string;
  description?: string | null;
  coverImage?: string | null;
}) {
  try {
    const res = await fetch("http://localhost:8000/api/families", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to create family");

    return result;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "An unknown error occurred." };
  }
}

// === UPDATE ME ===
export async function updateMe(formData: FormData) {
  try {
    const user = await fetchMe();
    const userId = user.id;

    const updatePayload: Record<string, unknown> = {};
    const imageFile = formData.get("avatar") as File | null;

    if (imageFile) {
      const imageData = new FormData();
      imageData.append("file", imageFile);

      const imageRes = await fetch("http://localhost:8000/api/media_objects", {
        method: "POST",
        body: imageData,
      });

      if (!imageRes.ok) {
        const error = await imageRes.json();
        return { error: `Image upload failed: ${error.message || JSON.stringify(error)}` };
      }

      const media = await imageRes.json();
      updatePayload.avatar = media["@id"];
    }

    ["password", "firstName", "lastName", "birthDate", "alias"].forEach((key) => {
      if (formData.has(key)) {
        updatePayload[key] = formData.get(key) || null;
      }
    });

    if (Object.keys(updatePayload).length === 0) return { error: "No changes to update." };

    const avatar = user.avatar as MediaObjectType & { "@id"?: string };
    const previousAvatar = typeof avatar === "object" && avatar?.["@id"] ? avatar["@id"] : (avatar as unknown as string);

    const res = await fetch(`http://localhost:8000/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/merge-patch+json" },
      credentials: "include",
      body: JSON.stringify(updatePayload),
    });

    if (!res.ok) {
      const error = await res.json();
      return { error: error.message || JSON.stringify(error) };
    }

    const updatedUser = await fetchMe();
    const updatedAvatar = updatedUser.avatar as MediaObjectType & { "@id"?: string };
    const updatedAvatarId = updatedAvatar?.["@id"] || (updatedAvatar as unknown as string);

    if (previousAvatar && previousAvatar !== updatedAvatarId && previousAvatar !== updatePayload.avatar) {
      await fetch(`http://localhost:8000${previousAvatar}`, {
        method: "DELETE",
        credentials: "include",
      });
    }

    return { data: await res.json() };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Update failed." };
  }
}

// === CREATE FAMILY & LINK USER ===
export async function createFamilyAndLinkUser(formData: FormData) {
  try {
    const user = await fetchMe();
    const userId = user?.id;
    if (!userId) return { error: "User not authenticated." };

    let imageIri: string | null = null;
    const imageFile = formData.get("coverImage") as File | null;

    if (imageFile) {
      const imageData = new FormData();
      imageData.append("file", imageFile);

      const res = await fetch("http://localhost:8000/api/media_objects", {
        method: "POST",
        body: imageData,
      });

      if (!res.ok) {
        const error = await res.json();
        return { error: `Cover image upload failed: ${error.message || JSON.stringify(error)}` };
      }

      const media = await res.json();
      imageIri = media["@id"];
    }

    const familyRes = await fetch("http://localhost:8000/api/families", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description") || null,
        coverImage: imageIri,
        creator: `/api/users/${userId}`,
      }),
    });

    const family = await familyRes.json();
    if (!familyRes.ok) return { error: family?.message || "Failed to create family." };

    const memberRes = await fetch("http://localhost:8000/api/family_members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        user: `/api/users/${userId}`,
        family: family["@id"],
      }),
    });

    const member = await memberRes.json();
    if (!memberRes.ok) return { error: member?.message || "Failed to link user to family." };

    return { data: { family, member } };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "An unknown error occurred." };
  }
}

// === GET FAMILY BY ID ===
export async function getFamilyById(id: number) {
  try {
    const res = await fetch(`http://localhost:8000/api/families/${id}`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Fetch failed");

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function fetchMyFamily() {
  try {
    const user = await fetchMe();
    const userId = user.id;

    const familyMembersRes = await fetch(`http://localhost:8000/api/family_members?user=${userId}`, {
      credentials: 'include',
    });

    if (!familyMembersRes.ok) {
      return { data: null, error: "Failed to fetch family memberships." };
    }

    const familyMembersJson = await familyMembersRes.json();
   

    const familyMembers = familyMembersJson['member'] || [];

    if (familyMembers.length === 0) {
      return { data: null, error: "User is not linked to a family." };
    }

    // family could be IRI or object depending on API serialization
    let familyId;

    if (typeof familyMembers[0].family === 'string') {
      // family is an IRI like "/api/families/123"
      familyId = familyMembers[0].family.split('/').pop();
    } else if (typeof familyMembers[0].family === 'object' && familyMembers[0].family.id) {
      familyId = familyMembers[0].family.id;
    }

    if (!familyId) return { data: null, error: "Family ID missing in membership." };

    const { data, error } = await getFamilyById(familyId);
    return { data, error };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error fetching family.",
    };
  }
} 



export async function createPost(formData: FormData) {
  try {
    const imageFiles = formData.getAll("image") as File[];
    const imageIris: string[] = [];

    // Upload all image files
    for (const file of imageFiles) {
      if (!(file instanceof File)) continue;

      const imageData = new FormData();
      imageData.append("file", file);

      const res = await fetch("http://localhost:8000/api/media_objects", {
        method: "POST",
        body: imageData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        return { error: `Image upload failed: ${error.message || JSON.stringify(error)}` };
      }

      const media = await res.json();
      imageIris.push(media["@id"]);
    }

    // Upload video file (if any)
    const videoFile = formData.get("video") as File | null;
    let videoIri: string | null = null;

    if (videoFile instanceof File) {
      const videoData = new FormData();
      videoData.append("file", videoFile);

      const res = await fetch("http://localhost:8000/api/media_objects", {
        method: "POST",
        body: videoData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        return { error: `Video upload failed: ${error.message || JSON.stringify(error)}` };
      }

      const media = await res.json();
      videoIri = media["@id"];
    }

    // Prepare the post payload
    const postPayload = {
      title: formData.get("title"),
      content: formData.get("content"),
      images: imageIris,
      video: videoIri,
    };

    // Create the post
    const res = await fetch("http://localhost:8000/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(postPayload),
    });

    const data = await res.json();
    return res.ok ? { data } : { error: data.message || JSON.stringify(data) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error" };
  }
}
// === FETCH FAMILY POSTS ===
export async function fetchFamilyPosts(): Promise<{ data: PostType[] | null; error: string | null }> {
  try {
    const user = await fetchMe();
    const userId = user.id;

    const familyMembersRes = await fetch(`http://localhost:8000/api/family_members?user=${userId}`, {
      credentials: "include",
    });

    if (!familyMembersRes.ok) {
      return { data: null, error: "Failed to fetch family memberships." };
    }

    const familyMembersJson = await familyMembersRes.json();
    const familyMembers = familyMembersJson['member'] || [];

    if (familyMembers.length === 0) {
      return { data: null, error: "User is not linked to a family." };
    }

    let familyId;

    if (typeof familyMembers[0].family === "string") {
      familyId = familyMembers[0].family.split("/").pop();
    } else if (typeof familyMembers[0].family === "object" && familyMembers[0].family.id) {
      familyId = familyMembers[0].family.id;
    }

    if (!familyId) {
      return { data: null, error: "Family ID missing in membership." };
    }

    const postsRes = await fetch(`http://localhost:8000/api/posts?family.id=${familyId}`, {
      credentials: "include",
    });

    const posts = await postsRes.json();

    if (!postsRes.ok) {
      return { data: null, error: posts.message || "Failed to fetch posts." };
    }

    return { data: posts["hydra:member"] ?? [], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error fetching posts.",
    };
  }
}
// 

export async function togglePostLike(postId: number) {
  try {
    const user = await fetchMe();
    const userId = user.id;

    // Check if the user already liked the post
    const res = await fetch(`http://localhost:8000/api/post_likes?user=${userId}&post=${postId}`, {
      credentials: "include",
      headers: {
        Accept: "application/json", // Expect plain JSON
      },
    });

    if (!res.ok) throw new Error("Failed to check like");

    const existingLikes = await res.json(); // Expecting an array

    if (Array.isArray(existingLikes) && existingLikes.length > 0) {
      const likeId = existingLikes[0].id;

      if (!likeId) throw new Error("Like ID not found");

      // Unlike the post
      const deleteRes = await fetch(`http://localhost:8000/api/post_likes/${likeId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!deleteRes.ok) throw new Error("Failed to delete like");

      return { status: "unliked" };
    } else {
      // Like the post
      const postRes = await fetch("http://localhost:8000/api/post_likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          user: `/api/users/${userId}`,
          post: `/api/posts/${postId}`,
        }),
      });

      if (!postRes.ok) {
        const error = await postRes.json();
        throw new Error(error.message || "Failed to like post.");
      }

      return { status: "liked" };
    }
  } catch (err) {
    console.error(err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
export async function isPostLiked(postId: number): Promise<boolean> {
  const user = await fetchMe();
  const res = await fetch(`http://localhost:8000/api/post_likes?user=${user.id}&post=${postId}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to check like");

  const data = await res.json();
  return Array.isArray(data) && data.length > 0;
}

export async function deletePost(postId: number) {
  try {
    const res = await fetch(`http://localhost:8000/api/posts/${postId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.message || "Failed to delete post" };
    }

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function updatePost(postId: number, formData: FormData) {
  try {
    // 1. Upload new images if any
    const imageFiles = formData.getAll("image") as File[];
    const imageIris: string[] = [];

    for (const file of imageFiles) {
      if (!(file instanceof File)) continue;

      const imageData = new FormData();
      imageData.append("file", file);

      const res = await fetch("http://localhost:8000/api/media_objects", {
        method: "POST",
        body: imageData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        return { error: `Image upload failed: ${error.message || JSON.stringify(error)}` };
      }

      const media = await res.json();
      imageIris.push(media["@id"]);
    }

    // 2. Upload new video if any
    const videoFile = formData.get("video") as File | null;
    let videoIri: string | null = null;

    if (videoFile instanceof File) {
      const videoData = new FormData();
      videoData.append("file", videoFile);

      const res = await fetch("http://localhost:8000/api/media_objects", {
        method: "POST",
        body: videoData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        return { error: `Video upload failed: ${error.message || JSON.stringify(error)}` };
      }

      const media = await res.json();
      videoIri = media["@id"];
    }

    // 3. Build patch payload with optional fields
    const patchPayload: Record<string, unknown> = {};

    const title = formData.get("title");
    if (title) patchPayload.title = title;

    const content = formData.get("content");
    if (content) patchPayload.content = content;

    if (imageIris.length > 0) patchPayload.images = imageIris;
    if (videoIri !== null) patchPayload.video = videoIri;

    if (Object.keys(patchPayload).length === 0) {
      return { error: "No changes to update." };
    }

    // 4. Send PATCH request to update the post
    const res = await fetch(`http://localhost:8000/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/merge-patch+json" },
      credentials: "include",
      body: JSON.stringify(patchPayload),
    });

    if (!res.ok) {
      const error = await res.json();
      return { error: error.message || JSON.stringify(error) };
    }

    const updatedPost = await res.json();

    // OPTIONAL: You can fetch the old post before updating and delete replaced media similar to your updateMe function here

    return { data: updatedPost };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error" };
  }
}
