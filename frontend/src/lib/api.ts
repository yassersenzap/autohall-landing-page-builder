import { clearAccessToken, getAccessToken } from './auth-storage';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message: string;
};

export type ApiErrorBody = {
  success?: boolean;
  message?: string;
  code?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(status: number, message: string, body: ApiErrorBody | null = null) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiSuccessResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.auth !== false) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiSuccessResponse<T>
    | ApiErrorBody
    | null;

  if (!response.ok) {
    const message =
      (payload && 'message' in payload && payload.message) ||
      `Request failed with status ${response.status}`;

    throw new ApiError(response.status, message, payload as ApiErrorBody);
  }

  return payload as ApiSuccessResponse<T>;
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive?: boolean;
};

export type LoginData = {
  accessToken: string;
  user: AuthUser;
};

export async function loginRequest(payload: LoginPayload) {
  return apiRequest<LoginData>('/api/auth/login', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

export async function logoutRequest() {
  return apiRequest<null>('/api/auth/logout', {
    method: 'POST',
    auth: false,
  });
}

export async function meRequest() {
  return apiRequest<AuthUser>('/api/auth/me');
}

export function logoutClient(): void {
  clearAccessToken();
}
