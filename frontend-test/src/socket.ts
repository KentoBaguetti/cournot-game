import { io, Socket } from "socket.io-client";
import React, { createContext, useContext } from "react";

const generateUniqueId = (): string => {
  let res = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 16; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
};

// check if userId exists
let userId = localStorage.getItem("userId");
if (!userId) {
  userId = generateUniqueId();
  localStorage.setItem("userId", userId);
}

const socket = io("http://localhost:3001", {
  auth: {
    userId,
  },
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

export const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => React.createElement(SocketContext.Provider, { value: socket }, children);
