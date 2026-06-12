import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { PublicProfileView } from "@/components/profile/public-profile-view";
import { MyJourney } from "@/components/profile/my-journey";
import { PageShell } from "@/components/ui/page-shell";
import { getPublicProfile } from "@/services/public-profile.service";
import { listUserEnrollments } from "@/services/student.service";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const session = await auth();
  const profile = await getPublicProfile(username, session?.user?.id);

  if (!profile) notFound();

  const allEnrollments =
    profile.isOwner && session?.user?.id
      ? await listUserEnrollments(session.user.id)
      : [];

  return (
    <PageShell>
      <PublicProfileView profile={profile} viewerId={session?.user?.id} />

      {profile.isOwner && allEnrollments.length > 0 && (
        <div className="mt-8">
          <MyJourney enrollments={allEnrollments} />
        </div>
      )}
    </PageShell>
  );
}
