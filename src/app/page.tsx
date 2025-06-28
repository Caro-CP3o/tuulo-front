"use client";
import Image from "next/image";
import Button from "./components/atoms/Button";
import { useRouter } from "next/navigation";

// ---------------------------
// Home page for unauthenticated users
// ---------------------------
export default function Home() {
  const router = useRouter();
  return (
    <>
      <div className="relative flex flex-col justify-center items-center text-center px-10 space-y-6 max-w-m py-10">
        <h1 className="text-3xl font-bold !pb-6">Bienvenue sur Tuulo</h1>

        <p className="max-w-xl">
          Créez votre <strong>famille</strong>, partagez vos moments précieux et
          tissez des liens au quotidien, dans un <strong>espace privé</strong>,
          bienveillant et sans distractions.
        </p>
        <h2 className="satisfy text-2xl text-center text-red-400">
          Un cocon digital rien que pour vous et ceux qui comptent.
        </h2>
        <p className="max-w-xl">
          Chez <strong>Tuulo</strong>, nous plaçons la famille et la vie privée
          au cœur de tout. Pas d&apos;algorithmes intrusifs, pas de publicité,
          juste un endroit simple et <strong>sécurisé</strong> pour rester
          connectés avec ceux que vous aimez.
        </p>
        <Button onClick={() => router.push("/register")}>
          S&apos;inscrire
        </Button>

        <Image
          src="/star.png"
          alt="star"
          className="absolute top-[8vh] right-[-3vw] m-4"
          width={64}
          height={64}
        />
        <div className="relative w-full max-w-[300px] aspect-square rounded-full overflow-hidden mt-6">
          <Image
            src="/family-home.jpeg"
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
