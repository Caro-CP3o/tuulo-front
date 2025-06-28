"use client";

import { useState } from "react";
import { createFamilyInvitation } from "@/lib/api";
import { Mail, Key } from "lucide-react";

export default function FamilyInvitationGenerator() {
  // ---------------------------
  // State variables
  // ---------------------------
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // ---------------------------
  // Generated code handler
  // ---------------------------
  const handleGenerateCode = async () => {
    setLoading(true);
    setError(null);
    setInvitationCode(null);

    // API call to generate invitation code
    try {
      const invitation = await createFamilyInvitation({ sendEmail: false });
      setInvitationCode(invitation.code);
    } catch (err: any) {
      setError(err.message || "Failed to generate code.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Copy code handler
  // ---------------------------
  const handleCopy = () => {
    if (!invitationCode) return;
    navigator.clipboard.writeText(invitationCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ---------------------------
  //  Sending email handler
  // ---------------------------
  const handleSendEmail = async () => {
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }

    setLoading(true);
    setInvitationCode(null);
    setEmailSent(false);

    // API call to create invitation code & send by email
    try {
      const invitation = await createFamilyInvitation({
        email,
        sendEmail: true,
      });
      setInvitationCode(invitation.code);
      setEmailSent(true);
    } catch (err: any) {
      if (err.message?.includes("does not comply with addr-spec")) {
        setError("L'adresse email est invalide.");
      } else {
        setError(err.message || "Échec de l'envoi de l'invitation.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle email form
  const toggleEmailForm = () => {
    setShowEmailForm((prev) => {
      const newState = !prev;
      if (newState) {
        setShowCodeForm(false);
        setInvitationCode(null);
        setEmailSent(false);
        setError(null);
      }
      return newState;
    });
  };

  // Toggle code form
  const toggleCodeForm = () => {
    setShowCodeForm((prev) => {
      const newState = !prev;
      if (newState) {
        setShowEmailForm(false);
        setInvitationCode(null);
        setEmailSent(false);
        setError(null);
      }
      return newState;
    });
  };
  return (
    <div className="flex flex-col flex-wrap gap-6 justify-center items-center w-full p-6 shadow-md border border-gray-300/30 rounded-xl">
      {/* Toggle Icons */}
      <div className="flex gap-6 justify-center w-full">
        <button
          onClick={toggleEmailForm}
          className={`flex flex-col justify-center items-center py-3 px-6 rounded-full border border-blue-900/50 hover:bg-blue-900/50 hover:text-white transition ${
            showEmailForm ? "bg-blue-900 text-white px-6" : ""
          }`}
          title="Inviter par mail"
        >
          <Mail className="w-5 h-5" />
          Envoyer un mail
        </button>
        <button
          onClick={toggleCodeForm}
          className={`flex flex-col justify-center items-center py-3 px-6 rounded-full border border-blue-900/50 hover:bg-blue-900/50 hover:text-white  transition ${
            showCodeForm ? "bg-blue-900 text-white" : ""
          }`}
          title="Générer un code"
        >
          <Key className="w-5 h-5" />
          Générer un code
        </button>
      </div>

      <div className="flex flex-col gap-8 justify-center items-center max-h-max w-full">
        {/* case 1 - email form */}
        {showEmailForm && (
          <div className="mb-6 flex flex-col justify-center w-full max-w-md">
            <h3 className="font-medium mb-2">
              Envoyez une invitation par mail :
            </h3>

            {/* If email sent successfully, show message */}
            {emailSent ? (
              <p className="text-emerald-600/40 font-semibold">
                Votre invitation a bien été envoyée.
              </p>
            ) : (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                />
                <button
                  onClick={handleSendEmail}
                  className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-red-400 disabled:opacity-50"
                  disabled={loading || !email}
                >
                  {loading ? "Envoi..." : "Inviter par mail"}
                </button>
              </>
            )}
          </div>
        )}

        {/* case 2 - code generation */}
        {showCodeForm && (
          <div className="mb-6 flex flex-col justify-end w-full max-w-md">
            <h3 className="font-medium mb-2">
              Générez votre code d&apos;invitation à copier-coller :
            </h3>
            <button
              onClick={handleGenerateCode}
              className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-red-400 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "En cours..." : "Générer un code"}
            </button>

            {invitationCode && (
              <div className="mt-4 mx-auto">
                <p className="text-gray-700 mb-1">
                  Votre code d&apos;invitation:
                </p>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-1 bg-red-400/15 rounded border text-sm">
                    {invitationCode}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    {copied ? "Copié!" : "Copier"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
