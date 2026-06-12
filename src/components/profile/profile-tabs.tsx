"use client";

import { useState } from "react";
import Link from "next/link";
import { Award, BookOpen, History } from "lucide-react";
import { ActivityCard } from "@/components/social/activity-card";
import type { FeedActivity } from "@/lib/social";
import { cn } from "@/lib/cn";

type Enrollment = {
  progress: number;
  course: {
    title: string;
    slug: string;
    category: { name: string };
  };
};

type Props = {
  activities: FeedActivity[];
  enrollments: Enrollment[];
  equippedTitle: string | null;
  canInteract: boolean;
};

const tabs = [
  { id: "achievements", label: "Conquistas", icon: Award },
  { id: "courses", label: "Cursos", icon: BookOpen },
  { id: "activity", label: "Atividade", icon: History },
] as const;

export function ProfileTabs({ activities, enrollments, equippedTitle, canInteract }: Props) {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("achievements");

  return (
    <section className="mt-8">
      <div className="flex flex-wrap gap-2 border-b border-[#1e1e2e] pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                active === tab.id
                  ? "bg-sky-400/15 text-sky-100"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {active === "achievements" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {equippedTitle ? (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
                <p className="text-xs font-semibold uppercase text-amber-200">Título equipado</p>
                <p className="mt-2 font-semibold text-white">{equippedTitle}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Nenhuma conquista exibida ainda.</p>
            )}
            {enrollments.length > 0 && (
              <div className="rounded-xl border border-teal-400/20 bg-teal-400/10 p-4">
                <p className="text-xs font-semibold uppercase text-teal-200">Cursos concluídos</p>
                <p className="mt-2 text-2xl font-black text-white">{enrollments.length}</p>
              </div>
            )}
          </div>
        )}

        {active === "courses" && (
          <div className="space-y-3">
            {enrollments.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum curso concluído ainda.</p>
            ) : (
              enrollments.map((enrollment) => (
                <Link
                  key={enrollment.course.slug}
                  href={`/courses/${enrollment.course.slug}`}
                  className="block rounded-xl border border-[#1e1e2e] bg-[#111120] p-4 transition hover:border-sky-400/30"
                >
                  <p className="font-semibold text-white">{enrollment.course.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{enrollment.course.category.name}</p>
                </Link>
              ))
            )}
          </div>
        )}

        {active === "activity" && (
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhuma atividade pública registrada.</p>
            ) : (
              activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} canInteract={canInteract} />
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
