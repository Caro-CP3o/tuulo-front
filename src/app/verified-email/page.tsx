"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/forms/LoginForm";
import Button from "../components/atoms/Button";
import JoinFamilyForm from "../components/forms/JoinFamilyForm";
import CreateFamilyForm from "../components/forms/CreateFamilyForm";
// ---------------------------
// Link from verify email
// ---------------------------
export default function VerifiedEmailPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const isLoggedIn = !!user;
  const familyMember = user?.familyMembers?.[0];
  const status = familyMember?.status;

  if (loading) return null;

  // ---------------------------
  // Conditional rendering on user's status
  // ---------------------------
  return (
    <div className="flex gap-6 justify-center items-center flex-wrap w-full max-w-7xl my-8 ">
      <Image
        src="/star.png"
        alt="star"
        className="absolute top-[10rem] right-[3rem] m-4"
        width={64}
        height={64}
      />
      {/* Message for every verified user */}
      <div className="space-y-4">
        <div className="bg-blue-900 !text-white shadow-xl rounded-2xl p-8 max-w-md text-center space-y-6 mx-4 mx-auto">
          <h1 className="text-2xl font-bold !text-white">
            🎉 Votre email a été vérifié avec succès !
          </h1>

          {/* User not authenticated and contiononal rendering on status*/}
          {!isLoggedIn ? (
            <>
              <p className="pt-4">Veuillez vous connecter pour continuer.</p>
              <LoginForm />
              <div className="pt-4">
                <p>Pas encore de compte ?</p>
                <Button onClick={() => router.push("/register")}>
                  Je m&apos;inscris
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* User active status */}
              {status === "active" && (
                <p className="pt-4">
                  Vous pouvez à présent commencer à partager avec vos proches !
                </p>
              )}
              {/* User pending status */}
              {status === "pending" && (
                <div>
                  <p className="pt-4">
                    Votre demande est en cours de traitement. Vous recevrez un
                    email dès que votre demande sera traitée.
                  </p>
                  <span className="text-sm text-blue-900/50">
                    - Si vous n&apos;avez pas reçu d&apos;email, veuillez
                    vérifier vos spams -
                  </span>
                </div>
              )}
              {/* User rejected status */}
              {status === "rejected" && (
                <>
                  <p className="pt-4">
                    Votre demande a été rejetée, veuillez contacter un membre de
                    la famille pour plus d&apos;informations.
                  </p>
                  <p className="pt-2">
                    Vous avez également la possibilité de créer une nouvelle
                    famille.
                  </p>
                  <Button onClick={() => router.push("/create-family")}>
                    Je crée ma famille !
                  </Button>
                </>
              )}
              {/* Status undefined */}
              {!status && (
                <>
                  <p className="pt-4">
                    Vous pouvez à présent créer votre espace privé pour partager
                    avec vos proches et rester connectés !
                  </p>
                  <p className="pt-4">
                    Vous avez reçu une invitation ? Entrez le code
                    d&apos;invitation qui figure dans l&apos;e-mail ci-dessous.
                  </p>
                  <span className="text-sm text-blue-900/50">
                    - Si vous n&apos;avez pas reçu d&apos;email, veuillez
                    vérifier vos spams -
                  </span>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {/* Authenticated user - redirected to his family's /home */}
      {isLoggedIn && (
        <div className="max-w-lg !space-y-6 !mx-4">
          {status === "active" && (
            <p className="text-center">Bienvenue dans Tuulo !</p>
          )}
          ``
          {/* Authenticated user with status undefined */}
          {!status && (
            <>
              <CreateFamilyForm onSuccess={() => router.push("/home-family")} />
              <JoinFamilyForm />
            </>
          )}
        </div>
      )}
      <Image
        src="/star.png"
        alt="star"
        className="absolute bottom-[25rem] left-[3rem] m-4"
        width={64}
        height={64}
      />
    </div>
  );
}
