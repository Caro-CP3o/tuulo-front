"use client";

import React from "react";
import clsx from "clsx";

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

export default function Button({
  type = "button",
  children,
  loading = false,
  disabled = false,
  className = "",
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={clsx(
        "bg-blue-900 text-white px-4 py-2 rounded hover:bg-red-400  disabled:opacity-50 transition-all",
        className
      )}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
