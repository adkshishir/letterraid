"use client";

import { useEffect, useState } from "react";
import { Trophy, Zap } from "lucide-react";
import RoundTimer from "@/components/RoundTimer";
import { useHeistGame } from "@/hooks/useHeistGame";
import type {
  HeistClaimedPayload,
  HeistStateView,
  HeistWordView,
  Player,
} from "@/lib/types";
import { HEIST_ROUND_SECONDS } from "@/lib/types";

/**
 * Heist: one pool, two boards, three minutes.
 *
 * The only game here where the input never goes away — it stays mounted and
 * focused through claims, steals and bounced words alike, because anything that
 * takes the keyboard away mid-race costs the player the word they were typing.
 */
export default function HeistGame({
  roomCode,
  playerId,
  players,
}: {
  roomCode: string;
  playerId: string | null;
  players: Player[];
}) {
  const game = useHeistGame(roomCode, playerId);
  const { state } = game;
  const [value, setValue] = useState("");

  const nameFor = (id: string) =>
    id === playerId
      ? "You"
      : (players.find((p) => p.id === id)?.displayName ?? "Them");

  const [secondsLeft, setSecondsLeft] = useState(HEIST_ROUND_SECONDS);
  useEffect(() => {
    if (state?.msRemaining == null) return;
    const deadline = Date.now() + state.msRemaining;
    const tick = () =>
      setSecondsLeft(Math.max(0, Math.round((deadline - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [state?.msRemaining]);

  if (!state) {
    return (
      <p className="py-16 text-center text-sm text-muted">Shuffling the bag…</p>
    );
  }

  if (state.status === "complete" && state.result) {
    return (
      <Result
        state={state}
        playerId={playerId}
        nameFor={nameFor}
        onRestart={game.restart}
      />
    );
  }

  const mine = state.words.filter((w) => w.ownerId === playerId);
  const theirs = state.words.filter((w) => w.ownerId !== playerId);
  const scoreFor = (id: string | null) =>
    state.scores.find((s) => s.playerId === id)?.score ?? 0;
  const opponentId = players.find((p) => p.id !== playerId)?.id ?? null;

  return (
    <div className="flex flex-col gap-5 py-5">
      <div className="flex items-center justify-between">
        <Tally label="You" score={scoreFor(playerId)} mine />
        <RoundTimer
          secondsLeft={secondsLeft}
          totalSeconds={HEIST_ROUND_SECONDS}
          size="sm"
        />
        <Tally
          label={opponentId ? nameFor(opponentId) : "Them"}
          score={scoreFor(opponentId)}
        />
      </div>

      <Pool letters={state.pool} />

      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const word = value.trim();
          if (!word) return;
          game.claim(word);
          // Cleared optimistically: the next word is already being typed, and
          // waiting for the server to confirm would eat the first keystrokes.
          setValue("");
        }}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Claim a word"
          placeholder="Type a word…"
          className={`w-full rounded-md border bg-surface px-4 py-3 text-center font-mono text-lg uppercase tracking-widest text-ink outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-muted/50 focus:border-accent ${
            game.error ? "animate-shake border-danger" : "border-border-strong"
          }`}
          // Re-keying on the error restarts the shake for a repeated message.
          key={game.error?.key ?? "input"}
        />
        <p
          className="min-h-5 text-center text-xs"
          role={game.error ? "alert" : undefined}
        >
          {game.error ? (
            <span className="text-danger">{game.error.message}</span>
          ) : game.lastClaim ? (
            <LastClaim claim={game.lastClaim} nameFor={nameFor} />
          ) : (
            <span className="text-muted">
              Four letters or more. Rework a word on the board to take it.
            </span>
          )}
        </p>
      </form>

      <div className="grid grid-cols-2 gap-3">
        <WordColumn title="Yours" words={mine} mine />
        <WordColumn
          title={opponentId ? nameFor(opponentId) : "Theirs"}
          words={theirs}
        />
      </div>
    </div>
  );
}

// ── Pieces ──────────────────────────────────────────────────────────────────

function Tally({
  label,
  score,
  mine = false,
}: {
  label: string;
  score: number;
  mine?: boolean;
}) {
  return (
    <div className={`flex flex-col ${mine ? "items-start" : "items-end"}`}>
      <span className="text-xs uppercase tracking-widest text-muted">
        {label}
      </span>
      <span
        className={`font-mono text-2xl font-bold ${mine ? "text-accent" : "text-ink"}`}
      >
        {score}
      </span>
    </div>
  );
}

function Pool({ letters }: { letters: string[] }) {
  return (
    <div
      className="flex min-h-16 flex-wrap items-center justify-center gap-1.5 rounded-lg border border-border bg-surface p-3"
      aria-label={`Letters on the table: ${letters.join(", ")}`}
    >
      {letters.length === 0 ? (
        <span className="text-xs text-muted">Table&apos;s empty…</span>
      ) : (
        letters.map((letter, i) => (
          <span
            key={`${letter}-${i}`}
            className="animate-pop-in flex h-8 w-8 items-center justify-center rounded-md border border-border-strong bg-surface-raised font-mono text-sm font-bold uppercase text-ink"
          >
            {letter}
          </span>
        ))
      )}
    </div>
  );
}

function LastClaim({
  claim,
  nameFor,
}: {
  claim: HeistClaimedPayload;
  nameFor: (id: string) => string;
}) {
  if (claim.type === "steal") {
    return (
      <span className="text-warning">
        <Zap size={11} className="mr-1 inline align-[-1px]" aria-hidden />
        {nameFor(claim.playerId)} turned {claim.stolenWord?.toUpperCase()} into{" "}
        {claim.word.toUpperCase()}
      </span>
    );
  }
  return (
    <span className="text-muted">
      {nameFor(claim.playerId)} took {claim.word.toUpperCase()}
    </span>
  );
}

function WordColumn({
  title,
  words,
  mine = false,
}: {
  title: string;
  words: HeistWordView[];
  mine?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs uppercase tracking-widest text-muted">{title}</p>
      {words.length === 0 && (
        <p className="text-xs text-muted/60">Nothing yet</p>
      )}
      {[...words]
        .sort((a, b) => b.word.length - a.word.length)
        .map((word) => (
          <div
            key={word.id}
            className={`animate-slide-up flex items-baseline justify-between gap-2 rounded-md border px-2.5 py-1.5 ${
              mine
                ? "border-accent/40 bg-accent/10"
                : "border-border bg-surface"
            }`}
          >
            <span className="truncate font-mono text-sm font-bold uppercase text-ink">
              {word.word}
            </span>
            <span className="shrink-0 font-mono text-xs text-muted">
              {word.points}
            </span>
          </div>
        ))}
    </div>
  );
}

// ── Result ──────────────────────────────────────────────────────────────────

function Result({
  state,
  playerId,
  nameFor,
  onRestart,
}: {
  state: HeistStateView;
  playerId: string | null;
  nameFor: (id: string) => string;
  onRestart: () => void;
}) {
  const result = state.result!;
  const won = result.winnerId === playerId;

  const headline = result.tied
    ? "Dead level."
    : won
      ? "You had it."
      : `${nameFor(result.winnerId ?? "")} had it.`;

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="text-center">
        <Trophy
          size={36}
          className={`mx-auto ${won ? "text-accent" : "text-muted"}`}
          aria-hidden
        />
        <h2 className="mt-4 text-2xl font-bold text-ink">{headline}</h2>
        <div className="mt-4 flex items-center justify-center gap-6">
          {result.scores.map((score) => (
            <div key={score.playerId} className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-widest text-muted">
                {nameFor(score.playerId)}
              </span>
              <span
                className={`font-mono text-4xl font-extrabold ${
                  score.playerId === playerId ? "text-accent" : "text-ink"
                }`}
              >
                {score.score}
              </span>
              <span className="text-xs text-muted">
                {score.words} word{score.words === 1 ? "" : "s"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <WordColumn
          title="Yours"
          words={state.words.filter((w) => w.ownerId === playerId)}
          mine
        />
        <WordColumn
          title="Theirs"
          words={state.words.filter((w) => w.ownerId !== playerId)}
        />
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="pressable mx-auto rounded-full bg-accent px-8 py-3 text-sm font-bold text-on-fill"
      >
        Run it back
      </button>
    </div>
  );
}
