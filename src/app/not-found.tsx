"use client";

import Image from "next/image";
import Button from "./components/atoms/Button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useErrorPage } from "./context/ErrorPageContext";

// ---------------------------
// Custom Not Found page
// ---------------------------
export default function NotFoundPage() {
  const router = useRouter();
  const { setIsErrorPage } = useErrorPage();

  useEffect(() => {
    setIsErrorPage(true);

    return () => {
      setIsErrorPage(false);
    };
  }, [setIsErrorPage]);

  return (
    <>
      <div className="relative flex flex-col justify-center items-center text-center px-10 space-y-6 max-w-m py-10">
        <h1 className="text-3xl font-bold !pb-6">
          404 - Cette page n&apos;existe pas ou plus !
        </h1>

        <h2 className="satisfy text-2xl text-center text-red-400">
          Cette page s&apos;est perdue en chemin. On continue de la chercher
          dans le village.
        </h2>

        <Button onClick={() => router.push("/")}>
          Retour à l&apos;accueil
        </Button>
        <Button onClick={() => router.push("/")}>Consulter les FAQ</Button>

        <Image
          src="/star.png"
          alt="star"
          className="absolute top-[8vh] right-[-3vw] m-4"
          width={64}
          height={64}
        />
        <div className="relative w-full max-w-[300px] aspect-square rounded-full overflow-hidden mt-6">
          <Image
            src="/404.jpeg"
            alt="User avatar"
            fill
            className="object-cover w-full h-full"
            unoptimized
          />
        </div>
        <Image
          src="/star.png"
          alt="star"
          className="absolute bottom-[10vh] left-[-1vw] m-4"
          width={64}
          height={64}
        />
      </div>
    </>
  );
}
