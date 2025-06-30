"use client";

import { useEffect, useState } from "react";
import {
  fetchMe,
  fetchFamilyMembersByFamilyId,
  deleteFamilyMember,
  promoteFamilyMember,
} from "@/lib/api";
import { FamilyMemberType, UserType } from "@/types/api";
import { hasRole } from "@/helpers/auth";

export default function FamilyMembersList() {
  const [members, setMembers] = useState<FamilyMemberType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // ---------------------------
  // Effect load family members on mount
  // ---------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const me = await fetchMe();
        setCurrentUser(me);

        const activeMembership = me.familyMembers.find(
          (fm) => fm.status === "active"
        );
        if (!activeMembership?.familyId) {
          throw new Error("Aucune famille active trouvée.");
        }

        const membersList = await fetchFamilyMembersByFamilyId(
          activeMembership.familyId
        );
        console.log("Fetched members list:", membersList);
        setMembers(membersList);
      } catch (err) {
        console.error("Erreur chargement:", err);
        setError("Erreur lors du chargement des membres.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ---------------------------
  // Delete family member handler
  // ---------------------------
  const handleDelete = async (memberId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) return;
    const result = await deleteFamilyMember(memberId);
    if (result.success) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } else {
      alert(result.error || "Erreur lors de la suppression.");
    }
  };

  // ---------------------------
  // Promote role admin handler
  // ---------------------------
  const handlePromote = async (memberId: number) => {
    if (!confirm("Promouvoir ce membre en administrateur ?")) return;
    const result = await promoteFamilyMember(memberId);
    if (result.success) {
      alert(result.message);
      const updatedMe = await fetchMe();
      setCurrentUser(updatedMe);
      const activeMembership = updatedMe.familyMembers.find(
        (fm) => fm.status === "active"
      );
      if (activeMembership?.familyId) {
        const refreshedMembers = await fetchFamilyMembersByFamilyId(
          activeMembership.familyId
        );
        setMembers(refreshedMembers);
      }
    } else {
      alert(result.error || "Erreur lors de la promotion.");
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const isCurrentUserAdmin =
    currentUser && hasRole(currentUser, "ROLE_FAMILY_ADMIN");

  return (
    <div className="space-y-2">
      <p>
        Ici vous pouvez gérer les membres de votre famille. <br />
        Vous pouvez <span className="text-emerald-700/50">promouvoir</span> un
        membre en administrateur de famille ou bien{" "}
        <span className="text-red-400">supprimer </span>un membre.
      </p>
      <p className="text-red-400 border border-red-400 rounded-xl font-semibold p-4 mb-6">
        Attention, ces actions sont irréversibles. Supprimer un membre
        entraînera la suppression de son affiliation à la famille, cependant il
        conservera son compte.
      </p>
      {/* List of active family members with role */}
      {members
        .filter((member) => member.status === "active" && member.user)
        .map((member) => {
          const isCurrentUser = currentUser?.id === member.userId;
          const isAdmin = member.user?.roles?.includes("ROLE_FAMILY_ADMIN");

          return (
            <div
              key={member.id}
              className="flex flex-wrap gap-3 justify-between items-center border p-3 rounded-md shadow-sm bg-white"
            >
              <div className="flex items-center gap-3 text-left">
                <div>
                  <p className="satisfy text-xl">
                    {member.user.alias ||
                      `${member.user.firstName} ${member.user.lastName}`}
                  </p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>

                {isAdmin && (
                  <span className="text-xs text-emerald-600 font-semibold border border-emerald-600 px-2 py-0.5 rounded-full">
                    Administrateur
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                {isCurrentUserAdmin && !isCurrentUser && (
                  <>
                    {!isAdmin && (
                      <button
                        onClick={() => handlePromote(member.id)}
                        className="text-sm text-emerald-700/50 hover:underline"
                      >
                        Promouvoir
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="text-sm text-red-400 hover:underline"
                    >
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}
