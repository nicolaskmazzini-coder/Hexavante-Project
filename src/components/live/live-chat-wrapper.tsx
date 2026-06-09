"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LiveChat, type ChatMessage } from "./live-chat";
import { sendChatMessageAction } from "@/app/actions/live-room";

type Props = {
  roomId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
  disabled?: boolean;
};

const POLL_INTERVAL_MS = 4000;

export function LiveChatWrapper({ roomId, currentUserId, initialMessages, disabled }: Props) {
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const mergeMessages = useCallback((incoming: ChatMessage[]) => {
    if (incoming.length === 0) return;
    setMessages((current) => {
      const known = new Set(current.map((msg) => msg.id));
      const merged = [...current];
      for (const msg of incoming) {
        if (!known.has(msg.id)) merged.push(msg);
      }
      return merged;
    });
  }, []);

  useEffect(() => {
    if (disabled) return;

    const poll = async () => {
      const last = messagesRef.current[messagesRef.current.length - 1];
      const since = last ? new Date(last.createdAt).toISOString() : "";
      const url = since
        ? `/api/live-rooms/${roomId}/messages?since=${encodeURIComponent(since)}`
        : `/api/live-rooms/${roomId}/messages`;

      try {
        const response = await fetch(url);
        if (!response.ok) return;
        const data = (await response.json()) as Array<{
          id: string;
          userId: string;
          username: string;
          fullName: string;
          message: string;
          createdAt: string;
        }>;
        mergeMessages(
          data.map((msg) => ({
            ...msg,
            createdAt: new Date(msg.createdAt),
          })),
        );
      } catch {
        // Ignora falhas temporárias de polling
      }
    };

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [roomId, disabled, mergeMessages]);

  const handleSendMessage = async (message: string) => {
    setIsSending(true);
    try {
      const result = await sendChatMessageAction(roomId, message);
      if (result.success && result.message) {
        setMessages((current) => [...current, result.message!]);
      } else {
        alert(result.error || "Erro ao enviar mensagem");
      }
    } catch {
      alert("Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <LiveChat
      roomId={roomId}
      currentUserId={currentUserId}
      messages={messages}
      onSendMessage={handleSendMessage}
      disabled={disabled || isSending}
      isSending={isSending}
    />
  );
}
