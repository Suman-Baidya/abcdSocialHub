export type RoleType =
  | "DEVELOPER"
  | "SUPER_ADMIN"
  | "SUPER_ADMIN_STAFF"
  | "TENANT_ADMIN"
  | "ADMIN_STAFF"
  | "OWNER"
  | "STAFF"
  | "CREATOR"
  | "GUEST";

export type DashboardType = "SUPER_ADMIN" | "TENANT" | "CREATOR" | "GUEST";

export function resolveDashboardType(role?: string): DashboardType {
  switch (role) {
    case "DEVELOPER":
    case "SUPER_ADMIN":
    case "SUPER_ADMIN_STAFF":
      return "SUPER_ADMIN";
    case "CREATOR":
      return "CREATOR";
    case "GUEST":
      return "GUEST";
    case "TENANT_ADMIN":
    case "ADMIN_STAFF":
    case "OWNER":
    case "STAFF":
    default:
      return "TENANT";
  }
}
