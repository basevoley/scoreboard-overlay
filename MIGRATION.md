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

## Phase 5 — Unified Theme System [-]
> Superseded by Phase 7. Theme tokens belong in `overlaySetup` alongside social channels and sponsors.
> The CSS variable layer (originally 5b) is carried into Phase 7 as sub-step 7d.

- [-] 5a — Static token layer
- [-] 5b — Migrate CSS modules to `var(--token)`
- [-] 5c — Dynamic socket theming via `updateConfig`

---

## Phase 6 — matchEvent Data Model (Cross-Project) ✅
> Touches all three projects simultaneously. Strangler-fig rollout — no big-bang deployment.

- [x] **socketio-server**: add relay for new `matchEvent` channel
- [x] **volleyball-score-tracker**: refactored `useBroadcast.ts` — `MatchEventPayload` type, removed `matchEvent` from `OverlayPayload`, emits `matchEvent` on dedicated channel; `buildMatchPayload` no longer embeds event
- [x] **scoreboard-overlay** (`useSocket.ts`): added `socket.on('matchEvent', ...)` listener; `matchEvent` state slot; returns `matchEvent` + `setMatchEvent`
- [x] **scoreboard-overlay** (`ScoreboardRouter.tsx`): accepts `matchEvent` prop; passes `matchEvent ?? NULL_EVENT` to `useDropline`
- [x] **scoreboard-overlay** (`DevControls.tsx`): replaced `setMatchData` prop with `setMatchEvent`; `triggerMatchEvent` sets standalone event state
- [x] **scoreboard-overlay** (`App.tsx`): passes `matchEvent` to `ScoreboardRouter`; passes `setMatchEvent` to `DevControls`
- [x] Remove embedded `matchEvent` from `MatchData` type and `initialMatchData` mock
- [x] Build verified clean (`✓ built in 1.60s`)

---

## Phase 7 — overlaySetup: Broadcaster Identity & Appearance
> Introduces `overlaySetup` as a dedicated socket channel carrying broadcaster-level static config —
> social channels, sponsor images/timing, and theme tokens. Splits `Config`/`OverlayConfig` into
> `RuntimeConfig` (live operator toggles, sent on every change) and `OverlaySetup` (set once per
> broadcaster, sent at handshake and re-emitted only on explicit save from Ajustes tab).
>
> `updateConfig` becomes small and frequent (toggles/positions only).
> `overlaySetup` is larger but emitted sparingly.
>
> Touches all three projects. Implement in order: server → overlay → tracker.

### 7a — Type definitions (both projects)
- [ ] Define `OverlaySetup` interface:
  - `socialMedia: { channels: SocialChannel[] }`
  - `sponsors: { imageUrls: string[]; displayTime: number }`
  - `theme: ThemeTokens` (placeholder — empty object until 7d)
- [ ] Define `RuntimeConfig`: current `Config` minus the static fields above
  - `socialMedia` retains `{ enabled, position }`
  - `sponsors` retains `{ enabled }`
- [ ] Update `OverlayConfig` (overlay) and `Config` (tracker) to match the split
- [ ] Split `initialConfig` into `initialRuntimeConfig` + `initialOverlaySetup` in both projects

### 7b — Socket protocol (all three projects)
- [ ] **socketio-server**: add `overlaySetup` relay handler
- [ ] **volleyball-score-tracker** (`useBroadcast.ts`):
  - `emit('updateConfig', runtimeConfig)` — runtime fields only, no channels/URLs/timing
  - Include `overlaySetup` in `handshake-response` alongside `matchData`, `matchDetails`, `runtimeConfig`
  - Add `emit('overlaySetup', overlaySetup)` path triggered by Ajustes save buttons
- [ ] **scoreboard-overlay** (`useSocket.ts`):
  - Add `overlaySetup` state slot + `socket.on('overlaySetup', ...)` listener
  - Merge `runtimeConfig` + `overlaySetup` into a single `config` object before returning — panel components stay unchanged
  - Update `handshake-response` handler to expect `runtimeConfig` + `overlaySetup` instead of monolithic `config`

### 7c — Ajustes UI (volleyball-score-tracker)
> Each section has its own "Guardar" button. Saving emits `overlaySetup` and persists to session storage.
> Rows are reordered with up/down arrow buttons.

- [ ] **"Redes Sociales" section** in `Settings.tsx`:
  - Dynamic list; each row: network name + handle + icon URL text inputs + icon `<img>` preview + up/down arrows + delete
  - "Añadir red social" button appends an empty row
  - "Guardar" emits `overlaySetup` and persists to session
- [ ] **"Patrocinadores" section** in `Settings.tsx`:
  - Dynamic list; each row: image URL text input + `<img>` preview + up/down arrows + delete
  - "Añadir patrocinador" button appends an empty row
  - Rotation time field (number input, ms) outside the list
  - "Guardar" emits `overlaySetup` and persists to session
- [ ] **"Apariencia" section** in `Settings.tsx`: placeholder `Paper` with "Próximamente" — wired in 7d
- [ ] Update `useSession.ts` to save/restore `overlaySetup` alongside existing session data
- [ ] Add `overlaySetup` state + setter to `ConfigContext` (or a new dedicated context)

### 7d — Theme tokens (Apariencia section)
> Deferred until 7c is stable. Socket plumbing from 7b already carries the `theme` field.

- [ ] Define `ThemeTokens` type: `colors` (primary, secondary, accent, background, text), `font`, `radius`, `animation`
- [ ] **scoreboard-overlay**: `src/theme/tokens.ts` with defaults matching current hardcoded values; `src/theme/theme.css` with `:root` CSS custom properties; imported once in `index.tsx`
- [ ] **scoreboard-overlay**: refactor all `.module.css` files to use `var(--token)` (scoreboard, lower-thirds, panels, shared, App.css, index.css)
- [ ] **scoreboard-overlay** (`useSocket.ts`): call `applyTheme(overlaySetup.theme)` on every `overlaySetup` received — writes `document.documentElement.style.setProperty()` per token; `teamColors` remain in `matchDetails`
- [ ] **volleyball-score-tracker** (`Settings.tsx`): replace "Apariencia" placeholder with color pickers per token
- [ ] Verify theme re-applies correctly on socket reconnection

---

## Status Legend
- `- [ ]` Not started
- `- [x]` Complete
- `- [-]` Skipped / decided against
