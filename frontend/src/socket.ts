import { io, Socket } from "socket.io-client";
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import config from "./config";
import { getToken } from "./utils/tokenManager";

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

        socketRef.current = socket;
        setSocketInstance(socket);

        return () => {
          socket.disconnect();
        };
      } catch (error) {
        console.error(`Failed to initialize socket: ${error}`);
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
