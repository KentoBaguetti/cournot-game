import axios from "axios";
import config from "../config";

// Check if cookies are supported
export const areCookiesEnabled = (): boolean => {
  try {
    document.cookie = "cookietest=1";
    const result = document.cookie.indexOf("cookietest=") !== -1;
    document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
    return result;
  } catch {
    return false;
  }
};

// Get token from either cookie (via API) or localStorage
export const getToken = async (): Promise<string | null> => {
  try {
    // First try to get token from the API (which uses cookies)
    const response = await axios.get(`${config.apiUrl}/auth/token`, {
      withCredentials: true,
    });

    if (response.data.success && response.data.token) {
      // If we got token from API, also store in localStorage as backup
      localStorage.setItem("auth_token", response.data.token);
      return response.data.token;
    }
  } catch {
    console.log("Could not get token from cookie, trying localStorage");
  }

  // Fallback to localStorage
  return localStorage.getItem("auth_token");
};

// Save token to localStorage (as backup)
export const saveToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

// Clear token from localStorage
export const clearToken = (): void => {
  localStorage.removeItem("auth_token");
};

// Add token to axios request headers for APIs that don't support cookies
export const addTokenToRequest = async (requestConfig: {
  headers?: Record<string, string>;
}) => {
  const token = await getToken();
  if (token) {
    requestConfig.headers = {
      ...requestConfig.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return requestConfig;
};
