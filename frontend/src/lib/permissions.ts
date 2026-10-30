import type { AuthUser } from './api';

export const Permission = {
  MANAGE_USERS:     'MANAGE_USERS',
  MANAGE_ROLES:     'MANAGE_ROLES',
  CREATE_PAGE:      'CREATE_PAGE',
  EDIT_PAGE:        'EDIT_PAGE',
  DELETE_PAGE:      'DELETE_PAGE',
  PREVIEW_PAGE:     'PREVIEW_PAGE',
  EXPORT_PAGE:      'EXPORT_PAGE',
  MANAGE_CAMPAIGNS: 'MANAGE_CAMPAIGNS',
  DELETE_CAMPAIGN:  'DELETE_CAMPAIGN',
  VIEW_LEADS:       'VIEW_LEADS',
} as const;

export type PermissionKey = (typeof Permission)[keyof typeof Permission];

export const ROLE_LABELS: Record<string, string> = {
  ADMIN:       'Administrateur',
};

export const PERMISSION_LABELS: Record<string, string> = {
  MANAGE_USERS:     'Gérer les utilisateurs',
  MANAGE_ROLES:     'Gérer les rôles',
  CREATE_PAGE:      'Créer une landing page',
  EDIT_PAGE:        'Modifier une landing page',
  DELETE_PAGE:      'Supprimer une landing page',
  PREVIEW_PAGE:     'Prévisualiser une landing page',
  EXPORT_PAGE:      'Exporter une landing page',
  MANAGE_CAMPAIGNS: 'Gérer les campagnes',
  DELETE_CAMPAIGN:  'Supprimer une campagne',
  VIEW_LEADS:       'Consulter les leads',
};

export const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  ADMIN: Object.values(Permission),
};

export function hasPermission(user: AuthUser | null, _permission: PermissionKey): boolean {
  if (!user) return false;
  return true;
}

export function canAccessStudio(user: AuthUser | null): boolean {
  if (!user) return false;
  return true;
}
