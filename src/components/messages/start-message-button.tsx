"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { startConversationAction } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Props = {
  recipientUserId: string;
  recipientName: string;
  className?: string;
};

export function StartMessageButton({ recipientUserId, recipientName, className }: Props) {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleClick = async () => {
    setPending(true);
    try {
      const result = await startConversationAction(recipientUserId);
      if (result.success && result.conversationId) {
        router.push(`/mensagens/${result.conversationId}`);
      } else {
        toast(result.error || "Não foi possível abrir a conversa.", "error");
      }
    } catch {
      toast("Erro ao abrir conversa.", "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void handleClick()}
      disabled={pending}
      className={className}
      title={`Enviar mensagem para ${recipientName}`}
    >
      <MessageCircle className="h-4 w-4" />
      {pending ? "Abrindo..." : "Mensagem"}
    </Button>
  );
}
