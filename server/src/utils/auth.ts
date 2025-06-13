import * as dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";

const generateJwtToken = (username: string) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  const token = jwt.sign({ username: username }, jwtSecret, {
    expiresIn: "1h",
  });
  return token;
};

const decodeJwtToken = (token: string) => {
  // @ts-ignore
  return jwtDecode(token);
};

export { generateJwtToken, decodeJwtToken };
