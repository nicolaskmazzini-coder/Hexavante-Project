"use client";

import { useState } from "react";
import { LiveChat, type ChatMessage } from "./live-chat";
import { sendChatMessageAction } from "@/app/actions/live-room";

type Props = {
  roomId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
  disabled?: boolean;
};

export function LiveChatWrapper({ roomId, currentUserId, initialMessages, disabled }: Props) {
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState(initialMessages);

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
