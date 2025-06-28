"use client";

import { FamilyMemberType } from "@/types/api";
import { useEffect, useState } from "react";

// ---------------------------
// Family request list component
// ---------------------------
export default function PendingFamilyRequests() {
  // ---------------------------
  // State variables
  // ---------------------------
  const [pendingMembers, setPendingMembers] = useState<FamilyMemberType[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // API call family members with pending status
  const fetchPending = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/family_members/pending`,
      {
        credentials: "include",
      }
    );
    if (res.ok) {
      const data: FamilyMemberType[] = await res.json();
      setPendingMembers(data);
    }
  };

  // API call to add new family members
  const approveMember = async (id: number) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/family_members/${id}/approve`,
      {
        method: "PATCH",
        credentials: "include",
      }
    );
    if (res.ok) {
      setPendingMembers((prev) => prev.filter((m) => m.id !== id));
      setSuccessMessage(
        "✅ Le membre a été accepté à rejoindre votre famille. Il recevra une notification par email."
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };
  // API call to reject new family member
  const rejectMember = async (id: number) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/family_members/${id}/reject`,
      {
        method: "PATCH",
        credentials: "include",
      }
    );
    if (res.ok) {
      setPendingMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // ---------------------------
  // Effect to load pending members on mount
  // ---------------------------
  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="flex md:flex-row flex-col gap-8 justify-between w-full p-6 shadow-md border border-gray-300/30 rounded-xl md:items-start items-center max-h-max">
      {pendingMembers.length === 0 ? (
        <p>Aucune demande en cours.</p>
      ) : (
        <ul className="space-y-4 w-full">
          {successMessage && (
            <div className="p-3 text-emerald-600/50 bg-green-100 border border-green-300 rounded">
              {successMessage}
            </div>
          )}
          {pendingMembers.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap gap-2 w-full items-center justify-between p-3 rounded-lg"
            >
              <span>{member.email ?? "No email provided"}</span>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => approveMember(member.id)}
                  className="px-4 py-1 bg-blue-900 text-white rounded hover:bg-red-400"
                >
                  Accepter
                </button>
                <button
                  onClick={() => rejectMember(member.id)}
                  className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Rejeter
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
