import { useAuth } from "@/lib/auth-context";
import { can, canAny, canAll, type Permission } from "@/lib/permissions";

export function usePermissions() {
  const { profile } = useAuth();
  const permissions = (profile?.permissions ?? []) as Permission[];

  return {
    can: (permission: Permission) => can(permissions, permission),
    canAny: (required: Permission[]) => canAny(permissions, required),
    canAll: (required: Permission[]) => canAll(permissions, required),
    permissions,
    role: profile?.role,
    position: profile?.position,
  };
}
