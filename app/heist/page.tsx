import type { Metadata } from "next";
import Link from "next/link";
import CreateJoinPanel from "@/components/CreateJoinPanel";
import StructuredData from "@/components/StructuredData";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Heist — the word-stealing race",
  description:
    "Letters drop onto a shared table and you both grab words out of them in real time. Any word on the board can be stolen by reworking it into a longer one. Three minutes, no turns.",
};

export default function HeistPage() {
  return (
    // data-game swaps --accent to the heist palette for everything below.
    <main
      data-game="heist"
      className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-8"
    >
      <StructuredData
        name="Heist"
        description="A real-time competitive word game for two: claim words from a shared pool of letters and steal your opponent's by reworking them."
        path="/heist"
      />
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          ← LetterRaid
        </Link>
        <ThemeToggle />
      </div>

      <h1 className="mt-10 text-4xl font-extrabold text-accent">Heist</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        No turns and no waiting. Letters keep landing on the table, you both
        type as fast as you can think — and nothing you win is ever really
        safe.
      </p>

      <div className="mt-10">
        <CreateJoinPanel game="heist" />
      </div>

      <section className="mt-14">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted">
          How it works
        </h2>
        <ol className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-muted">
          <li>
            <span className="font-semibold text-ink">1. Grab from the table.</span>{" "}
            Type any word of four letters or more that the loose letters can
            spell. It&apos;s yours, and those letters are gone.
          </li>
          <li>
            <span className="font-semibold text-ink">2. Steal by reworking.</span>{" "}
            Take a word off the board by using all its letters plus at least one
            from the table — CANOE becomes CANOEIST and changes hands.
          </li>
          <li>
            <span className="font-semibold text-ink">3. No cheap steals.</span>{" "}
            One letter tacked on the end doesn&apos;t count. CANOES won&apos;t
            do it; you have to actually rebuild the word.
          </li>
          <li>
            <span className="font-semibold text-ink">4. Longest wins.</span>{" "}
            Every word scores its length. Whatever you&apos;re holding when the
            three minutes are up is what counts.
          </li>
        </ol>
      </section>
    </main>
  );
}
