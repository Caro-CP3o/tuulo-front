import type { MediaObjectType, UserType } from "@/types/api";

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


// export async function createPost(data: {
//   title: string;
//   description: string;
//   image?: File[];
//   video?: string;
// }) {
//   try {
//     const imageIris: string[] = [];

//     // Upload images if present
//     if (data.image && data.image.length > 0) {
//       for (const file of data.image) {
//         const formData = new FormData();
//         formData.append("file", file);

//         const res = await fetch("http://localhost:8000/api/media_objects", {
//           method: "POST",
//           body: formData,
//           credentials: "include",
//         });

//         if (!res.ok) {
//           const error = await res.json();
//           return { error: `Image upload failed: ${error.message || JSON.stringify(error)}` };
//         }

//         const media: MediaObjectType = await res.json();
//         imageIris.push(media["@id"]);
//       }
//     }

//     // Prepare post payload
//     const postPayload = {
//       title: data.title,
//       description: data.description,
//       images: imageIris,  // assuming your API expects an array of media IRIs for images
//       video: data.video || null,
//     };

//     // Create the post
//     const postRes = await fetch("http://localhost:8000/api/posts", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify(postPayload),
//     });

//     const postData = await postRes.json();

//     if (!postRes.ok) {
//       return { error: postData.message || JSON.stringify(postData) };
//     }

//     return { data: postData };
//   } catch (err) {
//     return { error: err instanceof Error ? err.message : "Network error" };
//   }
// }






// import type { MediaObjectType, UserType, PostType } from "@/types/api";
// type PostWithAuthor = PostType & { author: UserType };

// // JOIN FAMILY REQUEST
// export async function joinFamilyRequest(data: { email: string; familyCode: string }) {
//   const res = await fetch('/api/family/join-request', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data),
//   });
//   return res.json();
// }

// // APPROVED JOIN FAMILY
// export async function approveFamilyJoin(token: string) {
//   const res = await fetch(`/api/family/approve?token=${token}`, {
//     credentials: 'include',
//   });
//   return res.json();
// }

// // REGISTER USER
// export async function registerUser(formData: FormData) {
//   try {
//     const imageFile = formData.get("avatar") as File | null;
//     let imageIri: string | null = null;

//     if (imageFile && imageFile instanceof File) {
//       const imageData = new FormData();
//       imageData.append("file", imageFile);

//       const imageRes = await fetch("http://localhost:8000/api/media_objects", {
//         method: "POST",
//         body: imageData,
//       });

//       if (!imageRes.ok) {
//         const errorData = await imageRes.json();
//         return { error: `Image upload failed: ${errorData.message || JSON.stringify(errorData)}` };
//       }

//       const mediaObject = await imageRes.json();
//       imageIri = mediaObject['@id'];
//     }

//     const userPayload = {
//       email: formData.get("email"),
//       password: formData.get("password"),
//       firstName: formData.get("firstName"),
//       lastName: formData.get("lastName"),
//       birthDate: formData.get("birthDate"),
//       color: formData.get("color"),
//       alias: formData.get("alias") || null,
//       avatar: imageIri,
//     };

//     const userRes = await fetch("http://localhost:8000/api/users", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(userPayload),
//     });

//     if (!userRes.ok) {
//       const errorData = await userRes.json();
//       return { error: errorData.message || JSON.stringify(errorData) };
//     }

//     const userData = await userRes.json();
//     return { data: userData };

//   } catch (error) {
//     return { error: error instanceof Error ? error.message : "Network error" };
//   }
// }

// // CREATE FAMILY
// export async function createFamily(data: {
//   name: string;
//   description?: string | null;
//   coverImage?: string | null;
// }) {
//   try {
//     const res = await fetch("http://localhost:8000/api/families", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: 'include',
//       body: JSON.stringify(data),
//     });

//     const result = await res.json();
//     if (!res.ok) throw new Error(result.error || "Failed to create family");
//     return result;
//   } catch (err: unknown) {
//     if (err instanceof Error) return { error: err.message };
//     return { error: "An unknown error occurred." };
//   }
// }

// // LOGIN
// export async function login({ email, password }: { email: string; password: string }) {
//   const res = await fetch("http://localhost:8000/api/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     credentials: "include",
//     body: JSON.stringify({ email, password }),
//   });

