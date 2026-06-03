export const Permissions = {
  SITES_VIEW: "sites.view",
  SITES_CREATE: "sites.create",
  SITES_DELETE: "sites.delete",

  FEEDBACK_VIEW_ALL: "feedback.view_all",
  FEEDBACK_VIEW_ASSIGNED: "feedback.view_assigned",
  FEEDBACK_ASSIGN: "feedback.assign",
  FEEDBACK_RESOLVE: "feedback.resolve",
  FEEDBACK_DELETE: "feedback.delete",

  TEAM_VIEW: "team.view",
  TEAM_INVITE: "team.invite",
  TEAM_REMOVE: "team.remove",

  SETTINGS_VIEW: "settings.view",
  SETTINGS_EDIT: "settings.edit",

  REPORTS_VIEW_ALL: "reports.view_all",
  REPORTS_CREATE: "reports.create",

  PROJECTS_CREATE: "projects.create",
  PROJECTS_DELETE: "projects.delete",

  CONNECTOR_VIEW: "connector.view",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

export type PositionType = "manager" | "developer" | "designer" | "custom";

export const POSITIONS: {
  value: PositionType;
  label: string;
  description: string;
  defaultPermissions: Permission[];
}[] = [
  {
    value: "manager",
    label: "Manager",
    description: "Oversees projects, assigns feedback, manages team",
    defaultPermissions: [
      Permissions.SITES_VIEW,
      Permissions.SITES_CREATE,
      Permissions.SITES_DELETE,
      Permissions.FEEDBACK_VIEW_ALL,
      Permissions.FEEDBACK_ASSIGN,
      Permissions.FEEDBACK_RESOLVE,
      Permissions.FEEDBACK_DELETE,
      Permissions.TEAM_VIEW,
      Permissions.PROJECTS_CREATE,
      Permissions.PROJECTS_DELETE,
      Permissions.REPORTS_VIEW_ALL,
      Permissions.REPORTS_CREATE,
      Permissions.SETTINGS_VIEW,
    ],
  },
  {
    value: "developer",
    label: "Developer",
    description: "Builds sites, resolves feedback, logs hours",
    defaultPermissions: [
      Permissions.SITES_VIEW,
      Permissions.FEEDBACK_VIEW_ASSIGNED,
      Permissions.FEEDBACK_RESOLVE,
      Permissions.REPORTS_CREATE,
      Permissions.TEAM_VIEW,
      Permissions.SETTINGS_VIEW,
    ],
  },
  {
    value: "designer",
    label: "Designer",
    description: "Creates designs, reviews visual feedback",
    defaultPermissions: [
      Permissions.SITES_VIEW,
      Permissions.FEEDBACK_VIEW_ASSIGNED,
      Permissions.FEEDBACK_RESOLVE,
      Permissions.REPORTS_CREATE,
      Permissions.TEAM_VIEW,
      Permissions.SETTINGS_VIEW,
    ],
  },
  {
    value: "custom",
    label: "Custom",
    description: "Define individual permissions",
    defaultPermissions: [],
  },
];

export const ALL_PERMISSIONS: { key: Permission; label: string; group: string }[] = [
  { key: Permissions.SITES_VIEW, label: "View sites", group: "Sites" },
  { key: Permissions.SITES_CREATE, label: "Add new sites", group: "Sites" },
  { key: Permissions.SITES_DELETE, label: "Delete sites", group: "Sites" },
  { key: Permissions.FEEDBACK_VIEW_ALL, label: "View all feedback", group: "Feedback" },
  { key: Permissions.FEEDBACK_VIEW_ASSIGNED, label: "View assigned feedback only", group: "Feedback" },
  { key: Permissions.FEEDBACK_ASSIGN, label: "Assign feedback to team", group: "Feedback" },
  { key: Permissions.FEEDBACK_RESOLVE, label: "Resolve feedback", group: "Feedback" },
  { key: Permissions.FEEDBACK_DELETE, label: "Delete feedback", group: "Feedback" },
  { key: Permissions.TEAM_VIEW, label: "View team", group: "Team" },
  { key: Permissions.TEAM_INVITE, label: "Invite members", group: "Team" },
  { key: Permissions.TEAM_REMOVE, label: "Remove members", group: "Team" },
  { key: Permissions.PROJECTS_CREATE, label: "Create projects", group: "Projects" },
  { key: Permissions.PROJECTS_DELETE, label: "Delete projects", group: "Projects" },
  { key: Permissions.REPORTS_VIEW_ALL, label: "View all reports", group: "Reports" },
  { key: Permissions.REPORTS_CREATE, label: "Submit reports", group: "Reports" },
  { key: Permissions.SETTINGS_VIEW, label: "View settings", group: "Settings" },
  { key: Permissions.SETTINGS_EDIT, label: "Edit settings", group: "Settings" },
  { key: Permissions.CONNECTOR_VIEW, label: "View connector token", group: "Sites" },
];

const OWNER_PERMISSIONS: string[] = ALL_PERMISSIONS.map((p) => p.key);

export function getDefaultPermissions(role: string, position?: string): string[] {
  if (role === "owner") return OWNER_PERMISSIONS;
  const pos = POSITIONS.find((p) => p.value === position);
  return pos?.defaultPermissions || POSITIONS.find((p) => p.value === "developer")!.defaultPermissions;
}

export function can(permissions: string[] | undefined | null, permission: Permission): boolean {
  if (!permissions) return false;
  return permissions.includes(permission);
}

export function canAny(permissions: string[] | undefined | null, required: Permission[]): boolean {
  if (!permissions) return false;
  return required.some((p) => permissions.includes(p));
}

export function canAll(permissions: string[] | undefined | null, required: Permission[]): boolean {
  if (!permissions) return false;
  return required.every((p) => permissions.includes(p));
}
