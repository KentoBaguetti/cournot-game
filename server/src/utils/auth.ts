import * as dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

const generateUniqueId = (): string => {
  let res = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 16; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
};

const generateJwtToken = (userId: string) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  const token = jwt.sign({ userId: userId }, jwtSecret, {
    expiresIn: "1h",
  });
  return token;
};

export { generateUniqueId, generateJwtToken };
