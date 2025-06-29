"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchUsedFamilyColors, registerUser } from "@/lib/api";
import ColorPicker from "../atoms/ColorPicker";
import AvatarPicker from "../atoms/AvatarPicker";
import PasswordField from "../molecules/PasswordField";

// Function to debounce email inout
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
// Check if email already exists
async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }/api/users/check-email?email=${encodeURIComponent(email)}`
    );
    if (!res.ok) return false;
    const data = await res.json();
    return data.exists;
  } catch {
    return false;
  }
}

export default function RegisterForm() {
  // ---------------------------
  // State variables
  // ---------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthDateTouched, setBirthDateTouched] = useState(false);
  const [color, setColor] = useState("");
  const [alias, setAlias] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [usedColors, setUsedColors] = useState<string[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();

  // ---------------------------
  // Effect set invitation code from query param
  // ---------------------------
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) setInvitationCode(code);
  }, [searchParams]);

  // ---------------------------
  // Effect load used colors
  // ---------------------------
  useEffect(() => {
    if (!invitationCode) return;
    fetchUsedFamilyColors(invitationCode)
      .then((colors) => {
        console.log("Fetched colors:", colors);
        setUsedColors(colors);
      })
      .catch((err) => {
        console.error("Failed to load used family colors:", err);
        setUsedColors([]);
      });
  }, [invitationCode]);

  // ---------------------------
  // Form validation before submission
  // ---------------------------
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) newErrors.email = "L'e-mail est requis.";
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) newErrors.email = "Adresse e-mail invalide.";
    }

    if (!password) newErrors.password = "Le mot de passe est requis.";
    else {
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecial = /[^\w\s]/.test(password);
      if (
        password.length < 8 ||
        !hasUpper ||
        !hasLower ||
        !hasNumber ||
        !hasSpecial
      ) {
        newErrors.password =
          "Mot de passe invalide. Il doit contenir 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial et au moins 8 caractères.";
      }
    }

    if (!firstName.trim()) newErrors.firstName = "Le prénom est requis.";
    if (!lastName.trim()) newErrors.lastName = "Le nom est requis.";
    if (!color || color.trim() === "")
      newErrors.color = "Une couleur est requise.";

    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() >= birth.getDate());

    const isOldEnough = age > 13 || (age === 13 && hasBirthdayPassed);
    if (!birthDate) newErrors.birthDate = "La date de naissance est requise.";
    else if (!isOldEnough)
      newErrors.birthDate = "Vous devez avoir au moins 13 ans.";

    return newErrors;
  };

  // Debounced check email
  const debouncedCheckEmail = useCallback((emailToCheck: string) => {
    const checkEmail = async () => {
      if (!emailToCheck) return;
      const exists = await checkEmailExists(emailToCheck);
      setErrors((prev) => ({
        ...prev,
        email: exists
          ? "Cette adresse e-mail est déjà utilisée. Si vous êtes déjà enregistré, veuillez vous connecter."
          : "",
      }));
    };
    return debounce(checkEmail, 600)();
  }, []);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && emailRegex.test(email)) {
      debouncedCheckEmail(email);
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  }, [email, debouncedCheckEmail]);

  // Age validation
  useEffect(() => {
    if (!birthDate) {
      setErrors((prev) => ({
        ...prev,
        birthDate: "La date de naissance est requise.",
      }));
      return;
    }
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() >= birth.getDate());

    const isOldEnough = age > 13 || (age === 13 && hasBirthdayPassed);

    setErrors((prev) => ({
      ...prev,
      birthDate: isOldEnough ? "" : "Vous devez avoir au moins 13 ans.",
    }));
  }, [birthDate]);

  const isFormValid =
    !loading &&
    email.trim() !== "" &&
    password !== "" &&
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    birthDate !== "" &&
    color.trim() !== "" &&
    Object.values(errors).every((errMsg) => !errMsg);

  // ---------------------------
  // Form submission
  // ---------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const syncErrors = validateForm();
    if (Object.keys(syncErrors).length > 0) {
      setErrors(syncErrors);
      return;
    }

    if (Object.values(errors).some((errMsg) => errMsg)) {
      return;
    }

    setLoading(true);

    // Prepare form data
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("birthDate", birthDate);
    formData.append("color", color);
    if (alias) formData.append("alias", alias);
    if (avatar) formData.append("avatar", avatar);
    if (invitationCode) formData.append("invitationCode", invitationCode);

    try {
      const result = await registerUser(formData);

      // Check Symfony constrains violations
      if (result.error) {
        if (typeof result.error === "string") {
          setErrors({ general: result.error });
        } else if (result.error.errors) {
          setErrors(result.error.errors);
        } else if (result.error.violations) {
          const newErrors: { [key: string]: string } = {};
          for (const violation of result.error.violations) {
            newErrors[violation.propertyPath] = violation.message;
          }
          setErrors(newErrors);
        } else {
          setErrors({ general: JSON.stringify(result.error) });
        }
      } else {
        sessionStorage.setItem("justRegistered", "true");
        console.log(sessionStorage.getItem("justRegistered"));
        router.push("/registration-success");
      }
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue ! Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex md:flex-row flex-col bg-white p-4 rounded-2xl w-full shadow-lg gap-6 max-w-6xl text-left"
      noValidate
    >
      <div className="space-y-4 w-full">
        <label htmlFor="email">
          Votre adresse e-mail : <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-gray-300">
          ( Attention ce champ ne pourra être changé ultérieurement ! )
        </p>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Email"
          className={`w-full p-2 border rounded-xl ${
            errors.email ? "border-red-500" : ""
          }`}
          aria-describedby="email-error"
        />
        {errors.email && (
          <p
            id="email-error"
            className="text-red-500 text-xs mt-1"
            role="alert"
          >
            {errors.email}
          </p>
        )}

        <PasswordField
          password={password}
          setPassword={setPassword}
          error={errors.password}
        />

        <label htmlFor="firstName">
          Votre prénom <span className="text-red-400">*</span>
        </label>
        <input
          id="firstName"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          placeholder="Prénom"
          className={`w-full p-2 border rounded-xl ${
            errors.firstName ? "border-red-500" : ""
          }`}
          aria-describedby="firstName-error"
        />
        {errors.firstName && (
          <p
            id="firstName-error"
            className="text-red-500 text-xs mt-1"
            role="alert"
          >
            {errors.firstName}
          </p>
        )}

        <label htmlFor="lastName">
          Votre nom <span className="text-red-400">*</span>
        </label>
        <input
          id="lastName"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          placeholder="Nom"
          className={`w-full p-2 border rounded-xl ${
            errors.lastName ? "border-red-500" : ""
          }`}
          aria-describedby="lastName-error"
        />
        {errors.lastName && (
          <p
            id="lastName-error"
            className="text-red-500 text-xs mt-1"
            role="alert"
          >
            {errors.lastName}
          </p>
        )}

        <label htmlFor="birthDate">
          Votre date de naissance <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-gray-300">
          ( Attention ce champ ne pourra être changé ultérieurement ! )
        </p>
        <input
          id="birthDate"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          onBlur={() => setBirthDateTouched(true)}
          required
          className={`w-full p-2 border rounded-xl ${
            birthDateTouched && errors.birthDate ? "border-red-400" : ""
          }`}
          aria-describedby="birthDate-error"
        />
        {birthDateTouched && errors.birthDate && (
          <p
            id="birthDate-error"
            className="text-red-500 text-xs mt-1"
            role="alert"
          >
            {errors.birthDate}
          </p>
        )}

        <span className="text-red-400 text-xs">
          * Les champs marqués d&apos;une astérisque sont obligatoires
        </span>
      </div>
      <div className="space-y-4 w-full">
        <AvatarPicker avatar={avatar} setAvatar={setAvatar} />
        <ColorPicker
          color={color}
          setColor={setColor}
          usedColors={usedColors}
        />
        {errors.color && (
          <p className="text-red-500 text-xs mt-1" role="alert">
            {errors.color}
          </p>
        )}
        <p className="mt-2 text-sm text-gray-600">
          Couleur sélectionnée : {color}
        </p>
        <label htmlFor="alias">Choisissez un alias (optionnel) :</label>
        <input
          id="alias"
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="Alias"
          className="w-full p-2 border rounded-xl"
        />

        <label htmlFor="invitationCode">
          Code d&apos;invitation (optionnel) :
        </label>
        <input
          id="invitationCode"
          type="text"
          value={invitationCode}
          onChange={(e) => setInvitationCode(e.target.value)}
          placeholder="Code d'invitation"
          className="w-full p-2 border rounded-xl"
        />

        {errors.general && (
          <p className="text-red-400 text-sm my-2" role="alert">
            {errors.general}
          </p>
        )}

        <button
          type="submit"
          disabled={!isFormValid}
          className={`rounded-xl bg-blue-900 text-white py-2 px-6 hover:bg-red-400/50 transition-colors w-full ${
            !isFormValid ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Enregistrement..." : "Créer mon compte"}
        </button>
      </div>
    </form>
  );
}
