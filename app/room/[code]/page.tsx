import type { Metadata } from "next";
import RoomClient from "./RoomClient";

export const metadata: Metadata = {
  title: "Room",
  // SEO.md: gameplay routes are ephemeral and private to a pair — indexing them
  // is pure crawl-budget noise.
  robots: { index: false, follow: false },
};

export default async function RoomPage({
  params,
}: {
  // Next 16: params is a Promise and must be awaited.
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <RoomClient code={code.toUpperCase()} />;
}
