import { auth } from "@/auth";
import { canModerate } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { reviewInstructorApplication } from "@/services/moderation.service";

export default async function RejectInstructorPage({
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
    await reviewInstructorApplication(id, session.user.id, false);
    redirect("/admin/moderation/instructors?success=rejected");
  } catch (error) {
    redirect("/admin/moderation/instructors?error=failed");
  }
}