//   let data;
//   try {
//     data = await res.json();
//   } catch {
//     const text = await res.text();
//     console.error("Failed to parse JSON response:", text);
//     throw new Error("Unexpected server error");
//   }

//   if (!res.ok) throw new Error(data?.error || "Login failed");

//   return data;
// }

// // LOGOUT
// export async function logout() {
//   const res = await fetch("http://localhost:8000/api/logout", {
//     method: "POST",
//     credentials: "include",
//   });

//   if (!res.ok) {
//     throw new Error("Logout failed");
//   }
// }

// // FETCH ME
// export async function fetchMe(): Promise<UserType> {
//   const res = await fetch('http://localhost:8000/api/profile', {
//     credentials: 'include',
//   });

//   if (!res.ok) {
//     throw new Error('Could not load profile');
//   }

//   return await res.json();
// }


// // UPDATE USER
// export async function updateMe(formData: FormData) {
//   try {
//     const updatePayload: Record<string, FormDataEntryValue | string | null> = {};

//     // Handle avatar upload if a file is present
//     const imageFile = formData.get("avatar") as File | null;
//     if (imageFile && imageFile instanceof File) {
//       const imageData = new FormData();
//       imageData.append("file", imageFile);

//       const imageRes = await fetch("http://localhost:8000/api/media_objects", {
//         method: "POST",
//         body: imageData,
//       });

//       if (!imageRes.ok) {
//         const errorData = await imageRes.json();
//         return {
//           error: `Image upload failed: ${errorData.message || JSON.stringify(errorData)}`,
//         };
//       }

//       const mediaObject = await imageRes.json();
//       updatePayload.avatar = mediaObject['@id'];
//     }
    
//     // Add form fields only if they're present
//     if (formData.has("password")) updatePayload.password = formData.get("password");
//     if (formData.has("firstName")) updatePayload.firstName = formData.get("firstName");
//     if (formData.has("lastName")) updatePayload.lastName = formData.get("lastName");
//     if (formData.has("birthDate")) updatePayload.birthDate = formData.get("birthDate");
//     if (formData.has("alias")) updatePayload.alias = formData.get("alias") || null;

//     // Don't send PATCH if there's nothing to update
//     if (Object.keys(updatePayload).length === 0) {
//       return { error: "No changes to update." };
//     }
//     const user = await fetchMe(); // must return something like { id: 12, ... }
//     const id = user.id;
//     // const previousAvatar = user.avatar;
    
//   //   const previousAvatar = typeof user.avatar === "object" && user.avatar !== null
//   // ? user.avatar['@id']
//   // : user.avatar; // fallback if already string
//   const avatar = user.avatar as MediaObjectType & { "@id"?: string };
// const previousAvatar =
//   typeof avatar === "object" && avatar !== null && "@id" in avatar
//     ? avatar["@id"]
//     : (avatar as unknown as string); // fallback if already a string

//     const userRes = await fetch(`http://localhost:8000/api/users/${id}`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/merge-patch+json",
//       },
//       credentials: "include",
//       body: JSON.stringify(updatePayload),
//     });
    
//     if (!userRes.ok) {
//       const errorData = await userRes.json();
//       return { error: errorData.message || JSON.stringify(errorData) };
//     }
  
//   // Get updated user info
//   const updatedUser = await fetchMe();

//   const updatedAvatar = updatedUser.avatar as MediaObjectType & { "@id"?: string };
// const updatedAvatarId =
//   typeof updatedAvatar === "object" && updatedAvatar !== null && "@id" in updatedAvatar
//     ? updatedAvatar["@id"]
//     : (updatedAvatar as unknown as string); // fallback if it's just a string

//   try {
//     if (
//     // previousAvatar &&
//     // previousAvatar !== updatedUser.avatar &&
//     // previousAvatar !== updatePayload.avatar // optional double check
//       previousAvatar &&
//       previousAvatar !== updatedAvatarId &&
//       previousAvatar !== updatePayload.avatar // optional double check
//     ) {
//       await fetch(`http://localhost:8000${previousAvatar}`, {
//         method: "DELETE",
//         credentials: "include",
//       });
//     }
//   } catch (deleteError) {
//     console.warn("Failed to delete old avatar:", deleteError);
//   }




//     return { data: await userRes.json() };
//   } catch (error) {
//     console.error("Update error:", error);
//     return {
//       error: error instanceof Error ? error.message : "Update failed.",
//     };
//   }
// }

