import { jwtDecode } from "jwt-decode";
import axios from "axios";

// GLOBAL VARS
const baseUrl = import.meta.env.VITE_API_URL;

// modiify this later to verify if the user is a host or not
interface UserTokenData {
  userId: string;
  username: string;
  roomId?: string;
}

const getToken = (): string | null => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="))
    ?.split("=")[1];

  if (!token) {
    console.log(`No token "auth_token" found`);
    return null;
  }

  return token;
};

const parseJWT = (token: string): UserTokenData | null => {
  const decoded = jwtDecode(token) as UserTokenData;
  return decoded;
};

const authenticateToken = async () => {
  const token = getToken();
  if (!token) {
    return false;
  }

  const decoded = parseJWT(token);
  if (!decoded) {
    return false;
  }

  try {
    const response = await axios.get(`${baseUrl}/auth/me`);
    const resData = response.data;
    const authenticated = resData.authenticated;
    const userData = resData.user;

    if (!authenticated) {
      return false;
    }

    return userData;
  } catch (error) {
    console.error("Error during authentication:", error);
    return false;
  }
};

export { authenticateToken };
