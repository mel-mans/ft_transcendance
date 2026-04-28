import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

/* ────────────────────────────────────────────
   Resolve the Socket.IO server URL.
   In production the frontend is served via nginx which also proxies
   /socket.io/ → chat:3001, so we connect to the same origin.
   During local dev (port 8080/3003) we go through localhost nginx.
   ──────────────────────────────────────────── */
function getSocketUrl(): string {
  const rawBase = String(import.meta.env.VITE_API_BASE_URL || "").trim();

  if (rawBase && /^https?:\/\//i.test(rawBase)) {
    return rawBase.replace(/\/+$/, "").replace(/\/api$/, "");
  }

  if (
    typeof window !== "undefined" &&
    ["3003", "8080"].includes(window.location.port)
  ) {
    return "https://localhost";
  }

  return window.location.origin;
}

/* ────────────────────────────────────────────
   Context
   ──────────────────────────────────────────── */
interface ChatSocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const ChatSocketContext = createContext<ChatSocketContextValue>({
  socket: null,
  connected: false,
});

export function useChatSocket() {
  return useContext(ChatSocketContext);
}

/* ────────────────────────────────────────────
   Provider – mounts a single Socket.IO client
   scoped to the `/chat` namespace when the user
   is authenticated.
   ──────────────────────────────────────────── */
export function ChatSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      // Not logged in – tear down any existing socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const url = getSocketUrl();

    const sock = io(`${url}/chat`, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      // Socket.IO's default path is /socket.io/ which nginx will proxy
    });

    socketRef.current = sock;

    sock.on("connect", () => {
      setConnected(true);
      // Join the user's personal room so we receive notifications for ALL conversations
      sock.emit("joinUser", { userId: user.id });
    });
    sock.on("disconnect", () => setConnected(false));

    // When any new message arrives in a room the user has joined,
    // invalidate the relevant react-query caches so the UI updates
    // instantly.
    sock.on("newMessage", () => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
      queryClient.invalidateQueries({ queryKey: ["chatInbox"] });
    });

    return () => {
      sock.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user?.id, queryClient]);

  return (
    <ChatSocketContext.Provider
      value={{ socket: socketRef.current, connected }}
    >
      {children}
    </ChatSocketContext.Provider>
  );
}