// // CREATE FAMILY
// export async function createFamilyAndLinkUser(formData: FormData) {
//   try {
//     const user = await fetchMe(); // Get current user (must be authenticated)
//     const userId = user?.id;
//     if (!userId) return { error: "User not authenticated." };

//     // Step 1: Handle cover image upload if any
//     const imageFile = formData.get("coverImage") as File | null;
//     let imageIri: string | null = null;

//     if (imageFile && imageFile instanceof File) {
//       const imageData = new FormData();
//       imageData.append("file", imageFile);

//       const imageRes = await fetch("http://localhost:8000/api/media_objects", {
//         method: "POST",
//         body: imageData,
//       });

//       if (!imageRes.ok) {
//         const errorData = await imageRes.json();
//         return {
//           error: `Cover image upload failed: ${errorData.message || JSON.stringify(errorData)}`,
//         };
//       }

//       const mediaObject = await imageRes.json();
//       imageIri = mediaObject['@id'];
//     }

//     // Step 2: Create Family
//     const familyRes = await fetch("http://localhost:8000/api/families", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({
//         name: formData.get("name"),
//         description: formData.get("description") || null,
//         coverImage: imageIri,
//         creator: `/api/users/${userId}`,
//       }),
//     });

//     const family = await familyRes.json();
//     if (!familyRes.ok) return { error: family?.message || "Failed to create family." };

//     // Step 3: Link User to FamilyMember
//     const memberRes = await fetch("http://localhost:8000/api/family_members", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({
//         user: `/api/users/${userId}`,
//         family: family['@id'],
//       }),
//     });

//     const member = await memberRes.json();
//     if (!memberRes.ok) return { error: member?.message || "Failed to link user to family." };

//     return { data: { family, member } };
//   } catch (err: unknown) {
//     console.error("Create family error:", err);
//     return {
//       error: err instanceof Error ? err.message : "An unknown error occurred.",
//     };
//   }
// }


// export async function getFamilyById(id: number) {
//   try {
//     const res = await fetch(`http://localhost:8000/api/families/${id}`, {
//       headers: { Accept: "application/json" },
//       credentials: 'include',
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || "Fetch failed");
//     return { data, error: null };
//   } catch (err: unknown) {
//     const message = err instanceof Error ? err.message : "Unknown error";
//     return { data: null, error: message };
//   }
// }




// // export async function createPost({
// //   title,
// //   content,
// // }: {
// //   title: string;
// //   content: string;
// // }): Promise<{ data?: PostType; error?: string }> {
// //   try {
// //     const res = await fetch('http://localhost:8000/api/posts', {
// //       method: 'POST',
// //       credentials: 'include',
// //       headers: {
// //         'Content-Type': 'application/json',
// //       },
// //       body: JSON.stringify({
// //         title,
// //         content,
// //       }),
// //     });

// //     const data = await res.json();

// //     if (!res.ok) {
// //       return { error: data["description"] || "Failed to create post" };
// //     }

// //     return { data };
// //   } catch (error: unknown) {
// //     return {
// //       error: error instanceof Error ? error.message : 'Unknown error occurred',
// //     };
// //   }
// // }
// // export async function createPost({
// //   title,
// //   content,
// // }: {
// //   title: string;
// //   content: string;
// // }): Promise<{ data?: PostType; error?: string }> {
// //   try {
// //     // Step 1: Get user (for author IRI)
// //     const user = await fetchMe();
// //     const authorIri = `/api/users/${user.id}`;

// //     // Step 2: Get family (via helper)
// //     const { data: family, error: familyError } = await fetchMyFamily();
// //     if (familyError || !family?.id) {
// //       return { error: familyError || "Unable to find user's family." };
// //     }
// //     const familyIri = `/api/families/${family.id}`;

// //     // Step 3: POST to /api/posts
// //     const res = await fetch('http://localhost:8000/api/posts', {
// //       method: 'POST',
// //       credentials: 'include',
// //       headers: {
// //         'Content-Type': 'application/json',
// //       },
// //       body: JSON.stringify({
// //         title,
// //         content,
// //         author: authorIri,
// //         family: familyIri,
// //       }),
// //     });

    

//     const data = await res.json();

//     if (!res.ok) {
//       return { error: data["description"] || "Failed to create post" };
//     }

