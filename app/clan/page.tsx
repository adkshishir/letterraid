import GameLayout from "@/components/GameLayout";
import ClanView from "./ClanView";

export const metadata = {
  title: "Clan",
};

export default function ClanPage() {
  return (
    <GameLayout>
      <ClanView />
    </GameLayout>
  );
}
