"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { completeOnboardingTourAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";

type TourStep = {
  id: string;
  title: string;
  description: string;
  target?: string;
  placement?: "center" | "bottom" | "right";
};

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao Hexavante!",
    description:
      "Este tour rápido mostra onde estudar, acompanhar seu progresso e desbloquear conquistas.",
    placement: "center",
  },
  {
    id: "continue",
    title: "Continue de onde parou",
    description:
      "Seu ponto de retomada fica aqui — um clique e você volta à última aula ou simulado.",
    target: '[data-tour="study-continue"]',
    placement: "bottom",
  },
  {
    id: "gamification",
    title: "XP e moedas",
    description: "Ganhe XP ao estudar e moedas para personalizar seu perfil na loja.",
    target: '[data-tour="header-gamification"]',
    placement: "bottom",
  },
  {
    id: "stats",
    title: "Suas estatísticas",
    description: "Acompanhe nível, ranking, simulados e sequência de estudos em tempo real.",
    target: '[data-tour="personal-stats"]',
    placement: "bottom",
  },
  {
    id: "recommendations",
    title: "Cursos para você",
    description: "Recomendações baseadas no que você já estuda — explore novas trilhas.",
    target: '[data-tour="course-recommendations"]',
    placement: "bottom",
  },
  {
    id: "done",
    title: "Pronto para estudar!",
    description: "Explore cursos, faça simulados e desbloqueie conquistas no seu perfil.",
    placement: "center",
  },
];

type Props = {
  show: boolean;
};

type Rect = { top: number; left: number; width: number; height: number };

function OnboardingTourActive({ onDismiss }: { onDismiss: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [finishing, setFinishing] = useState(false);

  const step = TOUR_STEPS[stepIndex];
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  const updateTarget = useCallback(() => {
    if (!step?.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(step.target);
    if (!el) {
      setTargetRect(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, [step]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => updateTarget());
    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
    };
  }, [stepIndex, updateTarget]);

  async function finish() {
    setFinishing(true);
    await completeOnboardingTourAction();
    onDismiss();
    setFinishing(false);
  }

  async function handleNext() {
    if (isLast) {
      await finish();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  const isCenter = !step.target || step.placement === "center";

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal aria-label="Tour de boas-vindas">
      <div className="absolute inset-0 bg-black/70" onClick={() => void finish()} aria-hidden />

      {targetRect && (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-sky-400 ring-offset-2 ring-offset-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      <div
        className={`absolute z-[101] w-[min(92vw,24rem)] rounded-xl border border-white/15 bg-[#111120] p-5 shadow-2xl ${
          isCenter
            ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            : targetRect
              ? step.placement === "right"
                ? ""
                : ""
              : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        }`}
        style={
          !isCenter && targetRect
            ? {
                top: targetRect.top + targetRect.height + 12,
                left: Math.min(
                  Math.max(16, targetRect.left),
                  window.innerWidth - Math.min(92 * window.innerWidth * 0.01, 384) - 16,
                ),
              }
            : undefined
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
              Passo {stepIndex + 1} de {TOUR_STEPS.length}
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">{step.title}</h2>
          </div>
          <button
            type="button"
            onClick={() => void finish()}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Fechar tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-300">{step.description}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => void finish()}
            className="text-sm text-slate-400 transition hover:text-white"
          >
            Pular tour
          </button>
          <Button onClick={() => void handleNext()} disabled={finishing} className="min-h-11">
            {finishing ? "Salvando..." : isLast ? "Começar" : "Próximo"}
            {!isLast && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function OnboardingTour({ show }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (!show || dismissed) return null;

  return <OnboardingTourActive onDismiss={() => setDismissed(true)} />;
}
