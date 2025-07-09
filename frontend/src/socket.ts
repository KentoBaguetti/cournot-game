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
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    let isMounted = true;

    const fetchTokenData = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/auth/token`, {
          withCredentials: true,
        });

        if (response.data && response.data.token) {
          return response.data.token;
        } else {
          console.error("No token in response:", response.data);
          // Try to get token from localStorage as fallback (for mobile browsers)
          const localToken = localStorage.getItem("game_auth_token");
          if (localToken) {
            console.log("Using token from localStorage");
            return localToken;
          }
          return null;
        }
      } catch (error) {
        console.error("Error fetching token:", error);
        // Try to get token from localStorage as fallback
        const localToken = localStorage.getItem("game_auth_token");
        if (localToken) {
          console.log("Using token from localStorage after fetch error");
          return localToken;
        }
        return null;
      }
    };

    const initializeSocket = async () => {
      try {
        const token = await fetchTokenData();
        if (!isMounted) return;

        if (!token) {
          setConnectionError("Failed to get authentication token");
          return;
        }

        console.log("Connecting to socket with token");

        const socket = io(config.apiUrl, {
          auth: {
            token: token,
          },
          withCredentials: true,
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          transports: ["websocket", "polling"], // Try WebSocket first, fall back to polling
          query: { token }, // Also send token as query param for mobile browsers
        });

        socket.on("connect", () => {
          console.log("Socket connected successfully");
          reconnectAttempts.current = 0;
        });

        socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          reconnectAttempts.current++;

          if (reconnectAttempts.current >= maxReconnectAttempts) {
            console.error("Max reconnect attempts reached");
            socket.disconnect();
            setConnectionError(
              "Failed to connect to game server after multiple attempts"
            );
          }
        });

        socketRef.current = socket;
        setSocketInstance(socket);

        return () => {
          socket.disconnect();
        };
      } catch (error) {
        console.error(`Failed to initialize socket:`, error);
        setConnectionError("Failed to connect to game server");
      }
    };

    initializeSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // If there's a connection error, you could render an error message
  if (connectionError) {
    console.error("Socket connection error:", connectionError);
    // You could handle this error in your UI if needed
  }

  return React.createElement(
    SocketContext.Provider,
    { value: socketInstance },
    children
  );
};
