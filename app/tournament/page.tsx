import { Suspense } from "react";
import GameLayout from "@/components/GameLayout";
import TournamentView from "./TournamentView";

export const metadata = {
  title: "Tournament",
};

export default function TournamentPage() {
  return (
    <GameLayout>
      <Suspense>
        <TournamentView />
      </Suspense>
    </GameLayout>
  );
}
