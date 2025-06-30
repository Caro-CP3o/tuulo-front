"use client";
// ---------------------------
// Redirection page for rejected members
// ---------------------------
import { useRouter } from "next/navigation";
import Button from "../components/atoms/Button";

export default function InvitationRejectedPage() {
  const router = useRouter();

  return (
    <div className="text-center py-4 flex flex-col justify-center items-center mx-1 md:mt-20 mt-[35vh]">
      <h2 className="border border-red-400 p-4 rounded-lg max-w-lg mb-12">
        Votre demande a été rejetée, veuillez contacter un membre de la famille
        pour plus d&apos;informations.
      </h2>
      <h2 className="satisfy max-w-lg mb-6 text-2xl">
        Vous avez également la possibilité de créer une nouvelle famille !
      </h2>
      <Button onClick={() => router.push("/create-family")}>
        Je crée ma famille !
      </Button>
    </div>
  );
}
