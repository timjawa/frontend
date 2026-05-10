import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.101:8000",
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Get CSRF cookie from Laravel Sanctum.
 * Must be called before login/register requests.
 */
export async function getCsrfCookie(): Promise<void> {
  await api.get("/sanctum/csrf-cookie");
}

/**
 * Login with email and password.
 */
export async function login(email: string, password: string) {
  await getCsrfCookie();
  const response = await api.post("/api/login", { email, password });
  return response.data;
}

/**
 * Register a new user.
 */
export async function register(
  name: string,
  email: string,
  password: string,
  password_confirmation: string
) {
  await getCsrfCookie();
  const response = await api.post("/api/register", {
    name,
    email,
    password,
    password_confirmation,
  });
  return response.data;
}

/**
 * Logout the current user.
 */
export async function logout() {
  const response = await api.post("/api/logout");
  return response.data;
}

/**
 * Get the authenticated user's data.
 */
export async function getUser() {
  const response = await api.get("/api/user");
  return response.data;
}

export default api;
