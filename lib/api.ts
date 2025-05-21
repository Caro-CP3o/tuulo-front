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

export async function registerUser(data: { email: string; password: string; token: string }) {
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function verifyEmail(code: string) {
  const res = await fetch(`/verify-email?code=${code}`);
  return res.json();
}
