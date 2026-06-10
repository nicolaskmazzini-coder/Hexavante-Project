"use client";

import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

type Props = {
  level?: number;
  showAnimation?: boolean;
};

export function LevelUpCelebration({ level, showAnimation }: Props) {
  const { toast } = useToast();

  useEffect(() => {
    if (level) {
      toast(`Parabéns! Você alcançou o nível ${level}!`, "success");
    }
  }, [level, toast]);

  if (!showAnimation || !level) return null;

  return (
    <div
      className={cn(
        "mb-6 overflow-hidden rounded-xl border border-sky-400/30 bg-gradient-to-r from-sky-500/20 via-blue-500/15 to-teal-400/15 p-6",
        "animate-pulse",
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-400/20 text-sky-100">
          <Sparkles className="h-6 w-6" />
        </span>
        <div>
          <p className="text-lg font-black text-white">Level up!</p>
          <p className="text-sm text-sky-100">Você chegou ao nível {level}.</p>
        </div>
      </div>
    </div>
  );
}
