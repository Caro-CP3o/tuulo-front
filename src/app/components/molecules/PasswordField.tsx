import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // optional icon library

// ---------------------------
// Password validation component
// ---------------------------
export default function PasswordField({
  password,
  setPassword,
}: {
  password: string;
  setPassword: (value: string) => void;
  error?: string;
}) {
  // ---------------------------
  // State variables
  // ---------------------------
  const [showPassword, setShowPassword] = useState(false);
  const [strengthMsg, setStrengthMsg] = useState<string>("");

  const validatePassword = (value: string) => {
    setPassword(value);
    // Password regex
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[^\w\s]/.test(value);
    const isLongEnough = value.length >= 8;

    if (!value) {
      setStrengthMsg("");
    } else if (
      isLongEnough &&
      hasUpper &&
      hasLower &&
      hasNumber &&
      hasSpecial
    ) {
      setStrengthMsg("Mot de passe fort ✅");
    } else {
      setStrengthMsg(
        "Doit contenir au minimum : 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial (min. 8 caractères)"
      );
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor="password" className="block mb-1">
        Choisissez votre mot de passe : <span className="text-red-400">*</span>
      </label>{" "}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          value={password}
          onChange={(e) => validatePassword(e.target.value)}
          required
          minLength={8}
          className="w-full p-2 border rounded-xl pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {strengthMsg && (
        <p
          className={`text-sm mt-1 ${
            strengthMsg.includes("fort") ? "text-green-600" : "text-red-600"
          }`}
        >
          {strengthMsg}
        </p>
      )}
    </div>
  );
}
