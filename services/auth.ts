import { apiFetch } from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logout(): Promise<void> {
  const token = localStorage.getItem('token');
  return apiFetch('/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getUser(): Promise<AuthResponse['user']> {
  const token = localStorage.getItem('token');
  return apiFetch('/auth/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
