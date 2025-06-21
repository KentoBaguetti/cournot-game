import { io, Socket } from "socket.io-client";
import axios from "axios";
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
    let isMounted = true;

    const fetchTokenData = async () => {
      const response = await axios.get("http://localhost:3001/auth/token", {
        withCredentials: true,
      });
      const token = response.data.token;
      return token;
    };

    const initializeSocket = async () => {
      try {
        const token = await fetchTokenData();
        if (!isMounted) return;

        const socket = io("http://localhost:3001", {
          auth: {
            token: token,
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
      } catch (error) {
        console.error(`Failed to fetch token or initialize socket: ${error}`);
      }
    };

    initializeSocket();

    return () => {
      isMounted = false;
    };
  }, []);

  return React.createElement(
    SocketContext.Provider,
    { value: socketInstance },
    children
  );
};
