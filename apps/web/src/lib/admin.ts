import type { AdminCatalogFilter, UserRole } from "@coasterly/types";

export const defaultAdminCatalogPage = 1;
export const adminCatalogPageSize = 12;
export const defaultAdminFilter: AdminCatalogFilter = "all";

export const adminRoles = new Set<UserRole>([
  "admin",
  "moderator",
  "regional_editor",
  "global_editor",
  "admin",
  "super_admin"
]);

export const isAdminRole = (role: UserRole) => adminRoles.has(role);
