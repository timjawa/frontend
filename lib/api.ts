import axios from "axios";

export const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Gunakan hostname yang sama dengan yang diakses di browser untuk menghindari masalah CORS/SameSite cookie
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.0.194:8000";
  return backendUrl.replace("0.0.0.0", "127.0.0.1");
};

export const getImageUrl = (path: string | undefined | null, defaultFolder = 'uploads/berita/'): string => {
  if (!path) return "https://placehold.co/800x600/e2e8f0/1e293b?text=Foto";
  if (path.startsWith("http")) return path;
  
  const baseUrl = getBaseUrl();
  if (path.includes("/")) {
    return `${baseUrl}/storage/${path.replace(/^\//, "")}`;
  }
  
  return `${baseUrl}/storage/${defaultFolder}${path}`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
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