//     return { data };
//   } catch (error: unknown) {
//     return {
//       error: error instanceof Error ? error.message : 'Unknown error occurred',
//     };
//   }
// }


// export async function createPost({
//   title,
//   content,
// }: {
//   title: string;
//   content: string;
// }): Promise<{ data?: PostType; error?: string }> {
//   try {
//     // Step 1: Get user
//     // const user = await fetchMe();
//     // const authorIri = `/api/users/${user.id}`;

//     // Step 2: Get family
//     const { data: family, error: familyError } = await fetchMyFamily();
//     if (familyError || !family?.id) {
//       return { error: familyError || "Unable to find user's family." };
//     }
//     // const familyIri = `/api/families/${family.id}`;

//     // Step 3: POST to /api/posts
//     const res = await fetch('http://localhost:8000/api/posts', {
//       method: 'POST',
//       credentials: 'include',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         title,
//         content,
//         // author: authorIri,
//         // family: familyIri,
//       }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       return { error: data["description"] || "Failed to create post" };
//     }

//     return { data };
//   } catch (error: unknown) {
//     return {
//       error: error instanceof Error ? error.message : 'Unknown error occurred',
//     };
//   }
// }

// export async function createPost(postData: {
//   title: string;
//   content: string;
//   family: string; // family IRI like "/api/families/123"
//   author?: string; // optional author IRI if needed by backend
//   // add other fields as needed
// }): Promise<{ data?: PostType; error?: string }> {
//   try {
//     const res = await fetch('http://localhost:8000/api/posts', {
//       method: 'POST',
//       credentials: 'include',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(postData),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       return { error: data.message || 'Failed to create post' };
//     }

//     return { data };
//   } catch (error: unknown) {
//     return {
//       error: error instanceof Error ? error.message : 'Unknown error occurred',
//     };
//   }
// }

// export async function fetchFamilyPosts(familyId: number): Promise<{
//   data: PostWithAuthor[] | null;
//   error: string | null;
// }> {
//   try {
//     const res = await fetch(`http://localhost:8000/api/families/${familyId}/posts`, {
//       credentials: "include",
//     });

//     if (!res.ok) {
//       // Only throw for unexpected server errors
//       if (res.status >= 500) {
//         throw new Error("Une erreur serveur s'est produite.");
//       }
//       // Otherwise, treat it as no posts
//       return { data: [], error: null };
//     }

//     const data: PostWithAuthor[] = await res.json();
//     return { data, error: null };
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       return { data: null, error: error.message };
//     } else {
//       return { data: null, error: "Une erreur inconnue s'est produite." };
//     }
//   }
// }
export async function fetchFamilyPosts(familyId: number) {
  try {
    const res = await fetch(`/api/families/${familyId}/posts`, {
      credentials: "include", // if you're using cookies
    });

    if (!res.ok) {
      throw new Error("Il n'y a pas de posts dans cette famille.");
    }

    const data = await res.json();
    return { data, error: null };
  } catch (error: unknown) {
    return { data: null, error };
  }
}

// export async function fetchMyFamily(): Promise<{
//   data: {
//     id: number;
//     name: string;
//     description?: string;
//     coverImage?: { contentUrl: string } | string | null;
//   } | null;
//   error?: string;
// }> {
//   try {
//     const user = await fetchMe();

//     const familyMember = user.familyMembers?.[0]; // assuming one family per user for now
//     if (!familyMember || !familyMember.family?.id) {
//       return { data: null, error: "User is not linked to a family." };
//     }

//     const { data, error } = await getFamilyById(familyMember.family.id);
//     return { data, error: error || undefined };
//   } catch (err) {
//     return {
//       data: null,
//       error: err instanceof Error ? err.message : "Unknown error fetching family.",
//     };
//   }
// }





// export async function updateFamily(formData: FormData) {
//   try {
//     const user = await fetchMe(); // Get current user (must be authenticated)
//     const userId = user?.id;
//     if (!userId) return { error: "User not authenticated." };

//     // Step 1: Get familyId from formData
//     const familyId = formData.get("familyId");
//     if (!familyId) return { error: "Missing family ID." };

//     // Step 2: Fetch family to verify ownership and get previous coverImage
//     const familyRes = await fetch(`http://localhost:8000/api/families/${familyId}`, {
//       credentials: "include",
//     });
//     if (!familyRes.ok) {
//       return { error: "Failed to fetch family info." };
//     }
//     const family = await familyRes.json();

