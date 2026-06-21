"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Heart, Loader2 } from "lucide-react";
import {
  acceptCommentAction,
  addCommentAction,
  loadCommentsAction,
  toggleCommentLikeAction,
  type CommunityActionResult,
} from "@/app/actions/community";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { ActivityCommentView } from "@/lib/social";
import { timeAgo } from "@/lib/social";
import { cn } from "@/lib/cn";

type Props = {
  activityId: string;
  initialCount: number;
  canInteract: boolean;
  canAcceptSolution: boolean;
  open?: boolean;
};

const initialCommentState: CommunityActionResult = { success: false };

export function ActivityComments({
  activityId,
  initialCount,
  canInteract,
  canAcceptSolution,
  open: initialOpen = false,
}: Props) {
  const [open, setOpen] = useState(initialOpen);
  const [comments, setComments] = useState<ActivityCommentView[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [commentCount, setCommentCount] = useState(initialCount);
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (!open || loaded) return;

    let cancelled = false;
    void loadCommentsAction(activityId).then((rows) => {
      if (cancelled) return;
      setComments(rows);
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [activityId, loaded, open]);

  const loading = open && !loaded;

  function submitComment() {
    if (!canInteract || !content.trim()) return;

    const formData = new FormData();
    formData.set("activityId", activityId);
    formData.set("content", content.trim());

    startTransition(async () => {
      const result = await addCommentAction(initialCommentState, formData);
      if (!result.success) {
        toast(result.error ?? "Erro ao comentar.", "error");
        return;
      }

      setContent("");
      setCommentCount((count) => count + 1);
      const rows = await loadCommentsAction(activityId);
      setComments(rows);
      setLoaded(true);
      toast("Comentário publicado!", "success");
    });
  }

  function toggleLike(commentId: string) {
    if (!canInteract) return;

    startTransition(async () => {
      const result = await toggleCommentLikeAction(commentId);
      if (!result.success) {
        toast(result.error ?? "Erro ao curtir.", "error");
        return;
      }

      setComments((current) =>
        current.map((comment) => {
          if (comment.id !== commentId) return comment;
          const liked = result.liked ?? false;
          return {
            ...comment,
            likedByViewer: liked,
            likes: Math.max(0, comment.likes + (liked ? 1 : -1)),
          };
        }),
      );
    });
  }

  function acceptSolution(commentId: string) {
    if (!canAcceptSolution) return;

    startTransition(async () => {
      const result = await acceptCommentAction(activityId, commentId);
      if (!result.success) {
        toast(result.error ?? "Erro ao aceitar resposta.", "error");
        return;
      }

      const rows = await loadCommentsAction(activityId);
      setComments(rows);
      toast("Solução aceita!", "success");
    });
  }

  return (
    <div className="mt-3 border-t border-white/5 pt-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-sm font-medium text-sky-300 transition hover:text-sky-200"
      >
        {open ? "Ocultar respostas" : `Ver respostas (${commentCount})`}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando respostas...
            </div>
          )}

          {!loading &&
            comments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  "rounded-lg border px-3 py-2.5",
                  comment.isAccepted
                    ? "border-emerald-400/30 bg-emerald-400/5"
                    : "border-white/5 bg-white/[0.02]",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <Link href={`/perfil/${comment.user.username}`} className="shrink-0">
                    <Avatar src={comment.user.avatarUrl} alt={comment.user.username} size="sm" />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Link
                        href={`/perfil/${comment.user.username}`}
                        className="text-sm font-semibold text-white hover:underline"
                      >
                        {comment.user.fullName}
                      </Link>
                      <span className="text-xs text-slate-500">
                        {timeAgo(comment.createdAt)}
                      </span>
                      {comment.isAccepted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-semibold text-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Solução aceita
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm leading-6 text-slate-300">{comment.content}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={!canInteract || pending}
                        onClick={() => toggleLike(comment.id)}
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium transition",
                          comment.likedByViewer
                            ? "text-rose-300"
                            : "text-slate-500 hover:text-rose-200",
                        )}
                      >
                        <Heart
                          className={cn("h-3.5 w-3.5", comment.likedByViewer && "fill-current")}
                        />
                        {comment.likes}
                      </button>

                      {canAcceptSolution && !comment.isAccepted && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => acceptSolution(comment.id)}
                          className="text-xs font-medium text-emerald-300 transition hover:text-emerald-200"
                        >
                          Marcar como solução
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {canInteract && (
            <div className="space-y-2">
              <Textarea
                rows={2}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Escreva uma resposta..."
                maxLength={500}
              />
              <Button
                type="button"
                size="sm"
                disabled={pending || content.trim().length < 2}
                onClick={submitComment}
              >
                {pending ? "Enviando..." : "Responder"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
