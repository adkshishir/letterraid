import GameLayout from "@/components/GameLayout";
import TournamentView from "./TournamentView";

export const metadata = {
  title: "Tournament",
};

export default function TournamentPage() {
  return (
    <GameLayout>
      <TournamentView />
    </GameLayout>
  );
}
