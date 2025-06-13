import { io, Socket } from "socket.io-client";
import React, { createContext, useContext } from "react";

const socket = io("http://localhost:3001", {
  auth: {
    token: localStorage.getItem("jwt") || null,
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
