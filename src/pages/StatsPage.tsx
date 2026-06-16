import { AppHeader } from "@/components/AppHeader";
import { StatsContent } from "@/components/StatsContent";

export default function StatsPage() {
  return (
    <>
      <AppHeader title="Statistika" subtitle="Yutuqlaringizga umumiy ko'rinish" />
      <div className="px-4 pt-4">
        <StatsContent />
      </div>
    </>
  );
}
