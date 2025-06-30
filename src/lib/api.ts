import type { FamilyMemberType, FamilyType, MediaObjectType, PostType, UserType } from "@/types/api";

                                //////////        //////////
                               //////////  USER  //////////
                              //////////        //////////

// ---------------------------
// REGISTER USER
// ---------------------------
export async function registerUser(formData: FormData) {
  try {
    const imageFile = formData.get("avatar") as File | null;
    let imageIri: string | null = null;

    if (imageFile) {
      const imageData = new FormData();
      imageData.append("file", imageFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media_objects`, {
        method: "POST",
        body: imageData,
      });

      if (!res.ok) {
        const error = await res.json();
        return { error: `L'ajout d'image a échoué: ${error.message || JSON.stringify(error)}` };
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
      invitationCode: formData.get("invitationCode") || null,
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userPayload),
    });

    const data = await res.json();
   if (res.ok) {
      return { data };
    } else {
      // Handle Symfony validation errors (violations)
    if (data.violations && Array.isArray(data.violations)) {
      const errors = data.violations.reduce(
      (acc: Record<string, string>, violation: { propertyPath: string; message: string }) => {
      acc[violation.propertyPath] = violation.message;
      return acc;
    },
    {}
    );
  return { validationErrors: errors };
}

      // Handle generic error messages (e.g. invalid token, forbidden)
      if (data.message) {
        return { error: data.message };
      }

      // Fallback - unknown error format
      return { error: JSON.stringify(data) };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error" };
  }
  //   return res.ok ? { data } : { error: data.message || JSON.stringify(data) };
  // } catch (err) {
  //   return { error: err instanceof Error ? err.message : "Network error" };
  // }
}
// ---------------------------
// LOGIN
// ---------------------------
export async function login(credentials: { email: string; password: string }) {
  let response: Response;
  let data: unknown = null;

  try {
    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new Error("Impossible de se connecter au serveur.");
  }

  try {
    data = await response.json();
  } catch {
    throw new Error("Réponse inattendue du serveur.");
  }

  if (!response.ok) {
    let message = "Échec de la connexion.";

if (
  typeof data === "object" &&
  data !== null &&
  "error" in data &&
  typeof (data as Record<string, unknown>).error === "string"
) {
  const errorStr = (data as { error: string }).error.toLowerCase();

    if (errorStr.includes("not verified")) {
      message = "Votre email n'a pas encore été vérifié.";
    } else if (errorStr.includes("credentials")) {
      message = "Email ou mot de passe incorrect.";
    }
  }

    throw new Error(message);
  }

  return data;
}
// ---------------------------
// LOGOUT
// ---------------------------
export async function logout() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Logout failed");
} 
// ---------------------------
// FETCH USER
// ---------------------------
export async function fetchMe(): Promise<UserType> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
    credentials: "include",
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw new Error("Could not load profile");
  }

  return res.json();
}
// ---------------------------
// DELETE USER
// ---------------------------
export async function deleteMe(): Promise<{ success?: true; error?: string }> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
  error:
    errorData?.message ??
    errorData?.error ??
    "Erreur lors de la suppression du profil.",
};
    }

    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erreur réseau",
    };
  }
}
// ---------------------------
// UPDATE  USER
// ---------------------------
export async function updateMe(formData: FormData) {
  try {
    const user = await fetchMe();
    const userId = user.id;

    const updatePayload: Record<string, unknown> = {};
    const imageFile = formData.get("avatar") as File | null;

    if (imageFile) {
      const imageData = new FormData();
      imageData.append("file", imageFile);

      const imageRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media_objects`, {
        method: "POST",
        body: imageData,
        credentials: "include",
      });

      if (!imageRes.ok) {
        const error = await imageRes.json();
        return { error: `Image upload failed: ${error.message || JSON.stringify(error)}` };
      }

      const media = await imageRes.json();
      updatePayload.avatar = media["@id"];
    }

    ["password", "firstName", "lastName", "birthDate", "alias", "color"].forEach((key) => {
      if (formData.has(key)) {
        updatePayload[key] = formData.get(key) || null;
      }
    });

    if (Object.keys(updatePayload).length === 0) return { error: "No changes to update." };

    const avatar = user.avatar as MediaObjectType & { "@id"?: string };
    const previousAvatar =
  typeof avatar === "string"
    ? avatar
    : typeof avatar === "object" && avatar?.["@id"]
    ? avatar["@id"]
    : null;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}${previousAvatar}`, {
        method: "DELETE",
        credentials: "include",
      });
    }

    return { data: await res.json() };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Update failed." };
  }
}
                                //////////          //////////
                               //////////  FAMILY  //////////
                              //////////          //////////

// ---------------------------
// CREATE FAMILY
// ---------------------------
export async function createFamily(data: {
  name: string;
  description?: string | null;
  coverImage?: string | null;
}) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/families`, {
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
// ---------------------------
// FETCH FAMILY BY ID
// ---------------------------
export async function getFamilyById(id: number): Promise<FamilyType> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/families/${id}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch family");
  return res.json();
}
// ---------------------------
// FETCH USER FAMILY
// ---------------------------
export async function fetchMyFamily(): Promise<{ data: FamilyType | null; error: string | null }> {
  try {
    const user = await fetchMe();
    const userId = user.id;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/family_members?user=/api/users/${userId}&status=active`, {
      credentials: 'include',
    });

    if (!res.ok) {
      return { data: null, error: "Failed to fetch family memberships." };
    }

    const json = await res.json();
    const members = json["hydra:member"] || json["member"] || [];

    if (members.length === 0) {
      return { data: null, error: "User is not linked to a family." };
    }

    let familyId: number | null = null;
    const familyRef = members[0].family;

    if (typeof familyRef === "string") {
      const idPart = familyRef.split("/").pop();
      familyId = idPart ? parseInt(idPart, 10) : null;
    } else if (typeof familyRef === "object" && typeof familyRef.id === "number") {
      familyId = familyRef.id;
    }

    if (!familyId || isNaN(familyId)) {
      return { data: null, error: "Invalid or missing family ID." };
    }

    const family = await getFamilyById(familyId);
    return { data: family, error: null };

  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error fetching family.",
    };
  }
}
// ---------------------------
// UPDATE FAMILY
// ---------------------------
export async function updateFamily(id: number,formData: FormData) {
  try {
    // First, fetch the user's family
    const { data: family, error: fetchError } = await fetchMyFamily();
    if (fetchError || !family?.id) {
      return { error: fetchError || "Could not retrieve family data." };
    }

    const updatePayload: Record<string, unknown> = {};
    const imageFile = formData.get("coverImage") as File | null;
    console.log("Cover image file:", imageFile);

    if (imageFile) {
      const imageData = new FormData();
      imageData.append("file", imageFile);

      const imageRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media_objects`, {
        method: "POST",
        body: imageData,
        credentials: "include",
      });

      if (!imageRes.ok) {
        const error = await imageRes.json();
        return { error: `Cover image upload failed: ${error.message || JSON.stringify(error)}` };
      }

      const media = await imageRes.json();
      updatePayload.coverImage = media["@id"];
    }

    ["name", "description"].forEach((key) => {
      if (formData.has(key)) {
        updatePayload[key] = formData.get(key) || null;
      }
    });

    if (Object.keys(updatePayload).length === 0) {
      return { error: "No changes to update." };
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/families/${family.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/merge-patch+json",
      },
      credentials: "include",
      body: JSON.stringify(updatePayload),
    });

    if (!res.ok) {
      const error = await res.json();
      return { error: error.message || JSON.stringify(error) };
    }

    const updatedFamily = await res.json();
    return { data: updatedFamily };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to update family.",
    };
  }
}
// ---------------------------
// DELETE FAMILY
// ---------------------------
export async function deleteFamily(familyId: number) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/family/${familyId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Échec de la suppression de la famille.");
    }

  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "Erreur inconnue lors de la suppression."
    );
  }
}
// ---------------------------
// CREATE FAMILY INVITATION
// ---------------------------
export async function createFamilyInvitation({
  email,
  sendEmail = false,
}: { email?: string; sendEmail?: boolean } = {}) {
  const { data: family, error } = await fetchMyFamily();

  if (error || !family?.id) {
    throw new Error(error || "Failed to determine user's family.");
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/family-invitations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      family: `/api/families/${family.id}`,
      email,
      sendEmail,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error details:", errorText);
    throw new Error("Failed to create family invitation");
  }

  return res.json();
}
                                //////////                  //////////
                               //////////  FAMILY MEMBERS  //////////
                              //////////                  //////////
