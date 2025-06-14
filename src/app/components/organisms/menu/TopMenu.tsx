"use client";

import Link from "next/link";
import Image from "next/image";
import LoginComponent from "../../atoms/LoginComponent";

export default function TopMenu() {
  return (
    <header className="relative bg-white shadow-md flex justify-center items-center">
      <Link href="/home" className="">
        <Image
          src="/tuulo_logo.png"
          alt="Tuulo Logo"
          width={150}
          height={60}
          className="h-auto"
        />
      </Link>

      <div className="">
        <LoginComponent />
      </div>
    </header>
  );
}
