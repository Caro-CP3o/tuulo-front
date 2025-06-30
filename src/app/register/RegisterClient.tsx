"use client";

import RegisterForm from "../components/forms/RegisterForm";
// ---------------------------
// User registration page
// ---------------------------
export default function RegisterPage() {
  return (
    <div className="text-center py-4 flex flex-col justify-center items-center mx-10 ">
      <h2 className="border border-red-400 p-4 rounded-lg max-w-lg mb-12">
        Vous souhaitez <strong>rejoindre une famille</strong> existante ? Prenez
        contact avec l&apos;un de ses membres et demandez votre code d&apos;
        <strong>invitation</strong> unique pour vous inscrire !
      </h2>
      <div className="flex flex-col justify-center items-center gap-6">
        <h1 className="text-xl font-bold mb-4">
          Inscrivez-vous et créez votre famille ! 🏡👨‍👩‍👧‍👦🌸
        </h1>
        <RegisterForm />
      </div>
    </div>
  );
}
