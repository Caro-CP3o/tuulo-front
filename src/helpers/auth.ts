import { UserType } from "@/types/api";

export function hasRole(user: UserType, role: string) {
  return user.roles.includes(role);
}

// usage :if (hasRole(user, "ROLE_FAMILY_ADMIN")) {
  // show admin feature