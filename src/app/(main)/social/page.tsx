import { Users } from "lucide-react";
import { auth } from "@/auth";
import { SocialFeed } from "@/components/social/social-feed";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { getSocialFeed } from "@/services/social.service";

export default async function SocialPage() {
  const session = await auth();
  const viewerId = session?.user?.id;

  const [exploreActivities, followingActivities] = await Promise.all([
    getSocialFeed("explore", viewerId),
    viewerId ? getSocialFeed("following", viewerId) : Promise.resolve([]),
  ]);

  return (
    <PageShell size="md">
      <PageHeader
        badge="Comunidade"
        icon={Users}
        title="Social"
        description="Acompanhe conquistas, cursos concluídos e simulados de outros estudantes."
      />

      <div className="mt-6">
        <SocialFeed
          exploreActivities={exploreActivities}
          followingActivities={followingActivities}
          canInteract={Boolean(viewerId)}
        />
      </div>
    </PageShell>
  );
}
