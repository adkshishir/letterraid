# LetterRaid — frontend

Next.js 16 (Turbopack) / React 19 / Tailwind v4. Forked from the Cahoots frontend on 2026-08-15,
carrying Heist and the shared shell and leaving Chain / Sync / Signal / Hunch behind.

Project-level docs are mirrored into `docs/` — start with `docs/OVERVIEW.md`, and see
`docs/RULES.md` and `docs/SOCKET_EVENTS.md` before changing gameplay or the protocol. The same
files are mirrored in the backend repo (`api.letterraid`); keep the two copies in sync by hand.

> Read `AGENTS.md` before writing code here — this is Next 16, and several of its APIs differ from
> what a model trained on Next 14/15 will assume (`params` is a Promise, `next lint` is gone,
> React Compiler lint rules are enforced).

## Layout

```
app/
  page.tsx          # hub — lists the games
  heist/            # game landing page + OG image
  room/[code]/      # the room, routed to a game by backend lookup
components/
  heist/            # game UI
  *.tsx             # shared shell: header, lobby, share modal, theme toggle
hooks/              # useSocket, useRoom, useHeistGame, useTheme
lib/                # socket singleton, types (mirror of the backend), site config
```

Adding a game means a route under `app/`, a component under `components/`, a hook, an entry in
`GAMES` in `app/room/[code]/RoomClient.tsx`, and an accent in `globals.css`. Nothing else in the
shell needs to know about it. See `games/future-docs/` for what's queued.

## Commands

```bash
npm install
npm run dev              # PORT 4041 by convention
npm run build
npm run typecheck
npm run lint
npm run test:e2e         # Playwright; boots both servers on 4141/4142
npm run audit:contrast   # WCAG check against the tokens in globals.css
```

## Ports

4041. The same box runs imposter on 4021/4022 and Cahoots on 4031/4032. Playwright uses 4141/4142
so a test run can never collide with a live server.

## Config

`NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_BACKEND_URL` live in `.env.production`, **not** in
`ecosystem.config.js`. They are inlined at build time, so pm2's env never reaches them — see the
comment in that file for the failure this prevents. Changing a domain requires a rebuild.
