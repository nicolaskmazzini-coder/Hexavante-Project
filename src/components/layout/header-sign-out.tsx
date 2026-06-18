"use client";

import { useState } from "react";
import { signOutAction } from "@/app/actions/sign-out";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function HeaderSignOut() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSignOut = async () => {
    setPending(true);
    try {
      await signOutAction();
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hx-btn-secondary hidden min-h-9 px-3 py-1.5 text-sm sm:inline-flex"
      >
        Sair
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Sair da conta"
        description="Tem certeza que deseja sair? Você precisará fazer login novamente para acessar sua conta."
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        onConfirm={handleSignOut}
        pending={pending}
        variant="danger"
      />
    </>
  );
}
