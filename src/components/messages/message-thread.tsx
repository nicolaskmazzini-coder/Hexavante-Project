"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CheckCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SerializedDirectMessage } from "@/services/direct-message.service";

type Props = {
  conversationId: string;
  currentUserId: string;
  messages: SerializedDirectMessage[];
  onSendMessage: (body: string) => Promise<void>;
  disabled?: boolean;
  isSending?: boolean;
};

export function MessageThread({
  conversationId,
  currentUserId,
  messages,
  onSendMessage,
  disabled = false,
  isSending = false,
}: Props) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, conversationId]);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || disabled) return;
    await onSendMessage(trimmed);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-10 text-center">
              <p className="text-sm font-semibold text-slate-300">Nenhuma mensagem ainda</p>
              <p className="mt-1 text-xs text-slate-500">Envie a primeira mensagem para começar.</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-3 py-2 shadow-sm ${
                      isOwn
                        ? "rounded-br-sm bg-primary text-white"
                        : "rounded-bl-sm border border-white/10 bg-slate-950/55 text-slate-200"
                    }`}
                  >
                    <p className="break-words text-sm leading-6">{message.body}</p>
                  </div>
                  <div
                    className={`mt-1 flex items-center gap-1 text-[11px] text-slate-500 ${
                      isOwn ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span>
                      {new Date(message.createdAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isOwn &&
                      (message.readAt ? (
                        <CheckCheck className="h-3.5 w-3.5 text-sky-300" aria-label="Lida" />
                      ) : (
                        <Check className="h-3.5 w-3.5" aria-label="Enviada" />
                      ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva uma mensagem..."
            disabled={disabled}
            className="flex-1"
            maxLength={2000}
          />
          <Button
            onClick={() => void handleSend()}
            disabled={!draft.trim() || disabled}
            aria-label="Enviar mensagem"
          >
            {isSending ? "..." : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
