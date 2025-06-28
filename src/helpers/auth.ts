import { UserType } from "@/types/api";

// ---------------------------
// Check user's role helper
// ---------------------------
export function hasRole(user: UserType, role: string) {
  if (!user.roles) {
    console.warn("Invalid roles value, expected array:", user.roles);
    return false;
  }
  const rolesArray = Array.isArray(user.roles) 
    ? user.roles 
    : Object.values(user.roles);

  return rolesArray.includes(role);
}

export function hasRoleMinimal(user: { roles: string[] } | undefined, role: string) {
  if (!user?.roles) return false;
  return user.roles.includes(role);
}