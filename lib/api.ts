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

    return { data: await userRes.json() };
  } catch (error) {
    console.error("Update error:", error);
    return {
      error: error instanceof Error ? error.message : "Update failed.",
    };
  }
}


// export async function updateMe(formData: FormData) {
//   try {
//         const updatePayload = {
//       // password: formData.get("password") || undefined,
//       firstName: formData.get("firstName"),
//       lastName: formData.get("lastName"),
//       birthDate: formData.get("birthDate"),
//       alias: formData.get("alias") || null,
//       avatar: imageIri,
//     };

//     // Add form fields only if they're present
//     // if (formData.has("password")) updatePayload.password = formData.get("password");
//     if (formData.has("firstName")) updatePayload.firstName = formData.get("firstName");
//     if (formData.has("lastName")) updatePayload.lastName = formData.get("lastName");
//     if (formData.has("birthDate")) updatePayload.birthDate = formData.get("birthDate");
//     if (formData.has("alias")) updatePayload.alias = formData.get("alias") || null;

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

//     // Don't send PATCH if there's nothing to update
//     if (Object.keys(updatePayload).length === 0) {
//       return { error: "No changes to update." };
//     }

//     const userRes = await fetch("http://localhost:8000/api/users/profile", {
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

//     return { data: await userRes.json() };
//   } catch (error) {
//     console.error("Update error:", error);
//     return {
//       error: error instanceof Error ? error.message : "Update failed.",
//     };
//   }
// }


// export async function updateMe(formData: FormData) {
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

//     const updatePayload = {
//       password: formData.get("password") || undefined,
//       firstName: formData.get("firstName"),
//       lastName: formData.get("lastName"),
//       birthDate: formData.get("birthDate"),
//       alias: formData.get("alias") || null,
//       avatar: imageIri,
//     };

//     if (imageIri) {
//       updatePayload.avatar = imageIri;
//     }

//     const userRes = await fetch("http://localhost:8000/api/users/profile", {
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

//     return { data: await userRes.json() };
//   } catch (error) {
//     console.error("Update error:", error);
//     return { error: error instanceof Error ? error.message : "Update failed." };
//   }
// }