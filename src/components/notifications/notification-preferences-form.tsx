"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateNotificationPreferencesAction } from "@/app/actions/notification-preferences";
import {
  NOTIFICATION_PREFERENCE_GROUPS,
  type NotificationPreferenceKey,
} from "@/lib/notifications";
import type { UserNotificationSettingsView } from "@/services/notification-preferences.service";
import { cn } from "@/lib/cn";

type Props = {
  initialSettings: UserNotificationSettingsView;
};

export function NotificationPreferencesForm({ initialSettings }: Props) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = (key: NotificationPreferenceKey) => {
    const previous = settings;
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    setMessage(null);

    startTransition(async () => {
      const result = await updateNotificationPreferencesAction(next);
      if (result.success) {
        setMessage("Preferências salvas.");
        router.refresh();
      } else {
        setSettings(previous);
        setMessage(result.error ?? "Não foi possível salvar.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {NOTIFICATION_PREFERENCE_GROUPS.map((group) => (
        <section key={group.title}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            {group.title}
          </h2>
          <div className="mt-3 space-y-2">
            {group.items.map((item) => {
              const enabled = settings[item.key];
              return (
                <div
                  key={item.key}
                  className="flex items-start justify-between gap-4 rounded-xl border border-[#1e1e2e] bg-[#111120] p-4"
                >
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    disabled={pending}
                    onClick={() => toggle(item.key)}
                    className={cn(
                      "relative h-7 w-12 shrink-0 rounded-full border transition disabled:opacity-60",
                      enabled
                        ? "border-sky-400/40 bg-sky-400/20"
                        : "border-white/10 bg-slate-900",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white transition",
                        enabled ? "left-6" : "left-1",
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {message && <p className="text-sm text-sky-300">{message}</p>}
    </div>
  );
}
