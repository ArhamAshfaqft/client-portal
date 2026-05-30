import { useAuth } from "@/lib/auth-context";
import { can, canAny, canAll, ALL_PERMISSIONS, type Permission } from "@/lib/permissions";

export function usePermissions() {
  const { profile } = useAuth();
  const raw = (profile?.permissions ?? []) as Permission[];
  const permissions: Permission[] =
    profile?.role === "owner" && raw.length === 0
      ? (ALL_PERMISSIONS.map((p) => p.key) as Permission[])
      : raw;

  return {
    can: (permission: Permission) => can(permissions, permission),
    canAny: (required: Permission[]) => canAny(permissions, required),
    canAll: (required: Permission[]) => canAll(permissions, required),
    permissions,
    role: profile?.role,
    position: profile?.position,
  };
}
