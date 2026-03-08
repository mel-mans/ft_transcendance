import { useState, useEffect, useRef } from "react";
import { Send, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/sonner";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  timestamp: Date;
}

interface ChatUser {
  id?: string | number;
  name: string;
  avatar: string;
}

interface ChatPopupProps {
  open: boolean;
  onClose: () => void;
  user: ChatUser | null;
}

const ChatPopup = ({ open, onClose, user }: ChatPopupProps) => {
  const { user: authUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [backendEnabled, setBackendEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  const minimizedRef = useRef(minimized);
  const titleRef = useRef<string>(typeof document !== "undefined" ? document.title : "");

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    minimizedRef.current = minimized;
  }, [minimized]);

  useEffect(() => {
    if (open && !minimized && !document.hidden && unreadCount > 0) {
      setUnreadCount(0);
    }
  }, [open, minimized, unreadCount]);

  useEffect(() => {
    const handleVisibility = () => {
      if (openRef.current && !minimizedRef.current && !document.hidden) {
        setUnreadCount(0);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    const baseTitle = titleRef.current;
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) New message${unreadCount > 1 ? "s" : ""}`;
    } else {
      document.title = baseTitle;
    }

    return () => {
      document.title = baseTitle;
    };
  }, [unreadCount]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toNumericId = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const chatPartnerId = toNumericId(user?.id);
  const currentUserId = toNumericId(authUser?.id);

  useEffect(() => {
    const loadMessages = async () => {
      if (!open || !chatPartnerId || !currentUserId) {
        setBackendEnabled(false);
        setMessages([]);
        return;
      }

      setLoading(true);
      try {
        const rows = await api.fetchChatMessages(chatPartnerId);
        // Ensure rows is an array before calling .map()
        if (!Array.isArray(rows)) {
          console.error("fetchChatMessages did not return an array:", rows);
          throw new Error("Invalid response format from chat service");
        }
        setMessages(
          rows.map((row) => ({
            id: String(row.id),
            text: row.content,
            sender: row.senderId === currentUserId ? "me" : "them",
            timestamp: new Date(row.createdAt),
          }))
        );
        setBackendEnabled(true);
      } catch (error: any) {
        console.error("Chat error:", error);
        setBackendEnabled(false);
        setMessages([]);
        const errorMsg = error?.message || error?.data?.message || "Failed to load chat messages";
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    void loadMessages();
  }, [open, chatPartnerId, currentUserId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    if (!chatPartnerId || !currentUserId) {
      toast.error("Chat is unavailable for this user.");
      return;
    }

    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);
    try {
      const saved = await api.sendChatMessage(chatPartnerId, content);
      const message: Message = {
        id: String(saved.id),
        text: saved.content,
        sender: saved.senderId === currentUserId ? "me" : "them",
        timestamp: new Date(saved.createdAt),
      };
      setMessages((prev) => [...prev, message]);
      setBackendEnabled(true);
    } catch (error: any) {
      setNewMessage(content);
      toast.error(error?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open || !user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col w-[85vw] sm:w-80 max-w-sm shadow-2xl rounded-lg overflow-hidden border border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-primary text-primary-foreground">
        <div 
          className="flex items-center gap-2 cursor-pointer flex-1"
          onClick={() => setMinimized(!minimized)}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-medium text-sm">{user.name}</span>
          {unreadCount > 0 && (
            <span className="ml-1 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-primary-foreground hover:bg-white/20"
            onClick={() => setMinimized(!minimized)}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-primary-foreground hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Collapsible Content */}
      {!minimized && (
        <>
          {/* Messages */}
          <ScrollArea className="h-[50vh] sm:h-72 max-h-80 px-3 py-2" ref={scrollRef}>
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-1.5 rounded-2xl text-sm ${
                      message.sender === "me"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    <p>{message.text}</p>
                    <span className="text-[10px] opacity-60 mt-0.5 block">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border p-2">
            <div className="flex items-center gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  backendEnabled
                    ? "Aa"
                    : "Chat requires login + a valid user id"
                }
                className="flex-1 h-9 text-sm"
                disabled={!backendEnabled || loading || sending}
              />
              <Button 
                onClick={handleSend} 
                size="icon" 
                className="h-9 w-9"
                disabled={!backendEnabled || loading || sending || !newMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatPopup;
