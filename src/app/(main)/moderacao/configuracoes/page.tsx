import { BoosterPanel } from "@/components/moderation/booster-panel";
import { BroadcastPanel } from "@/components/moderation/broadcast-panel";
import { MaintenancePanel } from "@/components/moderation/maintenance-panel";

export default function ModerationSettingsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-1">
      <BroadcastPanel />
      <BoosterPanel />
      <MaintenancePanel />
    </div>
  );
}
