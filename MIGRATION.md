# scoreboard-overlay Migration Plan

Progress tracking file for the multi-phase migration.
Mark tasks `[x]` when complete. Add notes under tasks as needed.

---

## Phase 1 — Vite Migration
> Replace CRA (react-scripts) with Vite. Do env var rename here before TypeScript renames files again.

- [x] Remove `react-scripts` from dependencies
- [x] Install `vite` and `@vitejs/plugin-react`
- [x] Create `vite.config.js` (port 3001, path alias `@/` → `src/`; note: `.js` not `.ts` until Phase 3)
- [x] Move `public/index.html` to project root; add `<script type="module" src="/src/index.jsx">`
- [x] Rename env var `REACT_APP_SOCKET_URL` → `VITE_SOCKET_URL` in `.env` files
- [x] Update the one reference in `App.jsx`: `process.env.REACT_APP_SOCKET_URL` → `import.meta.env.VITE_SOCKET_URL`
- [x] Update `package.json` scripts: `vite` / `vite build`
- [x] Add startup validation: if `VITE_SOCKET_URL` is undefined, log a clear error (currently silently builds broken icon URLs)
- [x] All JSX-containing `.js` files renamed to `.jsx` (Vite requires `.jsx` for JSX; old `.js` files are now re-export shims, deleted in Phase 3)
- [ ] Verify dev server starts on port 3001 and overlay renders correctly

---

## Phase 2 — Structure & Extractions (still in JS) ✅
> Move files to final locations before TypeScript so the rename pass doesn't also fight moves. Git history stays readable.

### 2a — Folder reorganization
- [x] Create `src/components/scoreboard/` and move `Scoreboard.jsx`, `Scoreboard.module.css`, `VerticalTableScoreboard.jsx`, `VerticalTableScoreboard.module.css`
- [x] Create `src/components/lower-thirds/` and move `LowerThirdMatchup`, `SocialMediaLowerThird`
- [x] Create `src/components/panels/` and move `MatchupPresentation`, `TeamComparisonTable`, `AfterMatchStats`, `SponsorsPanel`, `SubscribeAnimation`, `Lineup`
- [x] Create `src/components/shared/` and move `ContentFlipper`, `UniformIcon`, `DroplinePanel`
- [x] Update all import paths in consuming files
- [x] Verify build passes after moves

### 2b — Extractions from App.jsx
- [x] Extract `initialMatchDetails`, `initialMatchData`, `initialConfig` → `src/mockData.js`
- [x] Extract the ~80-line debug controls JSX → `src/components/DevControls.jsx`
- [x] Extract all socket wiring, `statusRef` pattern, and event handlers → `src/hooks/useSocket.js`; returns `{ matchDetails, matchData, config, setMatchData, setConfig, connectionStatus }`

### 2c — Scoreboard consolidation
- [x] Add `src/components/scoreboard/ScoreboardRouter.jsx` that owns `useDropline` and renders both variants
- [x] Lift the single `useDropline` call to `ScoreboardRouter` — eliminates silent duplicate timer
- [x] Both inner scoreboard components receive an `enabled` boolean directly
- [x] Verify build passes (1.56s, no errors)

---

## Phase 3 — TypeScript Migration ✅
> Structure is stable. Mechanical pass — no logic changes. Convert leaves before App.tsx so types are available top-down.

- [x] Install `typescript`, `@types/react`, `@types/react-dom` (socket.io-client ships its own types)
- [x] Add `tsconfig.json` with `strict: true`, `allowJs: true`, path alias matching vite config
- [x] Update `vite.config.js`: removed JSX-in-.js plugin option; added `.tsx/.ts` before `.jsx/.js` in resolve.extensions
- [x] Verify project builds before converting files

### 3a — Define shared types first
- [x] Create `src/types/matchDetails.ts`: `MatchDetails`, `SeasonStats`, `Player`
- [x] Create `src/types/matchData.ts`: `MatchData`, `MatchEvent`, `SetScore`, `MatchStats`
- [x] Create `src/types/config.ts`: `OverlayConfig` and all per-panel config types
- [x] Create `src/types/index.ts` re-exporting all types

