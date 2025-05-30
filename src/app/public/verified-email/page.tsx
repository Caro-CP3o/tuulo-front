import Link from "next/link";

export default function VerifiedEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-green-600">
          🎉 Votre email a été vérifié avec succès !
        </h1>
        <p className="text-gray-600">
          Choisissez ce que vous souhaitez faire ensuite :
        </p>

        <div className="flex flex-col space-y-4">
          <Link
            href="/create-family"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Créez votre famille
          </Link>

          <Link
            href="/join-family"
            className="border border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3 rounded-xl transition"
          >
            Rejoignez une famille
          </Link>
        </div>
      </div>
    </div>
  );
}
