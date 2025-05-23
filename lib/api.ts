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

export async function registerUser(data: { 
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  color: string;
  alias?: string | null;
  avatar?: string | null;
}) {
    try {
    const res = await fetch('http://localhost:8000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.message || 'Registration failed' };
    }

    const responseData = await res.json();
    return { data: responseData };
  } catch (error) {
    console.error('Network error:', error);
    return { error: error instanceof Error ? error.message : 'Network error' };
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
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Failed to create family");
    }

    return result;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "An unknown error occurred." };
  }
}

export async function verifyEmail(token: string) {
  const res = await fetch(`http://localhost:8000/verify-email?code=${token}`);
  return res.json();
}
