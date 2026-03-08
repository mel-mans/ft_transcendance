import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import api, { type ChatInboxItemDto } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { resolveAvatar } from "@/lib/avatar";
import ChatPopup from "@/components/ChatPopup";

type IncomingMessage = {
  id: number;
  from: string;
  avatar: string;
  text: string;
  time: string;
  unreadCount: number;
};

const formatRelativeTime = (iso: string) => {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
};

const toIncoming = (items: ChatInboxItemDto[]): IncomingMessage[] =>
  items.map((item) => ({
    id: item.senderId,
    from: item.senderName,
    avatar: resolveAvatar(item.senderAvatar),
    text: item.lastMessage,
    time: formatRelativeTime(item.lastMessageAt),
    unreadCount: item.unreadCount,
  }));

const NavbarChatInbox = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<IncomingMessage[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupUser, setPopupUser] = useState<{ id?: string | number; name: string; avatar: string } | null>(null);

  const unreadCount = useMemo(
    () => messages.reduce((sum, item) => sum + item.unreadCount, 0),
    [messages],
  );

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const rows = await api.fetchChatInbox();
        if (!cancelled) {
          setMessages(toIncoming(rows));
        }
      } catch {
        if (!cancelled) {
          setMessages([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [user]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full bg-card/40 backdrop-blur-xl hover:bg-white/10"
            aria-label="Incoming messages"
          >
            <MessageCircle className="h-4 w-4 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={10}
          className="w-80 p-0 border-white/10 bg-card/90 backdrop-blur-xl"
        >
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Incoming messages</p>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : unreadCount > 0 ? (
              <span className="text-xs text-primary font-semibold">{unreadCount} unread</span>
            ) : null}
          </div>

          <ScrollArea className="h-72">
            <div className="p-2">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <button
                    type="button"
                    key={message.id}
                    className="w-full text-left rounded-lg p-2.5 transition-colors hover:bg-white/10"
                    onClick={async () => {
                      // Optimistic unread update for immediate badge refresh
                      setMessages((prev) =>
                        prev.map((item) =>
                          item.id === message.id ? { ...item, unreadCount: 0 } : item,
                        ),
                      );

                      void api.markChatThreadRead(message.id).catch(async () => {
                        // Re-sync from server if mark-read fails
                        try {
                          const rows = await api.fetchChatInbox();
                          setMessages(toIncoming(rows));
                        } catch {
                          // Keep optimistic state if refetch also fails
                        }
                      });

                      setPopupUser({
                        id: message.id,
                        name: message.from,
                        avatar: message.avatar,
                      });
                      setPopupOpen(true);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <img
                        src={message.avatar}
                        alt={message.from}
                        className="h-9 w-9 rounded-full object-cover border border-primary/20"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground">{message.from}</span>
                          <span className="text-[10px] text-muted-foreground">{message.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{message.text}</p>
                      </div>
                      {message.unreadCount > 0 && (
                        <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                          {message.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-2 py-8 text-center text-xs text-muted-foreground">
                  No incoming messages yet.
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <ChatPopup
        key={popupUser?.id ? String(popupUser.id) : "chat-popup-empty"}
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        user={popupUser}
      />
    </>
  );
};

export default NavbarChatInbox;
