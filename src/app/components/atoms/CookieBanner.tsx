"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CookieConsent from "react-cookie-consent";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only show banner if consent not yet given
    const hasConsent = document.cookie.includes("tuulo_cookie_consent=true");
    if (!hasConsent) {
      setShowBanner(true);
    }
  }, []);

  if (!showBanner) return null;
  // ---------------------------
  // Custom cookie banner
  // ---------------------------
  return (
    <div className="fixed inset-0 bg-blue-900/50 z-[9999] flex items-center justify-center p-6">
      <CookieConsent
        location="none"
        buttonText="J'autorise les cookies"
        cookieName="tuulo_cookie_consent"
        disableStyles={true}
        containerClasses="bg-blue-900 border border-white text-white px-10 py-6 rounded-md shadow-lg z-50 max-w-lg text-center"
        buttonClasses="bg-red-400 text-white px-4 py-2 rounded hover:bg-white hover:text-red-400 transition mt-4"
        expires={150}
        onAccept={() => setShowBanner(false)}
      >
        <Image
          src="/cookie.png"
          alt="Cookie"
          width={100}
          height={100}
          className="mb-4 mx-auto"
        />
        <div className="text-lg space-y-3">
          <p>
            Ce site utilise des cookies pour améliorer votre expérience
            utilisateur.
          </p>
          <p>
            Les cookies servent uniquement à des fins essentielles, comme la
            navigation et la sécurité.
          </p>
          <Link
            href="/legal"
            className="satisfy text-2xl my-6 underline hover:text-indigo-400"
          >
            Chez <strong>Tuulo</strong>, nous attachons une grande importance à
            la vie privée de nos utilisateurs.
          </Link>
        </div>
      </CookieConsent>
    </div>
  );
}
