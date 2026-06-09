"use client";

import { Button } from "@/components/ui/button";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  label: string;
  confirmMessage: string;
};

export function DeleteContentButton({ action, label, confirmMessage }: Props) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="danger" size="sm">
        {label}
      </Button>
    </form>
  );
}
