import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ---------------------------
// Footer component
// ---------------------------
export default function Footer() {
  return (
    <footer className="w-full bg-blue-900 text-white py-10 z-[9988]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b-3 border-red-400/30 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* 1. Logo */}
          <div className="flex flex-col items-center md:items-start space-y-4 text-center md:text-left">
            <Image
              src="/tuulo_logo_blue.png"
              alt="Tuulo Logo"
              width={150}
              height={60}
            />
            <p className="text-sm max-w-xs">
              « L&apos;esprit d&apos;un village.
              <br /> La puissance d&apos;un logiciel. »
            </p>
          </div>

          {/* 2. Navigation */}
          <nav className="flex flex-col space-y-2">
            <h3 className="font-semibold mb-3 text-white">Navigation</h3>
            <a href="#" className="hover:text-white transition">
              Features
            </a>
            <a href="#" className="hover:text-white transition">
              Pricing
            </a>
            <a href="#" className="hover:text-white transition">
              Integrations
            </a>
            <a href="#" className="hover:text-white transition">
              API
            </a>
          </nav>

          {/* 3. À propos */}
          <nav className="flex flex-col space-y-2">
            <h3 className="font-semibold mb-3 text-white">À propos</h3>
            <a href="#" className="hover:text-white transition">
              À propos de nous
            </a>
            <a href="#" className="hover:text-white transition">
              Carrières
            </a>
            <a href="#" className="hover:text-white transition">
              Blog
            </a>
            <a href="#" className="hover:text-white transition">
              Contact
            </a>
          </nav>

          {/* 4. Social + Newsletter */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-semibold mb-3 text-white">
              Restons connectés !
            </h3>
            <div className="flex flex-wrap space-x-4 text-gray-400">
              <a
                href="#"
                aria-label="Facebook"
                className="hover:text-white transition"
              >
                <Facebook size={24} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="hover:text-white transition"
              >
                <Twitter size={24} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="hover:text-white transition"
              >
                <Instagram size={24} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="hover:text-white transition"
              >
                <Linkedin size={24} />
              </a>
            </div>
            <h3 className="font-semibold text-white">
              Abonnez-vous à notre newsletter
            </h3>
            <form className="flex flex-col sm:flex-row sm:items-center gap-2 max-w-xs flex-wrap">
              <input
                type="email"
                placeholder="Votre e-mail"
                className="flex-grow rounded-xl border border-white bg-white px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black max-w-full"
              />
              <button
                type="submit"
                className="bg-red-400 hover:bg-white hover:text-red-400 rounded-xl px-4 py-2 text-white font-semibold transition"
              >
                S&apos;abonner
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-between items-center max-w-7xl mx-auto mt-3 text-sm px-4">
        <span className="text-white">© 2025 Tuulo. Tous droits réservés.</span>
        <span className="text-white">
          <Link href="/legal" className="hover:text-red-400/50">
            Mentions légales - Politique de confidentialité - RGPD
          </Link>
        </span>
      </div>
    </footer>
  );
}
