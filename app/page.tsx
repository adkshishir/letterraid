import Link from "next/link";
import { Swords } from "lucide-react";
import StructuredData from "@/components/StructuredData";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * The hub.
 *
 * One game today. It still renders as a list rather than redirecting straight
 * into Heist, because the whole point of the split from Cahoots is that this is
 * a family — Fence, Crack and Turf are queued in games/future-docs/ and each
 * drops in as another entry here.
 */
const games = [
  {
    slug: "heist",
    name: "Heist",
    tagline: "Grab words off the table — and steal the ones they took.",
    icon: Swords,
    accentClass: "text-heist-accent",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-8">
      <StructuredData
        name="LetterRaid"
        description="Fast head-to-head word games. No signup — just share a room code."
        path="/"
      />
      <div className="flex items-center justify-between">
        <span className="bg-gradient-to-r from-brand-vivid to-brand-2-vivid bg-clip-text text-xl font-extrabold text-transparent">
          LetterRaid
        </span>
        <ThemeToggle />
      </div>

      <div className="mt-12 text-center">
        <h1 className="text-4xl font-extrabold leading-tight text-ink">
          Word games
          <br />
          with a thief in them.
        </h1>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-muted">
          No signup, no scoreboard to climb. Share a room code and find out how
          fast you can take something off someone.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-4">
        {games.map((game) => (
          <Link
            key={game.slug}
            href={`/${game.slug}`}
            className="group pressable flex items-center gap-4 rounded-lg border border-border bg-surface p-5 shadow-[var(--shadow-sm)] transition-colors"
          >
            <game.icon
              size={28}
              className={`${game.accentClass} shrink-0`}
              aria-hidden
            />
            <div className="min-w-0">
              <h2 className="font-bold text-ink">{game.name}</h2>
              <p className="mt-1 text-sm leading-snug text-muted">
                {game.tagline}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-auto pt-12 text-center text-xs text-muted">
        Two players · three minutes a round
      </p>
    </main>
  );
}
