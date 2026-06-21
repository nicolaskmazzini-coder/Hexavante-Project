"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCheck, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { formatMessageTime, groupMessagesForThread } from "@/lib/message-thread-format";
import type { SerializedDirectMessage } from "@/services/direct-message.service";

type Props = {
  conversationId: string;
  currentUserId: string;
  messages: SerializedDirectMessage[];
  onSendMessage: (body: string) => Promise<void>;
  disabled?: boolean;
  isSending?: boolean;
};

function clusterPosition(index: number, total: number): "single" | "first" | "middle" | "last" {
  if (total === 1) return "single";
  if (index === 0) return "first";
  if (index === total - 1) return "last";
  return "middle";
}

function bubbleShape(isOwn: boolean, position: "single" | "first" | "middle" | "last") {
  const base = isOwn
    ? "bg-primary text-white shadow-sm shadow-black/20"
    : "border border-white/10 bg-slate-950/50 text-slate-100";

  if (isOwn) {
    return cn(
      base,
      position === "single" && "rounded-2xl rounded-br-md",
      position === "first" && "rounded-2xl rounded-br-lg",
      position === "middle" && "rounded-2xl rounded-r-xl",
      position === "last" && "rounded-2xl rounded-br-sm",
    );
  }
  return cn(
    base,
    position === "single" && "rounded-2xl rounded-bl-md",
    position === "first" && "rounded-2xl rounded-bl-lg",
    position === "middle" && "rounded-2xl rounded-l-xl",
    position === "last" && "rounded-2xl rounded-bl-sm",
  );
}

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
  const shouldStickToBottom = useRef(true);

  // Memoize so grouping doesn't rerun on every render
  const datedBlocks = useMemo(() => groupMessagesForThread(messages), [messages]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior });
  }, []);

  useLayoutEffect(() => {
    if (shouldStickToBottom.current) {
      scrollToBottom(messages.length <= 2 ? "auto" : "smooth");
    }
  }, [messages, conversationId, scrollToBottom]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const onScroll = () => {
      const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
      shouldStickToBottom.current = distance < 80;
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, [conversationId]);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || disabled) return;
    shouldStickToBottom.current = true;
    await onSendMessage(trimmed);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const canSend = draft.trim().length > 0 && !disabled;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[10rem] items-center justify-center">
            <p className="text-center text-sm text-slate-500">
              Nenhuma mensagem ainda.
              <br />
              <span className="text-slate-400">Envie a primeira para começar.</span>
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {datedBlocks.map((block) => (
              <section key={block.dateKey}>
                <div className="mb-3 flex justify-center">
                  <span className="rounded-full bg-white/[0.06] px-3 py-0.5 text-[11px] font-medium text-slate-400">
                    {block.label}
                  </span>
                </div>
                <div className="space-y-2">
                  {block.clusters.map((cluster) => {
                    const isOwn = cluster.senderId === currentUserId;
                    return (
                      <div
                        key={`${cluster.senderId}-${cluster.messages[0]?.id}`}
                        className={cn(
                          "flex flex-col gap-0.5",
                          isOwn ? "items-end" : "items-start",
                        )}
                      >
                        {cluster.messages.map((message, index) => {
                          const total = cluster.messages.length;
                          const position = clusterPosition(index, total);
                          const isLast = index === total - 1;
                          return (
                            <div
                              key={message.id}
                              className={cn(
                                "max-w-[85%] px-3 py-2 sm:max-w-[70%]",
                                bubbleShape(isOwn, position),
                              )}
                            >
                              {/* body already filtered server-side via serializeDirectMessage */}
                              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                {message.body}
                              </p>
                              {isLast ? (
                                <div
                                  className={cn(
                                    "mt-0.5 flex items-center gap-1 text-[10px]",
                                    isOwn ? "justify-end text-white/60" : "text-slate-500",
                                  )}
                                >
                                  <span>{formatMessageTime(message.createdAt)}</span>
                                  {isOwn &&
                                    (message.readAt ? (
                                      <CheckCheck className="h-3 w-3" aria-label="Lida" />
                                    ) : (
                                      <Check className="h-3 w-3" aria-label="Enviada" />
                                    ))}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 bg-white/[0.02] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva uma mensagem..."
            disabled={disabled}
            maxLength={2000}
            className="min-h-11 flex-1 rounded-xl border-white/10 bg-slate-950/40"
          />
          <Button
            onClick={() => void handleSend()}
            disabled={!canSend}
            aria-label="Enviar mensagem"
            className="h-11 w-11 shrink-0 rounded-xl p-0"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
