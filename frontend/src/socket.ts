import { io, Socket } from "socket.io-client";
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import config from "./config";
import { getToken, saveToken } from "./utils/tokenManager";

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
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    let isMounted = true;

    const initializeSocket = async () => {
      try {
        // Get token from cookie or localStorage
        const token = await getToken();
        if (!token || !isMounted) return;

        const socket = io(config.apiUrl, {
          auth: {
            token: token,
          },
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          withCredentials: true, // Try cookies first
        });

        // Handle auth errors and token updates
        socket.on("connect_error", async (error) => {
          console.error("Socket connection error:", error.message);

          if (
            error.message.includes("auth") ||
            error.message.includes("token")
          ) {
            // Try to refresh token and reconnect
            if (reconnectAttempts.current < maxReconnectAttempts) {
              reconnectAttempts.current += 1;
              console.log(
                `Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`
              );

              // Get a fresh token and try again
              const freshToken = await getToken();
              if (freshToken) {
                socket.auth = { token: freshToken };
                socket.connect();
              }
            }
          }
        });

        // Listen for token updates from server
        socket.on("auth:cookie_update", ({ name, value }) => {
          if (name === "auth_token" && value) {
            console.log("Received token update from server");
            saveToken(value);

            // Update the socket auth token
            socket.auth = { token: value };
          }
        });

        // Handle reconnection success
        socket.on("connect", () => {
          console.log("Socket connected successfully");
          reconnectAttempts.current = 0;
        });

        // Handle disconnection
        socket.on("disconnect", (reason) => {
          console.log(`Socket disconnected: ${reason}`);

          // If the server closed the connection, try to reconnect
          if (reason === "io server disconnect") {
            // Try to reconnect manually
            socket.connect();
          }
        });

        socketRef.current = socket;
        setSocketInstance(socket);

        return () => {
          socket.off("connect_error");
          socket.off("auth:cookie_update");
          socket.off("connect");
          socket.off("disconnect");
          socket.disconnect();
        };
      } catch (error) {
        console.error(`Failed to initialize socket: ${error}`);
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

  return React.createElement(
    SocketContext.Provider,
    { value: socketInstance },
    children
  );
};
