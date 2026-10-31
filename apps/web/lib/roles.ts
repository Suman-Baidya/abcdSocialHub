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

export const ROLE_LABELS: Record<RoleType, string> = {
  DEVELOPER: "Developer (Hidden Root)",
  SUPER_ADMIN: "Super Admin (Platform Controller)",
  SUPER_ADMIN_STAFF: "Super Admin Staff (Delegated Ops)",
  TENANT_ADMIN: "Tenant Admin (Business Owner)",
  OWNER: "Tenant Admin (Business Owner)",
  ADMIN_STAFF: "Admin Staff (Teammate)",
  STAFF: "Admin Staff (Teammate)",
  CREATOR: "Content Creator (Creative Studio)",
  GUEST: "Guest (Client Observer)",
};

export const SIMULATION_ROLES: RoleType[] = [
  "DEVELOPER",
  "SUPER_ADMIN",
  "SUPER_ADMIN_STAFF",
  "TENANT_ADMIN",
  "ADMIN_STAFF",
  "CREATOR",
  "GUEST",
];

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