//     const creator = family.creator;
//     const creatorId = typeof creator === "object" && creator !== null ? creator.id : Number(creator?.split("/").pop());

//     if (creatorId !== userId) {
//       return { error: "You are not authorized to update this family." };
//     }

//     let previousCoverImage: string | null = null;
//     if (family.coverImage) {
//       previousCoverImage =
//         typeof family.coverImage === "object" && family.coverImage !== null
//           ? family.coverImage["@id"]
//           : family.coverImage;
//     }

//     const updatePayload: Record<string, FormDataEntryValue | string | null> = {};

//     // Step 3: Upload new cover image if provided
//     const imageFile = formData.get("coverImage") as File | null;
//     if (imageFile && imageFile instanceof File) {
//       const imageData = new FormData();
//       imageData.append("file", imageFile);

//       const imageRes = await fetch("http://localhost:8000/api/media_objects", {
//         method: "POST",
//         body: imageData,
//         credentials: "include",
//       });

//       if (!imageRes.ok) {
//         const errorData = await imageRes.json();
//         return { error: `Cover image upload failed: ${errorData.message || JSON.stringify(errorData)}` };
//       }

//       const mediaObject = await imageRes.json();
//       updatePayload.coverImage = mediaObject["@id"];
//     }

//     // Step 4: Add other fields if provided
//     if (formData.has("name")) updatePayload.name = formData.get("name");
//     if (formData.has("description")) updatePayload.description = formData.get("description");

//     if (Object.keys(updatePayload).length === 0) {
//       return { error: "No changes to update." };
//     }

//     // Step 5: Patch family
//     const patchRes = await fetch(`http://localhost:8000/api/families/${familyId}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/merge-patch+json" },
//       credentials: "include",
//       body: JSON.stringify(updatePayload),
//     });

//     if (!patchRes.ok) {
//       const errorData = await patchRes.json();
//       return { error: errorData.message || "Failed to update family." };
//     }

//     // Step 6: Delete old coverImage if replaced
//     if (
//       previousCoverImage &&
//       updatePayload.coverImage &&
//       previousCoverImage !== updatePayload.coverImage
//     ) {
//       try {
//         await fetch(`http://localhost:8000${previousCoverImage}`, {
//           method: "DELETE",
//           credentials: "include",
//         });
//       } catch (deleteError) {
//         console.warn("Failed to delete old cover image:", deleteError);
//       }
//     }

//     return { data: await patchRes.json() };
//   } catch (error) {
//     console.error("Update family error:", error);
//     return {
//       error: error instanceof Error ? error.message : "Update failed.",
//     };
//   }
// }

// export async function getMyFamilyWithMedia() {
//   try {
//     const user = await fetchMe(); // current user
//     const familyMemberships = user.familyMemberships || [];

//     if (familyMemberships.length === 0) {
//       return { data: null, error: "User is not linked to any family." };
//     }

//     // For now, assuming one family membership only
//     const family = familyMemberships[0]?.family;

//     if (!family || typeof family !== 'string') {
//       return { data: null, error: "Family reference missing or malformed." };
//     }

//     // Extract the numeric ID from the IRI (e.g., /api/families/12)
//     const idMatch = family.match(/\/(\d+)$/);
//     if (!idMatch) {
//       return { data: null, error: "Invalid family ID format." };
//     }

//     const familyId = parseInt(idMatch[1], 10);
//     if (isNaN(familyId)) {
//       return { data: null, error: "Failed to parse family ID." };
//     }

//     return await getFamilyById(familyId); // use shared function
//   } catch (error: unknown) {
//     console.error("Error in getMyFamilyWithMedia:", error);
//     return {
//       data: null,
//       error: error instanceof Error ? error.message : "Unknown error.",
//     };
//   }
// }

// export async function getMyFamilyWithMedia(): Promise<{
//   name: string;
//   description: string;
//   coverImageUrl: string | null;
// }> {
//   const res = await fetch("http://localhost:8000/api/my-family", {
//     credentials: "include",
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch family");
//   }

//   const family = await res.json();

//   let coverImageUrl: string | null = null;

//   if (family.coverImage) {
//     const coverImageIri = typeof family.coverImage === "string"
//       ? family.coverImage
//       : family.coverImage["@id"];

