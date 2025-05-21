"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail } from "../../../lib/api";
// import { verifyEmail } from '@/lib/api'

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code") || "";
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    if (!code) {
      setMessage("Invalid verification code.");
      return;
    }
    verifyEmail(code).then((res) => {
      setMessage(res.message || res.error || "Verification failed.");
      if (res.success) {
        setTimeout(() => router.push("/login"), 2000);
      }
    });
  }, [code, router]);

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow text-center">
      <h1 className="text-xl font-bold mb-4">Email Verification</h1>
      <p>{message}</p>
      {message.includes("success") && <p>Redirecting to login...</p>}
    </div>
  );
}
