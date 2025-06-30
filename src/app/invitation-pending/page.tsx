"use client";
// ---------------------------
// Redirection page for pending members
// ---------------------------
export default function InvitationPendingPage() {
  return (
    <div className="border border-red-400 p-4 rounded-lg max-w-lg mb-12 text-center space-y-4 mx-10 md:mt-20 mt-[35vh]">
      <h2 className="">
        Votre Invitation est en cours de validation, Vous recevrez un mail dès
        que vous pourrez vous connecter !
      </h2>
      <span className="text-sm text-blue-900/50">
        - Si vous n&apos;avez pas reçu d&apos;email, veuillez vérifier vos spams
        -
      </span>
    </div>
  );
}
