"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  pending?: boolean;
  variant?: "default" | "danger";
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  pending = false,
  variant = "default",
}: Props) {
  const handleConfirm = () => {
    void onConfirm();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[10002] bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[10003] w-[calc(100%-2rem)] max-w-md max-h-[min(90dvh,640px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain",
            "rounded-xl border border-white/10 bg-[#111120] p-5 shadow-2xl shadow-black/40 sm:p-6",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          <Dialog.Title className="text-lg font-bold text-white">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-slate-400">
            {description}
          </Dialog.Description>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Dialog.Close asChild>
              <Button type="button" variant="outline" disabled={pending} className="min-h-11 w-full sm:w-auto">
                {cancelLabel}
              </Button>
            </Dialog.Close>
            <Button
              type="button"
              variant={variant}
              disabled={pending}
              className="min-h-11 w-full sm:w-auto"
              onClick={handleConfirm}
            >
              {pending ? "Aguarde..." : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
