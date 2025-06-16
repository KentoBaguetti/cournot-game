import * as dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import { Response } from "express";

interface UserTokenData {
  userId: string;
  username: string;
  roomId: string;
}

// Default JWT secret to use if not provided in environment variables
const DEFAULT_JWT_SECRET = "default_jwt_secret_for_development_only";

const generateJwtToken = (userData: UserTokenData) => {
  const jwtSecret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  const token = jwt.sign(userData, jwtSecret, {
    expiresIn: "1h",
  });
  return token;
};

const decodeJwtToken = (token: string): UserTokenData | null => {
  try {
    // jwt-decode v4 usage
    return jwtDecode<UserTokenData>(token);
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

const verifyJwtToken = (token: string): UserTokenData | Error | null => {
  const jwtSecret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

  try {
    return jwt.verify(token, jwtSecret) as UserTokenData;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return error;
    }
    console.error("Error verifying JWT token:", error);
    return null;
  }
};

const setTokenCookie = (res: Response, userData: UserTokenData) => {
  const token = generateJwtToken(userData);

  // Set HTTP-only cookie that expires when the JWT expires
  res.cookie("auth_token", token, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production", // Only use secure in production
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 1000, // 1 hour in milliseconds (matching JWT expiry)
  });

  return token;
};

const clearTokenCookie = (res: Response) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    secure: true,
    sameSite: "none",
  });
};

export {
  generateJwtToken,
  decodeJwtToken,
  verifyJwtToken,
  setTokenCookie,
  clearTokenCookie,
  UserTokenData,
};
