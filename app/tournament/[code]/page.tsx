import type { Metadata } from "next";
import GameLayout from "@/components/GameLayout";
import TournamentRoomClient from "./TournamentRoomClient";

export const metadata: Metadata = {
  title: "Tournament",
};

export default async function TournamentCodePage({
  params,
}: {
  // Next 16: params is a Promise and must be awaited.
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return (
    <GameLayout>
      <TournamentRoomClient code={code.toUpperCase()} />
    </GameLayout>
  );
}