// ---------------------------
// CREATE FAMILY & LINK USER
// ---------------------------
export async function createFamilyAndLinkUser(formData: FormData) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/family/create`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      const readableMessage =
        data?.errors || data?.message || "Échec de la création de la famille.";
      return { error: readableMessage };
    }

    return { data: { family: data } };
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Une erreur inattendue est survenue.",
    };
  }
}
// ---------------------------
// FETCH FAMILY MEMBERS
// ---------------------------
export async function fetchFamilyMembersByFamilyId(familyId: number): Promise<FamilyMemberType[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/family_members/by_family/${familyId}`;

  const res = await fetch(url, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error("Impossible de charger les membres de la famille.");
  }

  const data = await res.json();
  console.log("Membres chargés:", data);
  return data;
}
// ---------------------------
// DELETE FAMILY MEMBERS
// ---------------------------
export async function deleteFamilyMember(userId: number): Promise<{ success?: true; error?: string }> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/family_members/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return {
        error: data?.message || data?.error || "Erreur lors de la suppression du membre.",
      };
    }

    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erreur réseau.",
    };
  }
}





                                //////////        //////////
                               //////////  POST  //////////
                              //////////        //////////
// ---------------------------
// CREATE POST
// ---------------------------
export async function createPost(formData: FormData) {
  try {
    let imageIri: string | null = null;

    const imageFile = formData.get("image") as File | null;

    if (imageFile instanceof File) {
      const imageData = new FormData();
      imageData.append("file", imageFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media_objects`, {
        method: "POST",
        body: imageData,
        credentials: "include",
      });

      if (!res.ok) {
  const errorData = await res.json();
  const readableMessage =
    errorData?.violations?.[0]?.message ||
    errorData?.message ||
    "Échec de l'envoi du fichier. Veuillez réessayer.";
  return { error: `Image upload failed: ${readableMessage}` };
}

      const media = await res.json();
      imageIri = media["@id"];
    }

    const videoFile = formData.get("video") as File | null;
    let videoIri: string | null = null;

    if (videoFile instanceof File) {
      const videoData = new FormData();
      videoData.append("file", videoFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media_objects`, {
        method: "POST",
        body: videoData,
        credentials: "include",
      });

      if (!res.ok) {
  const errorData = await res.json();
  const readableMessage =
    errorData?.violations?.[0]?.message ||
    errorData?.message ||
    "Échec de l'envoi du fichier. Veuillez réessayer.";
  return { error: `Video upload failed: ${readableMessage}` };
}

      const media = await res.json();
      videoIri = media["@id"];
    }

    const postPayload = {
      title: formData.get("title"),
      content: formData.get("content"),
      image: imageIri,
      video: videoIri,
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
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
// ---------------------------
// FETCH FAMILY POSTS
// ---------------------------
export async function fetchFamilyPosts(): Promise<{ data: PostType[] | null; error: string | null }> {
  try {
    const user = await fetchMe();
    const userId = user.id;

    const familyMembersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/family_members?user=/api/users/${userId}`, {
      credentials: "include",
    });

    if (!familyMembersRes.ok) {
      return { data: null, error: "Failed to fetch family memberships." };
    }

    const familyMembersJson = await familyMembersRes.json();
    const familyMembers = familyMembersJson["hydra:member"] || familyMembersJson["member"] || [];

    if (familyMembers.length === 0) {
      return { data: null, error: "User is not linked to a family." };
    }

    const familyId = typeof familyMembers[0].family === "string"
      ? familyMembers[0].family.split("/").pop()
      : familyMembers[0].family?.id;

    if (!familyId) {
      return { data: null, error: "Family ID missing in membership." };
    }

    const postsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts?family=/api/families/${familyId}`, {
      credentials: "include",
    });

    const postsJson = await postsRes.json();

    if (!postsRes.ok) {
      return { data: null, error: postsJson.message || "Failed to fetch posts." };
    }

    return { data: postsJson["hydra:member"] ?? postsJson["member"] ?? [], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error fetching posts.",
    };
  }
}
// ---------------------------
// DELETE POST
// ---------------------------
export async function deletePost(postId: number) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`, {
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

// ---------------------------
// UPDATE POST
// ---------------------------
export async function updatePost(postId: string, formData: FormData, oldImageIri: string | null, oldVideoIri: string | null) {
  try {
    let newImageIri: string | null = oldImageIri;
    let newVideoIri: string | null = oldVideoIri;

    // === Handle image replacement ===
    const imageFile = formData.get("image") as File | null;

    if (imageFile instanceof File) {
      const imageData = new FormData();
      imageData.append("file", imageFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media_objects`, {
        method: "POST",
        body: imageData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        return { error: `Image upload failed: ${error.message || JSON.stringify(error)}` };
      }

      const media = await res.json();
      newImageIri = media["@id"];

      if (oldImageIri && oldImageIri !== newImageIri) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}${oldImageIri}`, {
          method: "DELETE",
          credentials: "include",
        });
      }
    }

    const videoFile = formData.get("video") as File | null;

    if (videoFile instanceof File) {
      const videoData = new FormData();
      videoData.append("file", videoFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media_objects`, {
        method: "POST",
        body: videoData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        return { error: `Video upload failed: ${error.message || JSON.stringify(error)}` };
      }

      const media = await res.json();
      newVideoIri = media["@id"];

      if (oldVideoIri && oldVideoIri !== newVideoIri) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}${oldVideoIri}`, {
          method: "DELETE",
          credentials: "include",
        });
      }
    }

    const updatePayload = {
      title: formData.get("title"),
      content: formData.get("content"),
      image: newImageIri,
      video: newVideoIri,
    };
console.log(JSON.stringify(updatePayload, null, 2));

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/merge-patch+json",
      },
      credentials: "include",
      body: JSON.stringify(updatePayload),
    });

    const data = await res.json();
    return res.ok ? { data } : { error: data.message || JSON.stringify(data) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error" };
  }
}
                                //////////             //////////
                               //////////  POST LIKE  //////////
                              //////////             //////////
// ---------------------------
// FETCH USER POST LIKES
// ---------------------------
export async function togglePostLike(postId: number) {
  try {
    const user = await fetchMe();
    const userId = user.id;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post_likes?user=${userId}&post=${postId}`, {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) throw new Error("Failed to check like");

    const existingLikes = await res.json();

    if (Array.isArray(existingLikes) && existingLikes.length > 0) {
      const likeId = existingLikes[0].id;

      if (!likeId) throw new Error("Like ID not found");

      const deleteRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post_likes/${likeId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!deleteRes.ok) throw new Error("Failed to delete like");

      return { status: "unliked" };
    } else {

      const postRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post_likes`, {
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
// ---------------------------
// FETCH POSTS LIKED
// ---------------------------
export async function isPostLiked(postId: number): Promise<boolean> {
  const user = await fetchMe();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post_likes?user=${user.id}&post=${postId}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to check like");

  const data = await res.json();
  return Array.isArray(data) && data.length > 0;
}
                                //////////                //////////
                               //////////  POST COMMENT  //////////
                              //////////                //////////
export interface CreateCommentPayload {
  postId: number;
  content: string;
  parentId?: number;
}
export interface ApiError {
  status: number;
  message: string;
}
// ---------------------------
// CREATE POST COMMENT
// ---------------------------
export async function postComment(payload: CreateCommentPayload) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post_comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        post: `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${payload.postId}`,
        content: payload.content,
        ...(payload.parentId && { parent: `${process.env.NEXT_PUBLIC_API_URL}/api/post_comments/${payload.parentId}` }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const message =
        errorData.message || errorData.detail || 'Unable to post comment.';
      throw { status: response.status, message } as ApiError;
    }

    return await response.json();
  } catch (error: unknown) {
    // Narrow the error type safely:
    if (typeof error === 'object' && error !== null && 'status' in error && 'message' in error) {
      const err = error as { status?: number; message?: string };
      throw {
        status: err.status ?? 500,
        message: err.message ?? 'An unexpected error occurred.',
      } as ApiError;
    } else {
      throw {
        status: 500,
        message: 'An unexpected error occurred.',
      } as ApiError;
    }
  }
}
// ---------------------------
// UPDATE COMMENT
// ---------------------------
export async function updateComment(commentId: number, content: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post_comments/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const message =
        errorData.message || errorData.detail || 'Unable to update comment.';
      throw { status: response.status, message } as ApiError;
    }

    return await response.json();
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'status' in error && 'message' in error) {
      const err = error as { status?: number; message?: string };
      throw {
        status: err.status ?? 500,
        message: err.message ?? 'An unexpected error occurred.',
      } as ApiError;
    } else {
      throw {
        status: 500,
        message: 'An unexpected error occurred.',
      } as ApiError;
    }
  }
}
// ---------------------------
// DELETE COMMENT
// ---------------------------
export async function deleteComment(commentId: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post_comments/${commentId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      const message =
        errorData.message || errorData.detail || 'Unable to delete comment.';
      throw { status: response.status, message } as ApiError;
    }

    return true;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'status' in error && 'message' in error) {
      const err = error as { status?: number; message?: string };
      throw {
        status: err.status ?? 500,
        message: err.message ?? 'An unexpected error occurred.',
      } as ApiError;
    } else {
      throw {
        status: 500,
        message: 'An unexpected error occurred.',
      } as ApiError;
    }
  }
}

                                //////////             //////////
                               //////////  UTILITIES  //////////
                              //////////             //////////
// ---------------------------
// PROMOTE ROLE ADMIN
// ---------------------------
export async function promoteFamilyMember(memberId: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/family/members/promote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // since your backend reads request->request->get()
      },
      body: new URLSearchParams({ memberId: memberId.toString() }),
      credentials: 'include', // if you use cookies for auth
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Erreur inconnue' };
    }

    const data = await response.json();
    return { success: true, message: data.message };
  } catch {
    return { success: false, error: 'Erreur réseau ou serveur' };
  }
}


// ---------------------------
// FETCH USED COLORS
// ---------------------------
export async function fetchUsedFamilyColors(inviteCode: string): Promise<string[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/families/colors-used?code=${encodeURIComponent(inviteCode)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // optional: use if cookies or auth needed
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch family colors');
  }

  const data = await res.json();
  return data.usedColors;
}