"use client";

import { useState } from "react";
import { createFamilyInvitation } from "@/lib/api";

export default function FamilyInvitationGenerator() {
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleGenerateCode = async () => {
    setLoading(true);
    setError(null);
    setInvitationCode(null);

    try {
      const invitation = await createFamilyInvitation({ sendEmail: false });
      setInvitationCode(invitation.code);
    } catch (err: any) {
      setError(err.message || "Failed to generate code.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setLoading(true);
    setError(null);
    setInvitationCode(null);

    try {
      const invitation = await createFamilyInvitation({
        email,
        sendEmail: true,
      });
      setInvitationCode(invitation.code);
    } catch (err: any) {
      setError(err.message || "Failed to send email.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!invitationCode) return;
    navigator.clipboard.writeText(invitationCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md max-w-md w-full">
      <h2 className="text-xl font-semibold mb-4">Family Invitation</h2>

      <div className="mb-6">
        <h3 className="font-medium mb-2">Option 1: Generate Code to Share</h3>
        <button
          onClick={handleGenerateCode}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Code"}
        </button>
      </div>

      <div className="mb-6 border-t pt-4">
        <h3 className="font-medium mb-2">Option 2: Send Code via Email</h3>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
        />
        <button
          onClick={handleSendEmail}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          disabled={loading || !email}
        >
          {loading ? "Sending..." : "Send Email Invitation"}
        </button>
      </div>

      {error && <p className="text-red-600 mt-2">{error}</p>}

      {invitationCode && (
        <div className="mt-4">
          <p className="text-gray-700 mb-1">Invitation Code:</p>
          <div className="flex items-center gap-2">
            <code className="px-3 py-1 bg-gray-100 rounded border text-sm">
              {invitationCode}
            </code>
            <button
              onClick={handleCopy}
              className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { createFamilyInvitation } from "@/lib/api";

// export default function FamilyInvitationGenerator() {
//   const [invitationCode, setInvitationCode] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [email, setEmail] = useState("");
//   const [sendEmail, setSendEmail] = useState(false);

//   const handleGenerate = async () => {
//     setLoading(true);
//     setCopied(false);
//     setError(null);

//     try {
//       const invitation = await createFamilyInvitation({
//         email: sendEmail ? email : undefined,
//         sendEmail,
//       });
//       setInvitationCode(invitation.code);
//     } catch (err: any) {
//       setError(err.message || "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCopy = () => {
//     if (!invitationCode) return;
//     navigator.clipboard.writeText(invitationCode).then(() => {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     });
//   };

//   return (
//     <div className="p-4 bg-white rounded-xl shadow-md max-w-md w-full">
//       <h2 className="text-xl font-semibold mb-4">Generate Family Invitation</h2>

//       <div className="mb-3">
//         <label className="block text-sm font-medium text-gray-700">
//           Invitee Email (optional)
//         </label>
//         <input
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//           placeholder="email@example.com"
//         />
//       </div>

//       <div className="mb-3">
//         <label className="inline-flex items-center">
//           <input
//             type="checkbox"
//             checked={sendEmail}
//             onChange={(e) => setSendEmail(e.target.checked)}
//             className="mr-2"
//           />
//           Send email invitation
//         </label>
//       </div>

//       <button
//         onClick={handleGenerate}
//         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
//         disabled={loading}
//       >
//         {loading ? "Generating..." : "Generate Invitation Code"}
//       </button>

//       {error && <p className="text-red-600 mt-2">{error}</p>}

//       {invitationCode && (
//         <div className="mt-4">
//           <p className="text-gray-700 mb-1">Invitation Code:</p>
//           <div className="flex items-center gap-2">
//             <code className="px-3 py-1 bg-gray-100 rounded border">
//               {invitationCode}
//             </code>
//             <button
//               onClick={handleCopy}
//               className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
//             >
//               {copied ? "Copied!" : "Copy"}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