### 3b — Convert files (leaves → App)
- [x] `src/utils/colorUtils.js` → `colorUtils.ts`
- [x] `src/hooks/useDropline.js` → `useDropline.ts` (exports `DroplinePanelData` interface)
- [x] `src/hooks/useComponentVisibility.js` → `useComponentVisibility.ts`
- [x] `src/hooks/useSocket.js` → `useSocket.ts`
- [x] `src/contexts/OverlayContext.jsx` → `OverlayContext.tsx` (uses `as React.CSSProperties` for `containerType`)
- [x] `src/mockData.js` → `mockData.ts`
- [x] `src/components/shared/` — all converted to `.tsx` with Props interfaces
- [x] `src/components/scoreboard/` — all converted to `.tsx` with Props interfaces
- [x] `src/components/lower-thirds/` — all converted to `.tsx`
- [x] `src/components/panels/` — all converted to `.tsx`
- [x] `src/components/DevControls.jsx` → `DevControls.tsx`
- [x] `src/App.jsx` → `App.tsx`
- [x] `src/index.jsx` → `index.tsx`
- [x] Spanish comments translated to English
- [x] All old `.jsx`/`.js` shims deleted; build verified: `✓ built in 1.55s`
- [x] Remove `allowJs: true` from tsconfig (all .js source files gone)

### 3c — Testing setup
- [x] Install `vitest`, `@vitest/ui`, `jsdom`
- [x] Add `vitest.config.ts` (separate from vite.config.js, uses jsdom environment)
- [x] `src/setupTests.js` → `setupTests.ts`; old CRA boilerplate test replaced with `DroplinePanel` unit tests
- [x] Add `test`, `test:watch`, `test:ui` scripts to package.json
- [x] 3/3 tests pass; build still clean (`✓ built in 1.56s`)

---

## Phase 4 — Code Quality & Reliability ✅
> Safety nets before Phase 5 introduces runtime-dynamic theming. ErrorBoundary is a typed class component, easier now that TS is in place.

- [x] Fix `useComponentVisibility` initial state: initialize `currentClass` to `'fade-in'` when `isEnabledStatus=true` on mount — eliminates classless flash
- [x] Extract `FLIPPER_SIZE` and `MAX_TIMEOUTS` to `src/constants.ts`; both scoreboard components import from there (note: sizes unified to `'2.3rem'`)
- [x] Add `src/components/shared/ErrorBoundary.tsx` — typed class component; renders `null` on error; logs panel name to console
- [x] Wrap all 9 top-level panels in App.tsx with `<ErrorBoundary name="...">` — one broken panel cannot blank the broadcast
- [x] Build `✓ 1.56s`, tests 3/3 pass

---

## Phase 5 — Unified Theme System
> Requires TypeScript for typed token contracts. Build static CSS layer first, then wire dynamic socket theming.

### 5a — Static token layer
- [ ] Create `src/theme/tokens.ts`: typed `theme` object with `colors`, `font`, `spacing`, `animation`, `radius`; values match current hardcoded hex values exactly (nothing breaks yet)
- [ ] Create `src/theme/theme.css`: `:root { --color-primary: ...; }` — one variable per token
- [ ] Create `src/theme/index.ts` re-exporting `theme`
- [ ] Import `theme.css` once in `index.tsx`

### 5b — Migrate CSS modules
- [ ] Refactor `src/components/scoreboard/` `.module.css` files to use `var(--token)` instead of hardcoded values
- [ ] Refactor `src/components/lower-thirds/` `.module.css` files
- [ ] Refactor `src/components/panels/` `.module.css` files
- [ ] Refactor `src/components/shared/` `.module.css` files
- [ ] Refactor `src/App.css` and `src/index.css`

### 5c — Dynamic socket theming
- [ ] Add `theme` key to `OverlayConfig` type in `src/types/config.ts`
- [ ] Add `applyTheme(theme: ThemeTokens)` in `useSocket.ts` that calls `document.documentElement.style.setProperty()` for each token
- [ ] Call `applyTheme` on `handshake-response` and `updateConfig` events when a theme object is present
- [ ] Keep `matchDetails.teamColors` as separate inline style concern — does not go through the theme system
- [ ] Verify theme persists across socket reconnections (re-apply on reconnect)

---

## Phase 6 — matchEvent Data Model (Cross-Project)
> Last because it touches three projects simultaneously. Use strangler-fig rollout — no big-bang deployment.
> Requires coordination with `volleyball-score-tracker` and `socketio-server`.

- [ ] **socketio-server**: add relay for new `matchEvent` channel; keep dual-emitting on old `matchData` (with embedded event) simultaneously — no clients break yet
- [ ] **volleyball-score-tracker**: emit on new `matchEvent` channel in addition to (then instead of) embedding in `matchData`
- [ ] **scoreboard-overlay** (`useSocket.ts`): add `socket.on('matchEvent', ...)` listener; wire to a separate `matchEvent` state slot; update `ScoreboardRouter` and dropline to consume it
- [ ] Verify dropline panel triggers correctly from the new channel
- [ ] Remove embedded `matchEvent` from `matchData` type and state
- [ ] Remove legacy dual-emit from `socketio-server` once all three projects are confirmed working

---

## Status Legend
- `- [ ]` Not started
- `- [x]` Complete
- `- [-]` Skipped / decided against
