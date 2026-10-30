import { apiRequest } from './api';

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  isProtected: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type CreateUserPayload = {
  fullName: string;
  email: string;
  password: string;
  role?: string;
};

export type ResetPasswordPayload = {
  password: string;
};

export async function listUsersRequest() {
  return apiRequest<AdminUser[]>('/api/users');
}

export async function createUserRequest(payload: CreateUserPayload) {
  return apiRequest<AdminUser>('/api/users', { method: 'POST', body: payload });
}

export async function updateUserRoleRequest(id: string, role: string) {
  return apiRequest<AdminUser>(`/api/users/${id}/role`, {
    method: 'PATCH',
    body: { role },
  });
}

export async function toggleUserActiveRequest(id: string) {
  return apiRequest<AdminUser>(`/api/users/${id}/toggle-active`, {
    method: 'PATCH',
  });
}

export async function resetUserPasswordRequest(id: string, payload: ResetPasswordPayload) {
  return apiRequest<AdminUser>(`/api/users/${id}/reset-password`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteUserRequest(id: string) {
  return apiRequest<null>(`/api/users/${id}`, { method: 'DELETE' });
}
