import GameLayout from "@/components/GameLayout";
import LeaderboardView from "./LeaderboardView";

export const metadata = {
  title: "Leaderboard",
};

export default function LeaderboardPage() {
  return (
    <GameLayout>
      <LeaderboardView />
    </GameLayout>
  );
}
