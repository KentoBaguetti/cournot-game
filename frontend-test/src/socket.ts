import { io, Socket } from "socket.io-client";
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";

export const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    const socket = io("http://localhost:3001", {
      auth: {
        token: token || null,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;
    setSocketInstance(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  return React.createElement(
    SocketContext.Provider,
    { value: socketInstance },
    children
  );
};
