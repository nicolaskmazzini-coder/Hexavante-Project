"use client";

import { useRef, useState } from "react";
import type { ActionResult } from "@/app/actions/exam-admin";
import {
  ExamQuestionImageUpload,
  type ExamQuestionImageUploadHandle,
} from "@/components/exams/exam-question-image-upload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  EXAM_ALTERNATIVE_MAX,
  EXAM_ALTERNATIVE_MIN,
  getAlternativeLetters,
  indexToAlternativeLetter,
} from "@/lib/exam-alternatives";
import { Minus, Plus } from "lucide-react";

type Props = {
  examId: string;
  nextOrder: number;
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
};

const DEFAULT_ALTERNATIVE_COUNT = 4;

function createEmptyAlternatives(count: number) {
  return Array.from({ length: count }, () => "");
}

export function ExamQuestionForm({ examId, nextOrder, action }: Props) {
  const imageRef = useRef<ExamQuestionImageUploadHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [questionType, setQuestionType] = useState<"MULTIPLE_CHOICE" | "ESSAY">("MULTIPLE_CHOICE");
  const [alternatives, setAlternatives] = useState<string[]>(
    createEmptyAlternatives(DEFAULT_ALTERNATIVE_COUNT),
  );
  const [correctAlternative, setCorrectAlternative] = useState("A");

  const alternativeLetters = getAlternativeLetters(alternatives.length);

  const handleAlternativeChange = (index: number, value: string) => {
    setAlternatives((prev) => prev.map((text, i) => (i === index ? value : text)));
  };

  const addAlternative = () => {
    if (alternatives.length >= EXAM_ALTERNATIVE_MAX) return;
    setAlternatives((prev) => [...prev, ""]);
  };

  const removeAlternative = (index: number) => {
    if (alternatives.length <= EXAM_ALTERNATIVE_MIN) return;

    const removedLetter = indexToAlternativeLetter(index);
    setAlternatives((prev) => prev.filter((_, i) => i !== index));

    if (correctAlternative === removedLetter) {
      setCorrectAlternative("A");
    } else {
      const correctIndex = correctAlternative.charCodeAt(0) - 65;
      if (correctIndex > index) {
        setCorrectAlternative(indexToAlternativeLetter(correctIndex - 1));
      }
    }
  };

  const resetForm = () => {
    formRef.current?.reset();
    setQuestionType("MULTIPLE_CHOICE");
    setAlternatives(createEmptyAlternatives(DEFAULT_ALTERNATIVE_COUNT));
    setCorrectAlternative("A");
    setFormKey((key) => key + 1);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);

    try {
      const upload = await imageRef.current?.uploadIfNeeded();
      const form = formRef.current;
      if (!form) return;

      const formData = new FormData(form);

      if (upload) {
        formData.set("imageUrl", upload.url);
        formData.set("imageWidth", String(upload.width));
        formData.set("imageHeight", String(upload.height));
      } else if (imageRef.current?.isRemoved()) {
        formData.set("imageUrl", "");
        formData.set("imageWidth", "");
        formData.set("imageHeight", "");
      }

      if (questionType === "MULTIPLE_CHOICE") {
        formData.delete("alternatives");
        for (const text of alternatives) {
          formData.append("alternatives", text.trim());
        }
        formData.set("correctAlternative", correctAlternative);
      }

      const result = await action({ success: false }, formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(true);
        resetForm();
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao adicionar questão.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Card padding="md">
      <h3 className="mb-4 font-semibold text-white">Nova questão</h3>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="examId" value={examId} />
        <input type="hidden" name="type" value={questionType} />

        <div className="w-56">
          <Label htmlFor="question-type">Tipo de questão</Label>
          <NativeSelect
            id="question-type"
            value={questionType}
            onChange={(event) => setQuestionType(event.target.value as "MULTIPLE_CHOICE" | "ESSAY")}
          >
            <option value="MULTIPLE_CHOICE">Múltipla escolha</option>
            <option value="ESSAY">Dissertativa</option>
          </NativeSelect>
        </div>

        <div>
          <Label htmlFor="statement">Enunciado</Label>
          <Textarea id="statement" name="statement" rows={3} required />
        </div>

        <ExamQuestionImageUpload key={formKey} ref={imageRef} />

        <div className="w-32">
          <Label htmlFor="orderNumber">Ordem</Label>
          <Input
            id="orderNumber"
            name="orderNumber"
            type="number"
            min={1}
            defaultValue={String(nextOrder)}
            required
          />
        </div>

        {questionType === "MULTIPLE_CHOICE" ? (
          <>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label>Alternativas</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAlternative}
                  disabled={alternatives.length >= EXAM_ALTERNATIVE_MAX}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar alternativa
                </Button>
              </div>

              {alternatives.map((text, index) => {
                const letter = indexToAlternativeLetter(index);
                return (
                  <div key={`${formKey}-alt-${index}`} className="flex items-end gap-2">
                    <div className="min-w-0 flex-1">
                      <Label htmlFor={`alternative-${index}`}>Alternativa {letter}</Label>
                      <Input
                        id={`alternative-${index}`}
                        value={text}
                        onChange={(event) => handleAlternativeChange(index, event.target.value)}
                        required
                        placeholder={`Texto da alternativa ${letter}`}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAlternative(index)}
                      disabled={alternatives.length <= EXAM_ALTERNATIVE_MIN}
                      aria-label={`Remover alternativa ${letter}`}
                      className="mb-0.5 shrink-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}

              <p className="text-xs text-slate-500">
                Mínimo {EXAM_ALTERNATIVE_MIN}, máximo {EXAM_ALTERNATIVE_MAX} alternativas.
              </p>
            </div>

            <div className="w-48">
              <Label htmlFor="correctAlternative">Gabarito</Label>
              <NativeSelect
                id="correctAlternative"
                value={correctAlternative}
                onChange={(event) => setCorrectAlternative(event.target.value)}
              >
                {alternativeLetters.map((letter) => (
                  <option key={letter} value={letter}>
                    Alternativa {letter}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </>
        ) : (
          <div>
            <Label htmlFor="expectedAnswer">Gabarito / resposta esperada</Label>
            <Textarea
              id="expectedAnswer"
              name="expectedAnswer"
              rows={4}
              required
              placeholder="Referência para correção manual do professor"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-emerald-400">Questão adicionada!</p>}
        <Button type="submit" disabled={pending} size="sm">
          {pending ? "Salvando..." : "Adicionar questão"}
        </Button>
      </form>
    </Card>
  );
}
