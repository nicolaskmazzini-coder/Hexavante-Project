"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  message: string;
  createdAt: Date;
}

interface LiveChatProps {
  roomId: string;
  currentUserId: string;
  messages: ChatMessage[];
  onSendMessage?: (message: string) => void;
  disabled?: boolean;
  isSending?: boolean;
}

export function LiveChat({
  currentUserId,
  messages,
  onSendMessage,
  disabled = false,
  isSending = false,
}: LiveChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    const trimmed = newMessage.trim();
    if (trimmed && onSendMessage) {
      onSendMessage(trimmed);
      setNewMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-teal-300" />
              <h3 className="font-bold text-white">Chat ao vivo</h3>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {messages.length} {messages.length === 1 ? "mensagem" : "mensagens"}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-200">
            <UsersRound className="h-3.5 w-3.5" />
            Sala
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-8 text-center">
              <MessageCircle className="mx-auto h-7 w-7 text-slate-500" />
              <p className="mt-3 text-sm font-semibold text-slate-300">Nenhuma mensagem ainda.</p>
              <p className="mt-1 text-xs text-slate-500">
                Quando a transmissão começar, a conversa aparece aqui.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.userId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
                >
                  <span
                    className={`mb-1 text-xs font-medium ${isOwnMessage ? "text-sky-200" : "text-slate-400"}`}
                  >
                    {isOwnMessage ? "Você" : msg.fullName || msg.username}
                  </span>
                  <div
                    className={`max-w-[86%] rounded-2xl px-3 py-2 shadow-sm ${
                      isOwnMessage
                        ? "rounded-br-sm bg-primary text-white"
                        : "rounded-bl-sm border border-white/10 bg-slate-950/55 text-slate-200"
                    }`}
                  >
                    <p className="break-words text-sm leading-6">{msg.message}</p>
                  </div>
                  <span className="mt-1 text-xs text-slate-500">
                    {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Chat indisponível" : "Escreva uma mensagem..."}
            disabled={disabled}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || disabled}
            aria-label="Enviar mensagem"
          >
            {isSending ? "..." : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
