import { useAuth } from "@/lib/auth-context";
import { can, canAny, canAll, ALL_PERMISSIONS, type Permission } from "@/lib/permissions";

const ALL_KEYS = ALL_PERMISSIONS.map((p) => p.key) as Permission[];

export function usePermissions() {
  const { profile } = useAuth();

  // Profile not loaded yet — grant all to prevent UI hiding
  if (!profile) {
    return {
      can: () => true,
      canAny: () => true,
      canAll: () => true,
      permissions: ALL_KEYS,
      role: undefined,
      position: undefined,
    };
  }

  const raw = (profile.permissions ?? []) as Permission[];
  const permissions: Permission[] =
    profile.role === "owner" && raw.length === 0 ? ALL_KEYS : raw;

  return {
    can: (permission: Permission) => can(permissions, permission),
    canAny: (required: Permission[]) => canAny(permissions, required),
    canAll: (required: Permission[]) => canAll(permissions, required),
    permissions,
    role: profile.role,
    position: profile.position,
  };
}
