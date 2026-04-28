import { useEffect } from "react";
import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import api, { type ChatInboxItemDto, type ChatMessageDto } from "@/lib/api";
import { useChatSocket } from "@/lib/chatSocket";
import { useAuth } from "@/lib/auth";

/* ────────────────────────────────────────────
   useChatMessages – fetches messages for a
   specific chat partner and keeps them fresh
   via Socket.IO events.
   ──────────────────────────────────────────── */
export function useChatMessages(
  chatPartnerId: number | null,
  enabled = true,
): UseQueryResult<ChatMessageDto[]> {
  const { socket } = useChatSocket();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentUserId = user?.id ? Number(user.id) : null;

  // Join the Socket.IO room for this conversation
  useEffect(() => {
    if (!socket?.connected || !currentUserId || !chatPartnerId || !enabled) return;

    socket.emit("joinRoom", {
      userId: currentUserId,
      otherUserId: chatPartnerId,
    });
  }, [socket, socket?.connected, currentUserId, chatPartnerId, enabled]);

  // Listen for incoming messages – append to cache for instant UI
  useEffect(() => {
    if (!socket || !chatPartnerId || !enabled) return;

    const handler = (msg: ChatMessageDto) => {
      // Only append if this message belongs to the current conversation
      const isRelevant =
        (msg.senderId === chatPartnerId && msg.receiverId === currentUserId) ||
        (msg.senderId === currentUserId && msg.receiverId === chatPartnerId);

      if (!isRelevant) return;

      queryClient.setQueryData<ChatMessageDto[]>(
        ["chatMessages", chatPartnerId],
        (old) => {
          if (!old) return [msg];
          // Avoid duplicates
          if (old.some((m) => m.id === msg.id)) return old;
          return [...old, msg];
        },
      );

      // Also refresh the inbox so unread badges update
      queryClient.invalidateQueries({ queryKey: ["chatInbox"] });
    };

    socket.on("newMessage", handler);
    return () => {
      socket.off("newMessage", handler);
    };
  }, [socket, chatPartnerId, currentUserId, queryClient, enabled]);

  return useQuery<ChatMessageDto[]>({
    queryKey: ["chatMessages", chatPartnerId],
    queryFn: () => api.fetchChatMessages(chatPartnerId!),
    enabled: enabled && !!chatPartnerId,
    // Keep a slow refetch as safety-net; socket delivers the fast updates
    refetchInterval: 30_000,
    staleTime: 5_000,
  });
}

/* ────────────────────────────────────────────
   useChatInbox – fetches the inbox summary and
   refreshes when the socket signals new messages.
   ──────────────────────────────────────────── */
export function useChatInbox(enabled = true): UseQueryResult<ChatInboxItemDto[]> {
  const { socket } = useChatSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !enabled) return;

    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["chatInbox"] });
    };

    socket.on("newMessage", handler);
    return () => {
      socket.off("newMessage", handler);
    };
  }, [socket, queryClient, enabled]);

  return useQuery<ChatInboxItemDto[]>({
    queryKey: ["chatInbox"],
    queryFn: () => api.fetchChatInbox(),
    enabled,
    refetchInterval: 30_000,
    staleTime: 5_000,
  });
}
