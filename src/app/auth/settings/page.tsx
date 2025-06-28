"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import { fetchMyFamily } from "@/lib/api";
import { hasRole } from "@/helpers/auth";

import UpdateFamilyForm from "@/app/components/forms/UpdateFamilyForm";
import FamilyInvitationGenerator from "@/app/components/molecules/FamilyInvitationGenerator";
import PendingFamilyRequests from "@/app/components/molecules/PendingFamilyRequests";
import FamilyMembersList from "@/app/components/organisms/FamilyMembersList";

//
const Arrow = ({ isOpen }: { isOpen: boolean }) => (
  <div className="flex justify-center">
    <div
      className={`transition-transform duration-300 text-xl mt-4 ${
        isOpen ? "rotate-180" : ""
      }`}
    >
      <ChevronDown />
    </div>
  </div>
);

export default function SettingsPage() {
  // ---------------------------
  // State variables
  // ---------------------------
  const [familyId, setFamilyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadFamily = async () => {
      try {
        const response = await fetchMyFamily();
        const family = response.data;

        if (family?.id) {
          setFamilyId(family.id);
        } else {
          setError("No family found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load family.");
      }
    };

    loadFamily();
  }, []);

  // Redirect non-admins
  useEffect(() => {
    if (!loading && (!user || !hasRole(user, "ROLE_FAMILY_ADMIN"))) {
      router.push("/home");
    }
  }, [user, loading, router]);

  // Unified loading/error/access check
  if (loading) return <p className="text-center">Chargement...</p>;
  if (error) return <p className="text-red-600 text-center">{error}</p>;
  if (!user || !hasRole(user, "ROLE_FAMILY_ADMIN")) return null;
  if (!familyId) return <p className="text-center">Aucune famille assignée.</p>;

  return (
    <div className="max-w-3xl mx-auto py-8 text-center">
      <div className="mb-20">
        <h1 className="text-2xl font-bold">
          Bienvenue dans l&apos;espace réservé à l&apos;administration de votre
          famille.
        </h1>
        <p className="pt-6">
          Vous pouvez gérer les membres, inviter des proches, et même modifier
          les infos de votre famille.
        </p>
      </div>

      {/* Invitation Section */}
      <Section
        title="Invitez un proche à rejoindre votre famille !"
        isOpen={showInvite}
        onToggle={() => setShowInvite(!showInvite)}
      >
        <p className="mb-8">
          Vous avez la possibilité d&apos;envoyer directement un mail ou de
          copier-coller le code d&apos;invitation, vous recevrez ensuite une
          demande de confirmation sur cette page !
        </p>
        <FamilyInvitationGenerator />
      </Section>

      <Divider />

      {/* Requests Section */}
      <Section
        title="Demandes pour rejoindre votre famille :"
        isOpen={showRequests}
        onToggle={() => setShowRequests(!showRequests)}
      >
        <PendingFamilyRequests />
      </Section>

      <Divider />

      {/* Update Section */}
      <Section
        title="Mettez à jour les informations de votre famille"
        isOpen={showUpdate}
        onToggle={() => setShowUpdate(!showUpdate)}
      >
        <UpdateFamilyForm familyId={familyId} />
      </Section>

      <Divider />

      {/* Members Section */}
      <Section
        title="Liste des membres de votre famille"
        isOpen={showMembers}
        onToggle={() => setShowMembers(!showMembers)}
      >
        <FamilyMembersList />
      </Section>
    </div>
  );
}

// Reusable Section component
function Section({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2
        className="text-xl font-semibold mb-2 cursor-pointer"
        onClick={onToggle}
      >
        {title}
        <Arrow isOpen={isOpen} />
      </h2>
      {isOpen && <div className="mt-4">{children}</div>}
    </section>
  );
}

// Visual divider
function Divider() {
  return (
    <span className="block w-full border-t-4 border-red-400/25 my-12"></span>
  );
}
