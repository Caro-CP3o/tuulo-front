"use client";

import Link from "next/link";
import { UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api";
import { hasRole } from "@/helpers/auth";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginComponent() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      await refresh(); // update context after logout
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) return null; // or a spinner

  return (
    <div className="flex items-center space-x-2">
      <UserCircle size={24} />
      {user && hasRole(user, "ROLE_USER") ? (
        <button
          onClick={handleLogout}
          className="text-sm font-medium hover:text-red-400 transition-colors"
        >
          Logout
        </button>
      ) : (
        <Link
          href="/login"
          className="text-sm font-medium hover:text-red-400 transition-colors"
        >
          Login
        </Link>
      )}
    </div>
  );
}

// "use client";

// import Link from "next/link";
// import { UserCircle } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { fetchMe, logout } from "@/lib/api";
// import { hasRole } from "@/helpers/auth";
// import { UserType } from "@/types/api";

// export default function LoginComponent() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [user, setUser] = useState<UserType | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     async function checkAuth() {
//       try {
//         await fetchMe();
//         const currentUser = await fetchMe();
//         setUser(currentUser);

//         if (!hasRole(currentUser, "ROLE_USER")) return;
//         setIsLoggedIn(true);
//       } catch (err) {
//         console.error("User not authenticated:", err);
//         setIsLoggedIn(false);
//       }
//     }

//     checkAuth();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await logout(); // use the shared API function
//       setIsLoggedIn(false);
//       router.push("/login");
//     } catch (err) {
//       console.error("Logout error:", err);
//     }
//   };
//   return (
//     <div className="flex items-center space-x-2">
//       <UserCircle size={24} />
//       {isLoggedIn ? (
//         <button
//           onClick={handleLogout}
//           className="text-sm font-medium hover:text-red-400 transition-colors"
//         >
//           Logout
//         </button>
//       ) : (
//         <Link
//           href="/login"
//           className="text-sm font-medium hover:text-red-400 transition-colors"
//         >
//           Login
//         </Link>
//       )}
//     </div>
//   );
// }
