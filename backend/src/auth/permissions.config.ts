import { UserRole } from '@prisma/client';

export enum Permission {
  MANAGE_USERS      = 'MANAGE_USERS',
  MANAGE_ROLES      = 'MANAGE_ROLES',
  CREATE_PAGE       = 'CREATE_PAGE',
  EDIT_PAGE         = 'EDIT_PAGE',
  DELETE_PAGE       = 'DELETE_PAGE',
  PREVIEW_PAGE      = 'PREVIEW_PAGE',
  EXPORT_PAGE       = 'EXPORT_PAGE',
  MANAGE_CAMPAIGNS  = 'MANAGE_CAMPAIGNS',
  DELETE_CAMPAIGN   = 'DELETE_CAMPAIGN',
  VIEW_LEADS        = 'VIEW_LEADS',
}

const SI_DESIGNER_PERMS = new Set<Permission>([
  Permission.CREATE_PAGE,
  Permission.EDIT_PAGE,
  Permission.DELETE_PAGE,
  Permission.PREVIEW_PAGE,
  Permission.EXPORT_PAGE,
  Permission.MANAGE_CAMPAIGNS,
  Permission.DELETE_CAMPAIGN,
  Permission.VIEW_LEADS,
]);

const ADMIN_PERMS = new Set<Permission>([
  ...SI_DESIGNER_PERMS,
  Permission.MANAGE_USERS,
  Permission.MANAGE_ROLES,
]);

export const ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<Permission>> = {
  [UserRole.ADMIN]:       ADMIN_PERMS,
  [UserRole.SI_DESIGNER]: SI_DESIGNER_PERMS,
  [UserRole.SI_DIGITAL]:  SI_DESIGNER_PERMS,
  [UserRole.MARKETER]:    new Set([Permission.VIEW_LEADS, Permission.PREVIEW_PAGE]),
  [UserRole.VIEWER]:      new Set([Permission.PREVIEW_PAGE]),
};

export function getPermissionsForRole(role: UserRole): Permission[] {
  return Array.from(ROLE_PERMISSIONS[role] ?? new Set<Permission>());
}

export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return (ROLE_PERMISSIONS[role] as Set<Permission>)?.has(permission) ?? false;
}
