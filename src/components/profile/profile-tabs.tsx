"use client";

import { useState } from "react";
import Link from "next/link";
import { Award, BookOpen, GraduationCap, History } from "lucide-react";
import { ActivityCard } from "@/components/social/activity-card";
import { AchievementGrid } from "@/components/achievements/achievement-grid";
import {
  ProfileCertificatesGrid,
  type ProfileCertificate,
} from "@/components/profile/profile-certificates-grid";
import type { UserAchievementView } from "@/services/achievement.service";
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
  canInteract: boolean;
  achievements?: UserAchievementView[];
  certificates?: ProfileCertificate[];
};

const tabs = [
  { id: "achievements", label: "Conquistas", icon: Award },
  { id: "courses", label: "Cursos", icon: BookOpen },
  { id: "certificates", label: "Certificados", icon: GraduationCap },
  { id: "activity", label: "Atividade", icon: History },
] as const;

export function ProfileTabs({
  activities,
  enrollments,
  canInteract,
  achievements = [],
  certificates = [],
}: Props) {
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
        {active === "achievements" && <AchievementGrid achievements={achievements} />}

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

        {active === "certificates" && (
          <ProfileCertificatesGrid certificates={certificates} />
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
