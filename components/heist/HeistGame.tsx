"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Trophy, Zap } from "lucide-react";
import RoundTimer from "@/components/RoundTimer";
import { useHeistGame } from "@/hooks/useHeistGame";
import type {
  HeistClaimedPayload,
  HeistScore,
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
  onGoHome,
  onPhaseChange,
}: {
  roomCode: string;
  playerId: string | null;
  players: Player[];
  /** Leaves the room and returns to the homepage. */
  onGoHome: () => void;
  /**
   * Reports whether the round is actively being played, so the room chrome
   * (header, back button) can get out of the way during it — see
   * `RoomClient`. Not called for the lobby (this component isn't mounted
   * yet) or for a game that hasn't loaded its first state.
   */
  onPhaseChange?: (playing: boolean) => void;
}) {
  const game = useHeistGame(roomCode, playerId);
  const { state } = game;
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onPhaseChange?.(state?.status === "playing");
    // Leaving this screen entirely (unmount) always means chrome should come
    // back — a dropped connection or navigating away shouldn't strand the
    // header hidden.
    return () => onPhaseChange?.(false);
  }, [state?.status, onPhaseChange]);

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
        players={players}
        nameFor={nameFor}
        onRestart={game.restart}
        onGoHome={onGoHome}
        trophyDeltas={game.gameOver?.trophyDeltas}
      />
    );
  }

  // A 2v2 room hands every player a `team` (0 or 1); a 1v1 room leaves it null
  // for everyone. That's the only signal we need to switch from "you vs them"
  // to "your team vs theirs" — no separate flag to keep in sync.
  const hasTeams = players.some((p) => p.team !== null);
  const teamFor = (id: string) => players.find((p) => p.id === id)?.team ?? null;
  const myTeam = playerId ? teamFor(playerId) : null;

  const mine = state.words.filter((w) => w.ownerId === playerId);
  const theirs = state.words.filter((w) => w.ownerId !== playerId);
  const myTeamWords = state.words.filter((w) => teamFor(w.ownerId) === myTeam);
  const theirTeamWords = state.words.filter(
    (w) => teamFor(w.ownerId) !== myTeam,
  );
  const scoreFor = (id: string | null) =>
    state.scores.find((s) => s.playerId === id)?.score ?? 0;
  const opponentId = players.find((p) => p.id !== playerId)?.id ?? null;

  return (
    <div className="flex flex-col gap-5 py-5">
      {hasTeams ? (
        <div className="flex items-center justify-between">
          <TeamTally
            title="Your team"
            scores={state.scores.filter((s) => s.team === myTeam)}
            nameFor={nameFor}
            mine
          />
          <RoundTimer
            secondsLeft={secondsLeft}
            totalSeconds={HEIST_ROUND_SECONDS}
            size="sm"
          />
          <TeamTally
            title="Their team"
            scores={state.scores.filter((s) => s.team !== myTeam)}
            nameFor={nameFor}
          />
        </div>
      ) : (
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
      )}

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
          // Tapping the submit button (as opposed to pressing Enter/Done on a
          // keyboard) blurs the input — get it right back so the keyboard
          // stays up and the next word can start immediately.
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
      >
        <div className="relative">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            aria-label="Claim a word"
            placeholder="Type a word…"
            className={`w-full rounded-md border bg-surface py-3 pl-4 pr-14 text-center font-mono text-lg uppercase tracking-widest text-ink outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-muted/50 focus:border-accent ${
              game.error ? "animate-shake border-danger" : "border-border-strong"
            }`}
            // Re-keying on the error restarts the shake for a repeated message.
            key={game.error?.key ?? "input"}
          />
          {/* Explicit tap target alongside the keyboard's own Enter/Done key —
              either one submits, so nobody has to guess which does. */}
          <button
            type="submit"
            disabled={!value.trim()}
            aria-label="Submit word"
            className="pressable absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-on-fill transition-opacity disabled:bg-transparent disabled:text-muted disabled:opacity-40"
          >
            <Check size={18} />
          </button>
        </div>
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
        {hasTeams ? (
          <>
            <WordColumn title="Your team's words" words={myTeamWords} mine />
            <WordColumn title="Their words" words={theirTeamWords} />
          </>
        ) : (
          <>
            <WordColumn title="Yours" words={mine} mine />
            <WordColumn
              title={opponentId ? nameFor(opponentId) : "Theirs"}
              words={theirs}
            />
          </>
        )}
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

/**
 * The 2v2 header tally: a combined team total up top (the number that
 * matters mid-race), with each teammate's individual score nested under it
 * rather than dropped — this is the same "you vs them" number the 1v1
 * `Tally` shows, just summed across a team of two.
 */
function TeamTally({
  title,
  scores,
  nameFor,
  mine = false,
}: {
  title: string;
  scores: HeistScore[];
  nameFor: (id: string) => string;
  mine?: boolean;
}) {
  const total = scores.reduce((sum, s) => sum + s.score, 0);
  return (
    <div className={`flex flex-col ${mine ? "items-start" : "items-end"}`}>
      <span className="text-xs uppercase tracking-widest text-muted">
        {title}
      </span>
      <span
        className={`font-mono text-2xl font-bold ${mine ? "text-accent" : "text-ink"}`}
      >
        {total}
      </span>
      <div className={`mt-0.5 flex flex-col ${mine ? "items-start" : "items-end"}`}>
        {scores.map((s) => (
          <span key={s.playerId} className="text-[10px] text-muted">
            {nameFor(s.playerId)} · {s.score}
          </span>
        ))}
      </div>
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
  players,
  nameFor,
  onRestart,
  onGoHome,
  trophyDeltas,
}: {
  state: HeistStateView;
  playerId: string | null;
  players: Player[];
  nameFor: (id: string) => string;
  onRestart: () => void;
  onGoHome: () => void;
  trophyDeltas?: Record<string, number> | null;
}) {
  const result = state.result!;
  const hasTeams = result.teamScores != null;
  const myTeam = playerId
    ? (players.find((p) => p.id === playerId)?.team ?? null)
    : null;
  const won = hasTeams
    ? result.winningTeam === myTeam
    : result.winnerId === playerId;

  const headline = result.tied
    ? "Dead level."
    : won
      ? hasTeams
        ? "Your team had it."
        : "You had it."
      : hasTeams
        ? "Their team had it."
        : `${nameFor(result.winnerId ?? "")} had it.`;

  // "Team A wins, 14–9" / "Dead level, 11–11" — the same number the header
  // was already showing live, just confirmed by the server's final tally.
  const teamScoreLine = (() => {
    if (!result.teamScores) return null;
    const teamA = result.teamScores.find((t) => t.team === 0)?.score ?? 0;
    const teamB = result.teamScores.find((t) => t.team === 1)?.score ?? 0;
    if (result.tied) return `Dead level, ${teamA}–${teamB}`;
    const winnerLabel = result.winningTeam === 0 ? "Team A" : "Team B";
    const [hi, lo] = teamA >= teamB ? [teamA, teamB] : [teamB, teamA];
    return `${winnerLabel} wins, ${hi}–${lo}`;
  })();

  const teamFor = (id: string) => players.find((p) => p.id === id)?.team ?? null;
  const myWords = state.words.filter((w) => w.ownerId === playerId);
  const theirWords = state.words.filter((w) => w.ownerId !== playerId);
  const myTeamWords = state.words.filter((w) => teamFor(w.ownerId) === myTeam);
  const theirTeamWords = state.words.filter(
    (w) => teamFor(w.ownerId) !== myTeam,
  );

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="relative text-center">
        {won && <Confetti />}
        <Trophy
          size={36}
          className={`relative mx-auto ${
            won ? "animate-trophy-burst text-accent" : "text-muted"
          }`}
          aria-hidden
        />
        <h2
          className={`relative mt-4 text-2xl font-bold text-ink ${
            won ? "text-glow-gold" : ""
          }`}
        >
          {headline}
        </h2>
        {teamScoreLine && (
          <p className="mt-1 text-sm text-muted">{teamScoreLine}</p>
        )}
        <div className="mt-4 flex items-center justify-center gap-6">
          {result.scores.map((score) => {
            const delta = trophyDeltas?.[score.playerId];
            return (
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
                {typeof delta === "number" && (
                  <span
                    className={`mt-1 font-mono text-xs font-bold ${
                      delta > 0
                        ? "text-emerald-500"
                        : delta < 0
                          ? "text-red-400"
                          : "text-muted"
                    }`}
                  >
                    {delta > 0 ? "+" : ""}
                    {delta} 🏆
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {hasTeams ? (
          <>
            <WordColumn title="Your team's words" words={myTeamWords} mine />
            <WordColumn title="Their words" words={theirTeamWords} />
          </>
        ) : (
          <>
            <WordColumn title="Yours" words={myWords} mine />
            <WordColumn title="Theirs" words={theirWords} />
          </>
        )}
      </div>

      <div className="mx-auto flex items-center gap-3">
        <button
          type="button"
          onClick={onGoHome}
          className="pressable rounded-full border border-border px-6 py-3 text-sm font-bold text-ink"
        >
          Back to Home
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="pressable rounded-full bg-accent px-8 py-3 text-sm font-bold text-on-fill"
        >
          Run it back
        </button>
      </div>
    </div>
  );
}

/**
 * A contained confetti burst behind the trophy/headline on a win — not a
 * full-screen takeover, and it never intercepts clicks (the buttons below
 * still work immediately). `useState`'s lazy initializer runs exactly once
 * per mount, which is also exactly once per game-over: `Result` only exists
 * while `state.status === "complete"`, so a fresh win gets a fresh mount.
 */
function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 32 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1.4 + Math.random() * 1.1,
      spin: 220 + Math.random() * 360,
      size: 5 + Math.random() * 5,
      round: Math.random() > 0.5,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    })),
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 -top-2 overflow-hidden"
      aria-hidden
    >
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="animate-confetti-fall absolute top-0"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.round ? "9999px" : "2px",
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            ["--confetti-spin" as string]: `${piece.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}

// Drawn from the palette already in use around the result screen: the accent
// used on "you" scores, the brand's cyan, the steal-callout warning color,
// and the same emerald used for a positive trophy delta above.
const CONFETTI_COLORS = [
  "var(--accent)",
  "var(--brand-2)",
  "var(--warning)",
  "#10b981",
];
