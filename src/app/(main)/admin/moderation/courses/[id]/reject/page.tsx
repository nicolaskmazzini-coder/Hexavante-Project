import { auth } from "@/auth";
import { canModerate } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { moderateCourse } from "@/services/moderation.service";

export default async function RejectCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  
  if (!canModerate(session.user.roles)) {
    redirect("/");
  }

  const { id } = await params;

  try {
    await moderateCourse(session.user.id, {
      courseId: id,
      status: "REJECTED",
      reviewNotes: "Rejeitado",
    });
    redirect("/admin/moderation/courses?success=rejected");
  } catch (error) {
    redirect("/admin/moderation/courses?error=failed");
  }
}
