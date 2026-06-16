"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sendDirectMessageAction } from "@/app/actions/messages";
import { MessageThread } from "@/components/messages/message-thread";
import { useToast } from "@/components/ui/toast";
import type { SerializedDirectMessage } from "@/services/direct-message.service";

type Props = {
  conversationId: string;
  currentUserId: string;
  initialMessages: SerializedDirectMessage[];
};

const POLL_INTERVAL_MS = 4000;

export function MessageThreadWrapper({ conversationId, currentUserId, initialMessages }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const messagesRef = useRef(messages);
  const { toast } = useToast();

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, conversationId]);

  const mergeMessages = useCallback((incoming: SerializedDirectMessage[]) => {
    if (incoming.length === 0) return;
    setMessages((current) => {
      const known = new Set(current.map((msg) => msg.id));
      const merged = [...current];
      for (const msg of incoming) {
        if (!known.has(msg.id)) merged.push(msg);
      }
      return merged.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    });
  }, []);

  useEffect(() => {
    const poll = async () => {
      const last = messagesRef.current[messagesRef.current.length - 1];
      const since = last ? encodeURIComponent(last.createdAt) : "";
      const url = since
        ? `/api/conversations/${conversationId}/messages?since=${since}`
        : `/api/conversations/${conversationId}/messages`;

      try {
        const response = await fetch(url);
        if (!response.ok) return;
        const data = (await response.json()) as SerializedDirectMessage[];
        mergeMessages(data);
      } catch {
        // Ignora falhas temporárias
      }
    };

    void poll();
    const interval = setInterval(() => void poll(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [conversationId, mergeMessages]);

  const handleSend = async (body: string) => {
    setIsSending(true);
    try {
      const result = await sendDirectMessageAction(conversationId, body);
      if (result.success && result.message) {
        setMessages((current) => [...current, result.message!]);
      } else {
        toast(result.error || "Erro ao enviar mensagem", "error");
      }
    } catch {
      toast("Erro ao enviar mensagem", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <MessageThread
      conversationId={conversationId}
      currentUserId={currentUserId}
      messages={messages}
      onSendMessage={handleSend}
      disabled={isSending}
      isSending={isSending}
    />
  );
}