//     const mediaRes = await fetch(`http://localhost:8000${coverImageIri}`, {
//       credentials: "include",
//     });

//     if (mediaRes.ok) {
//       const media = await mediaRes.json();
//       coverImageUrl = media.contentUrl;
//     }
//   }

//   return {
//     name: family.name,
//     description: family.description,
//     coverImageUrl: coverImageUrl ?? null,
//   };
// }



// export async function updateFamily(familyId: number, formData: FormData) {
//   try {
//     const updatePayload: Record<string, FormDataEntryValue| string | null> = {};
//     // const updatePayload: Record<string, any> = {};
//     let previousCoverImage: string | null = null;

//     // Step 1: If there's a new file, upload it
//     const imageFile = formData.get("coverImage") as File | null;
//     if (imageFile && imageFile instanceof File) {
//       const imageData = new FormData();
//       imageData.append("file", imageFile);

//       const imageRes = await fetch("http://localhost:8000/api/media_objects", {
//         method: "POST",
//         body: imageData,
//         credentials: "include",
//       });

//       if (!imageRes.ok) {
//         const errorData = await imageRes.json();
//         return { error: `Cover image upload failed: ${errorData.message || JSON.stringify(errorData)}` };
//       }

//       const mediaObject = await imageRes.json();
//       updatePayload.coverImage = mediaObject["@id"];
//     }

//     // Step 2: Optional — update other fields
//     if (formData.has("name")) updatePayload.name = formData.get("name");
//     if (formData.has("description")) updatePayload.description = formData.get("description");

//     if (Object.keys(updatePayload).length === 0) {
//       return { error: "No changes to update." };
//     }

//     // Step 3: Get existing family to retrieve current coverImage
//     const familyRes = await fetch(`http://localhost:8000/api/families/${familyId}`, {
//       credentials: "include",
//     });
//     const existingFamily = await familyRes.json();
//     if (existingFamily.coverImage) {
//       previousCoverImage = typeof existingFamily.coverImage === "object"
//         ? existingFamily.coverImage["@id"]
//         : existingFamily.coverImage;
//     }

//     // Step 4: Patch family
//     const patchRes = await fetch(`http://localhost:8000/api/families/${familyId}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/merge-patch+json" },
//       credentials: "include",
//       body: JSON.stringify(updatePayload),
//     });

//     if (!patchRes.ok) {
//       const errorData = await patchRes.json();
//       return { error: errorData.message || "Failed to update family." };
//     }

//     // Step 5: Delete old cover image if replaced
//     if (
//       previousCoverImage &&
//       updatePayload.coverImage &&
//       previousCoverImage !== updatePayload.coverImage
//     ) {
//       try {
//         await fetch(`http://localhost:8000${previousCoverImage}`, {
//           method: "DELETE",
//           credentials: "include",
//         });
//       } catch (deleteError) {
//         console.warn("Failed to delete old cover image:", deleteError);
//       }
//     }

//     return { data: await patchRes.json() };
//   } catch (error) {
//     console.error("Update family error:", error);
//     return {
//       error: error instanceof Error ? error.message : "Update failed.",
//     };
//   }
// }


// export async function createFamilyAndLinkUser(data: {
//   name: string;
//   description?: string | null;
//   coverImage?: string | null;
// }) {
//   try {
//     const user = await fetchMe(); // Get current user (must be authenticated)
//     const userId = user?.id;
//     if (!userId) return { error: "User not authenticated." };

//     // Step 1: Create Family with creator field
//     const familyRes = await fetch("http://localhost:8000/api/families", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({ ...data, creator: `/api/users/${userId}` }),
//     });

//     const family = await familyRes.json();
//     if (!familyRes.ok) return { error: family?.message || "Failed to create family." };

//     // Step 2: Link User to FamilyMember
//     const memberRes = await fetch("http://localhost:8000/api/family_members", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({
//         user: `/api/users/${userId}`,
//         family: family['@id'],
//       }),
//     });

//     const member = await memberRes.json();
//     if (!memberRes.ok) return { error: member?.message || "Failed to link user to family." };

//     return { data: { family, member } };
//   } catch (err: unknown) {
//     console.error("Create family error:", err);
//     return {
//       error: err instanceof Error ? err.message : "An unknown error occurred.",
//     };
//   }
// }