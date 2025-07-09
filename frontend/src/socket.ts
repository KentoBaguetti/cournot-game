import { io, Socket } from "socket.io-client";
import axios from "axios";
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import config from "./config";

export const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const leaveGame = (socket: Socket | null, roomId: string) => {
  if (!socket) return;

  socket.emit("game:leave", { roomId });
  console.log(`Emitted game:leave for room ${roomId}`);
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTokenData = async (): Promise<string | null> => {
      try {
        // First try via cookie-based endpoint
        const response = await axios.get(`${config.apiUrl}/auth/token`, {
          withCredentials: true,
        });
        const token: string = response.data.token;

        // Store/update defaults for subsequent axios requests
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        return token;
      } catch (err) {
        console.warn("/auth/token failed – falling back to localStorage", err);

        const localToken = localStorage.getItem("auth_token");

        if (localToken) {
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${localToken}`;
        }

        return localToken;
      }
    };

    const initializeSocket = async () => {
      try {
        const token = await fetchTokenData();
        if (!isMounted) return;

        const socket = io(config.apiUrl, {
          auth: {
            token: token || "", // pass empty string if null – server will reject
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
