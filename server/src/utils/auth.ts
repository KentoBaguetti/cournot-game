import * as dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import { Response, Request, NextFunction } from "express";

//////////////////////////////////////////////////////////////////
// vars and types
//////////////////////////////////////////////////////////////////

const getCookieOptions = () => {
  const prod = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
  } as const;
};

interface UserTokenData {
  userId: string;
  username: string;
  roomId?: string;
  isHost?: boolean; // TODO:will not be used until the db is implemented
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
  res.cookie("auth_token", token, getCookieOptions());

  return token;
};

/**
 * Update the room information in the JWT token
 */
const updateTokenRoom = (
  req: Request,
  res: Response,
  roomId: string | undefined
) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return null;
  }

  const userData = verifyJwtToken(token);
  if (!userData || userData instanceof Error) {
    return null;
  }

  // Update the room information
  const updatedUserData: UserTokenData = {
    ...userData,
    roomId,
  };

  // Set the updated token as a cookie
  return setTokenCookie(res, updatedUserData);
};

const clearTokenCookie = (res: Response) => {
  res.clearCookie("auth_token", getCookieOptions());
};

// Helper to get auth token from either cookie or Authorization header (Bearer scheme)
const getTokenFromRequest = (req: Request): string | undefined => {
  // Prefer cookie (maintains existing behaviour)
  if (req.cookies && req.cookies.auth_token) {
    return req.cookies.auth_token;
  }

  // Fallback to Authorization header: "Bearer <token>"
  const authHeader = (req.headers["authorization"] ||
    req.headers["Authorization"]) as string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return undefined;
};

// express middleware to check if the user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res
      .status(401)
      .json({ authenticated: false, error: "No token found" });
  }

  const decodedToken = verifyJwtToken(token);
  if (!decodedToken || decodedToken instanceof Error) {
    return res
      .status(401)
      .json({ authenticated: false, error: "Invalid token" });
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("token found user verified");
  }

  next();
};

export {
  generateJwtToken,
  decodeJwtToken,
  verifyJwtToken,
  setTokenCookie,
  updateTokenRoom,
  clearTokenCookie,
  UserTokenData,
  isAuthenticated,
  getTokenFromRequest,
};
