import { Suspense } from "react";
import { Users } from "lucide-react";
import { safeAuth } from "@/lib/safe-auth";
import { SocialFeed } from "@/components/social/social-feed";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import {
  getSuggestedCommunityUsers,
  getTrendingTags,
} from "@/services/community.service";
import { getSocialFeed } from "@/services/social.service";

type Props = {
  searchParams: Promise<{ tag?: string; post?: string }>;
};

export default async function SocialPage({ searchParams }: Props) {
  const session = await safeAuth();
  const viewerId = session?.user?.id;
  const params = await searchParams;
  const tag = params.tag;

  const [exploreActivities, followingActivities, questionsActivities, trendingTags, suggestedUsers] =
    await Promise.all([
      getSocialFeed("explore", viewerId),
      viewerId ? getSocialFeed("following", viewerId) : Promise.resolve([]),
      getSocialFeed("questions", viewerId),
      getTrendingTags(),
      getSuggestedCommunityUsers(viewerId),
    ]);

  return (
    <PageShell size="lg">
      <PageHeader
        badge="Comunidade"
        icon={Users}
        title="Comunidade"
        description="Tire dúvidas, compartilhe dicas e acompanhe conquistas de outros estudantes."
      />

      <div className="mt-6">
        <Suspense fallback={null}>
          <SocialFeed
            exploreActivities={exploreActivities}
            followingActivities={followingActivities}
            questionsActivities={questionsActivities}
            trendingTags={trendingTags}
            suggestedUsers={suggestedUsers}
            canInteract={Boolean(viewerId)}
            viewerId={viewerId}
            initialTag={tag}
            highlightPostId={params.post}
          />
        </Suspense>
      </div>
    </PageShell>
  );
}
