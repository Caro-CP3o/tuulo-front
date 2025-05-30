export async function joinFamilyRequest(data: { email: string; familyCode: string }) {
  const res = await fetch('/api/family/join-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function approveFamilyJoin(token: string) {
  const res = await fetch(`/api/family/approve?token=${token}`);
  return res.json();
}

export async function registerUser(formData: FormData) {
  try {
    const imageFile = formData.get("avatar") as File | null;
    let imageIri: string | null = null;

    if (imageFile && imageFile instanceof File) {
      const imageData = new FormData();
      imageData.append("file", imageFile);

      const imageRes = await fetch("http://localhost:8000/api/media_objects", {
        method: "POST",
        body: imageData,
      });

      if (!imageRes.ok) {
        const errorData = await imageRes.json();
        return { error: `Image upload failed: ${errorData.message || JSON.stringify(errorData)}` };
      }

      const mediaObject = await imageRes.json();
      imageIri = mediaObject['@id'];
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

    const userRes = await fetch("http://localhost:8000/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userPayload),
    });

    if (!userRes.ok) {
      const errorData = await userRes.json();
      return { error: errorData.message || JSON.stringify(errorData) };
    }

    const userData = await userRes.json();
    return { data: userData };

  } catch (error) {
    console.error("Network error:", error);
    return { error: error instanceof Error ? error.message : "Network error" };
  }
}

export async function createFamily(data: {
  name: string;
  description?: string | null;
  coverImage?: string | null;
}) {
  try {
    const res = await fetch("http://localhost:8000/api/families", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to create family");
    return result;
  } catch (err: unknown) {
    if (err instanceof Error) return { error: err.message };
    return { error: "An unknown error occurred." };
  }
}

export async function login({ email, password }: { email: string; password: string }) {
  const res = await fetch("http://localhost:8000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    const text = await res.text();
    console.error("Failed to parse JSON response:", text);
    throw new Error("Unexpected server error");
  }

  if (!res.ok) throw new Error(data?.error || "Login failed");

  return data;
}

export async function logout() {
  const res = await fetch("http://localhost:8000/api/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }
}

export async function fetchMe() {
  const res = await fetch('http://localhost:8000/api/profile', {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Not authenticated');
  return await res.json();
}


export async function updateMe(formData: FormData) {
  try {
    const updatePayload: Record<string, FormDataEntryValue | string | null> = {};

    // Handle avatar upload if a file is present
    const imageFile = formData.get("avatar") as File | null;
    if (imageFile && imageFile instanceof File) {
      const imageData = new FormData();
      imageData.append("file", imageFile);

      const imageRes = await fetch("http://localhost:8000/api/media_objects", {
        method: "POST",
        body: imageData,
      });

      if (!imageRes.ok) {
        const errorData = await imageRes.json();
        return {
          error: `Image upload failed: ${errorData.message || JSON.stringify(errorData)}`,
        };
      }

      const mediaObject = await imageRes.json();
      updatePayload.avatar = mediaObject['@id'];
    }
    

    // Add form fields only if they're present
    if (formData.has("password")) updatePayload.password = formData.get("password");
    if (formData.has("firstName")) updatePayload.firstName = formData.get("firstName");
    if (formData.has("lastName")) updatePayload.lastName = formData.get("lastName");
    if (formData.has("birthDate")) updatePayload.birthDate = formData.get("birthDate");
    if (formData.has("alias")) updatePayload.alias = formData.get("alias") || null;

    // Don't send PATCH if there's nothing to update
    if (Object.keys(updatePayload).length === 0) {
      return { error: "No changes to update." };
    }
    const user = await fetchMe(); // must return something like { id: 12, ... }
    const id = user.id;
    // const previousAvatar = user.avatar;
    const previousAvatar = typeof user.avatar === "object" && user.avatar !== null
  ? user.avatar['@id']
  : user.avatar; // fallback if already string

    const userRes = await fetch(`http://localhost:8000/api/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/merge-patch+json",
      },
      credentials: "include",
      body: JSON.stringify(updatePayload),
    });
    
    if (!userRes.ok) {
      const errorData = await userRes.json();
      return { error: errorData.message || JSON.stringify(errorData) };
    }
  
  // Get updated user info
  const updatedUser = await fetchMe();

  try {
    if (
    previousAvatar &&
    previousAvatar !== updatedUser.avatar &&
    previousAvatar !== updatePayload.avatar // optional double check
    ) {
      await fetch(`http://localhost:8000${previousAvatar}`, {
        method: "DELETE",
        credentials: "include",
      });
    }
  } catch (deleteError) {
    console.warn("Failed to delete old avatar:", deleteError);
  }




    return { data: await userRes.json() };
  } catch (error) {
    console.error("Update error:", error);
    return {
      error: error instanceof Error ? error.message : "Update failed.",
    };
  }
}

export async function createFamilyAndLinkUser(formData: FormData) {
  try {
    const user = await fetchMe(); // Get current user (must be authenticated)
    const userId = user?.id;
    if (!userId) return { error: "User not authenticated." };

    // Step 1: Handle cover image upload if any
    const imageFile = formData.get("coverImage") as File | null;
    let imageIri: string | null = null;

    if (imageFile && imageFile instanceof File) {
      const imageData = new FormData();
      imageData.append("file", imageFile);

      const imageRes = await fetch("http://localhost:8000/api/media_objects", {
        method: "POST",
        body: imageData,
      });

      if (!imageRes.ok) {
        const errorData = await imageRes.json();
        return {
          error: `Cover image upload failed: ${errorData.message || JSON.stringify(errorData)}`,
        };
      }

      const mediaObject = await imageRes.json();
      imageIri = mediaObject['@id'];
    }

    // Step 2: Create Family
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

    // Step 3: Link User to FamilyMember
    const memberRes = await fetch("http://localhost:8000/api/family_members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        user: `/api/users/${userId}`,
        family: family['@id'],
      }),
    });

    const member = await memberRes.json();
    if (!memberRes.ok) return { error: member?.message || "Failed to link user to family." };

    return { data: { family, member } };
  } catch (err: unknown) {
    console.error("Create family error:", err);
    return {
      error: err instanceof Error ? err.message : "An unknown error occurred.",
    };
  }
}


export async function getFamilyById(id: number) {
  try {
    const res = await fetch(`http://localhost:8000/api/families/${id}`, {
      headers: { Accept: "application/json" },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Fetch failed");
    return { data, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { data: null, error: message };
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
    console.log('familyMembersJson', familyMembersJson); 

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