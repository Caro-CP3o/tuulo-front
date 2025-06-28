"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegistrationSuccess() {
  const router = useRouter();
  // ---------------------------
  // Effect check flag & redirection
  // ---------------------------
  useEffect(() => {
    const flag = sessionStorage.getItem("justRegistered");
    console.log("justRegistered flag:", flag);

    if (flag !== "true") {
      router.push("/");
    } else {
      const handleUnload = () => {
        sessionStorage.removeItem("justRegistered");
      };

      window.addEventListener("beforeunload", handleUnload);

      return () => {
        window.removeEventListener("beforeunload", handleUnload);
      };
    }
  }, [router]);

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <div className="bg-blue-900 p-8 rounded-lg mb-12">
        <h1 className="text-2xl font-semibold !text-white rounded-lg">
          Inscription réussie 🎉
        </h1>
      </div>
      <p>
        Félicitations ! Vous faites désormais partie de la grande famille{" "}
        <strong className="text-xl text-red-400/75">Tuulo</strong>.
        <br />
        Veuillez <strong>consulter votre boîte mail</strong> pour confirmer
        votre inscription.
      </p>
      <span className="text-sm text-blue-900/50">
        - Si vous n&apos;avez pas reçu d&apos;email, veuillez vérifier vos spams
        -
      </span>
      <div className="relative w-full max-w-[300px] aspect-square rounded-full overflow-hidden mt-6 mx-auto">
        <Image
          src="/family-registered.jpeg"
          alt="User avatar"
          fill
          className="object-cover w-full h-full"
          unoptimized
        />
      </div>
    </div>
  );
}
