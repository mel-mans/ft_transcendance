import { useEffect, useState } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/sonner";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

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

interface ChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ChatUser | null;
}

const ChatDrawer = ({ open, onOpenChange, user }: ChatDrawerProps) => {
  const { user: authUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

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
    setNewMessage("");
    setMessages([]);
  }, [chatPartnerId]);

  useEffect(() => {
    let cancelled = false;

    const loadMessages = async () => {
      if (!open || !chatPartnerId || !currentUserId) {
        setMessages([]);
        return;
      }
      setLoading(true);
      try {
        const rows = await api.fetchChatMessages(chatPartnerId);
        if (cancelled) return;
        setMessages(
          rows.map((row) => ({
            id: String(row.id),
            text: row.content,
            sender: row.senderId === currentUserId ? "me" : "them",
            timestamp: new Date(row.createdAt),
          })),
        );
      } catch (error: any) {
        if (cancelled) return;
        setMessages([]);
        toast.error(error?.message || "Failed to load chat messages");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    void loadMessages();
    return () => {
      cancelled = true;
    };
  }, [chatPartnerId, currentUserId, open]);

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

  if (!user) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] max-h-[85vh]">
        <DrawerHeader className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <DrawerTitle className="text-lg">{user.name}</DrawerTitle>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4 py-4 h-[calc(85vh-140px)]">
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-6">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No messages yet.</p>
            ) : messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    message.sender === "me"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="text-[10px] opacity-70 mt-1 block">
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

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
              disabled={sending}
            />
            <Button onClick={handleSend} size="icon" disabled={!newMessage.trim() || sending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ChatDrawer;
