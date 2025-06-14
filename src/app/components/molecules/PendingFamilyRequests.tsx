// components/PendingFamilyRequests.tsx
"use client";

import { FamilyMemberType } from "@/types/api";
import { useEffect, useState } from "react";
// import { FamilyMember } from "@/types/api";

export default function PendingFamilyRequests() {
  const [pendingMembers, setPendingMembers] = useState<FamilyMemberType[]>([]);

  const fetchPending = async () => {
    const res = await fetch(
      "http://localhost:8000/api/family_members/pending",
      {
        credentials: "include",
      }
    );
    if (res.ok) {
      const data: FamilyMemberType[] = await res.json();
      setPendingMembers(data);
    }
  };

  const approveMember = async (id: number) => {
    const res = await fetch(
      `http://localhost:8000/api/family_members/${id}/approve`,
      {
        method: "PATCH",
        credentials: "include",
      }
    );
    if (res.ok) {
      setPendingMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Pending Join Requests</h3>
      {pendingMembers.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <ul className="space-y-4">
          {pendingMembers.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <span>{member.email ?? "No email provided"}</span>
              <button
                onClick={() => approveMember(member.id)}
                className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Approve
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
