# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (requires Expo Go on device)
npx expo start

# Start with tunnel (for hotel/restricted WiFi)
npx expo start --tunnel

# Type check (no emit)
npx tsc --noEmit

# Install new packages — always use npx expo install for native modules
npx expo install <package-name>

# Install JS-only packages — always add --legacy-peer-deps
npm install <package-name> --legacy-peer-deps

# Regenerate private seed data from a new Flo export (outputs TS to stdout)
npx tsx data/floParser.ts flo.json > data/floData.ts
```

> Always use `--legacy-peer-deps` with plain `npm install` — there is a minor react version mismatch (19.1.0 installed vs 19.2.x expected by some sub-deps) that makes npm refuse otherwise.

## SDK Version

This project targets **Expo SDK 54** (React Native 0.81.5, React 19.1.0). Expo Go on the test device supports SDK 54. Do **not** upgrade to SDK 55/56 without also updating Expo Go.

Read versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing Expo-specific code.

## Architecture

### Routing layer (`app/`)

Thin files only — each just re-exports its screen from `src/`. All logic lives in `src/`. The route tree is:

```
app/_layout.tsx          ← Stack, headerShown false; mounts DisclaimerModal on first launch
app/(tabs)/_layout.tsx   ← 6-tab bar (Home, Cycle, Meals, Move, Pantry, Track)
app/(tabs)/index.tsx     ← HomeScreen
app/(tabs)/cycle.tsx     ← CycleScreen
app/(tabs)/meals.tsx     ← MealsScreen
app/(tabs)/workouts.tsx  ← WorkoutsScreen
app/(tabs)/groceries.tsx ← GroceriesScreen
app/(tabs)/track.tsx     ← TrackScreen
app/cycle-stats.tsx      ← CycleStatsScreen (pushed via router.push('/cycle-stats') from CycleScreen)
```

`app/_layout.tsx` checks `STORAGE_KEYS.DISCLAIMER_ACCEPTED` on mount and renders `<DisclaimerModal>` until the user acknowledges it. This is the only logic that lives in the routing layer.

### Feature modules (`src/features/`)

Vertical slices: each feature owns its `screens/`, `components/`, `hooks/`, `data/`, and `utils/`. Features do not import from each other — shared state flows via hooks passed as props or via the AI layer.

| Feature | Key hook | Purpose |
|---|---|---|
| `cycle/` | `useCycleData()` | Current phase, cycle day, predictions, import |
| `groceries/` | `useGroceryList()` | Pantry items — also feeds the AI prompt |
| `tracking/` | `useSymptomLog()` | Symptom logs persisted to AsyncStorage |
| `meals/` | static data only | Phase-filtered meal cards |
| `workouts/` | static data only | Phase-filtered workout cards + detail modal |
| `home/` | consumes cycle + AI | Dashboard screen |

### `useCycleData()` — key fields

```ts
cycleDay, phase, cycleLength, periodLength, lastPeriodStart  // current state
cycles: Cycle[]                                               // full history
computedPredictions: FloPredictions & { confidence: number } // auto-computed from history
predictions: FloPredictions | null                           // manual override ?? computedPredictions
savePredictions(p)     // save a manual override (isComputed: false)
clearManualPredictions()  // revert to computed
refreshCycle()         // reload from AsyncStorage (call after import)
```

Manual predictions take precedence over computed; computed are derived fresh on every render via `useMemo` and never stored to AsyncStorage.

### AI layer (`src/ai/`)

One Gemini call per day, cached in AsyncStorage at `@bloom_daily_ai`.

- **`src/lib/config.ts`** — single place that reads `EXPO_PUBLIC_GEMINI_API_KEY`; all AI code imports `config.geminiApiKey` from here, never `process.env` directly
- **`prompts/dailyPrompt.ts`** — builds the full prompt; injects phase, cycle day, in-stock grocery items, predictions, equipment list, and cooking constraints
- **`services/geminiService.ts`** — raw fetch to `gemini-2.5-flash:generateContent`, strips markdown fences, parses JSON, returns `DailyAIContent | null`
- **`hooks/useGeminiDaily.ts`** — cache check (stored date == today?), calls service if stale, falls back silently on error; exposes `regenerate()` to force a fresh call
- **`context/GeminiContext.tsx`** — `GeminiProvider` composes `useCycleData` + `useGroceryList` + `useGeminiDaily` into a single context; screens consume AI state via `useGemini()`, never the hook directly

When `isUsingFallback` is true, screens fall back to static data from `meals.ts` / `workouts.ts`.

### Cycle prediction engine (`src/features/cycle/utils/`)

- **`cycleCalculations.ts`** — PCOS-adjusted phase boundaries: menstrual 1–5, follicular 6–13, ovulatory 14–(cycleLength−14), luteal remainder. `getAverageCycleLength` filters cycles shorter than 15 days to exclude anomalies.
- **`cyclePredictions.ts`** — `computePredictions(cycles)` is the primary prediction source. Uses exponential decay weighting (decay=0.7) over the last 6 complete cycles (≥15 days) anchored to the most recent period start. Derives ovulation from average luteal phase computed from historical `cycle.ovulation` fields (consistently ~15 days). Returns `FloPredictions & { confidence: number }` where `confidence` is the std dev of recent cycle lengths in days.

`floPlaceholder.ts` is a **fallback-only template** with synthetic cycles used when no private data exists. The real seed data lives in `data/floData.ts` (gitignored) — see the Private seed data section below. `useCycleData()` prefers `data/floData.ts` over the placeholder via `floUserData ?? floPlaceholderData`.

### Cycle stats screen (`src/features/cycle/`)

- **`utils/cycleStats.ts`** — `computeCycleStats(cycles)` returns `CycleStats` with averages, std dev, trend direction, regularity change, `chartCycles: ChartCycle[]`, and `ovulationPoints: OvulationPoint[]`. Trend compares mean of last 4 vs prior 4 complete cycles; regularity compares stdDev of each half.
- **`screens/CycleStatsScreen.tsx`** — SVG bar charts for cycle length, period length, and ovulation timing. Charts use a fixed `BAR_W = 18px` and are wrapped in horizontal `ScrollView` so they scroll with 30+ cycles rather than squishing. Each chart has a fixed Y-axis column (`AXIS_W = 30`) outside the scroll area.

### Shared components (`src/components/`)

Cross-feature primitives and app-level modals:
- `Card`, `PhaseGradient`, `PhasePills`, `AIStatusBadge` — UI primitives used across features
- `DisclaimerModal` — first-launch medical disclaimer (not dismissable until acknowledged)
- `PrivacyPolicyModal` — scrollable privacy policy; opened from `DisclaimerModal` and from the ℹ️ button in `HomeScreen`

Do not add feature-specific components here.

### Types (`src/types/index.ts`)

Single source of truth. Key additions: `Cycle.ovulation?: string` (optional, from Flo data), `FloPredictions.confidence?: number` and `FloPredictions.isComputed?: boolean` (distinguishes algorithm output from manual overrides).

### Storage (`src/lib/storage.ts`)

All AsyncStorage access goes through `storageGet<T>` / `storageSet<T>` / `storageRemove`. Keys are typed via `STORAGE_KEYS`:

| Key | Stores |
|-----|--------|
| `@bloom_flo_data` | `FloData` (cycles array) |
| `@bloom_flo_predictions` | Manual `FloPredictions` overrides only |
| `@bloom_daily_ai` | Cached `DailyAIContent` (per day) |
| `@bloom_symptoms` | Symptom logs |
| `@bloom_groceries` | Grocery list |
| `@bloom_disclaimer_accepted` | `boolean` — first-launch gate |

Computed predictions are **never** written to storage — they are derived on demand.

### Design system (`src/constants/theme.ts`)

`Colors`, `PhaseThemes`, `Spacing`, `Radius`, `Typography` are the only sources of truth for visual values. `PhaseThemes[phase].primary` drives phase-tinted UI. All backgrounds are `Colors.white` — no off-white surfaces.

### Flo import (`src/lib/floImport.ts`)

Unified parser for three Flo export formats:
- `parseFloJson()` — app's own simplified JSON (`{ cycles: [...] }`)
- `parseFloJsonExport()` — raw `flo.json` from Flo app (`operationalData.cycles` + `point_events_manual_v2`)
- `parseFloTxtExport()` — `res.txt` text export from Flo app

`parseAnyFloData(raw)` auto-detects format and returns `{ data: FloData; format: FloImportFormat } | null`. Used by `ImportCycleModal`, which supports both file picking (`expo-document-picker` + `expo-file-system`) and paste input.

### Constraints (`src/lib/defaultConstraints.ts`)

`DEFAULT_CONSTRAINTS` (type `UserConstraints`) holds the current cooking appliances, equipment list, and dietary notes. `EQUIPMENT_OPTIONS` is the full selectable list. These feed into the AI prompt via `GeminiContext`.

### Private seed data (`data/`)

`data/` is gitignored. Anyone cloning the repo gets only the placeholder; the owner's real data lives here. `scripts/ensure-flo-data.js` writes a null stub `data/floData.ts` when the real file is absent (run automatically as the first step of the Vercel `buildCommand`; fresh clones should run `node scripts/ensure-flo-data.js` once before `npx expo start`). It never touches an existing file.

- **`data/floData.ts`** — real cycle history exported as `floUserData: FloData`; imported by `useCycleData()` as the default seed
- **`data/floParser.ts`** — dev-only script to regenerate `floData.ts` from a new Flo export:

```bash
# Regenerate data/floData.ts from a new flo.json export
npx tsx data/floParser.ts flo.json > data/floData.ts

# Or from res.txt
npx tsx data/floParser.ts res.txt > data/floData.ts
```

The parser extracts ovulation dates from both Eggwhite fluid events (observed) and `additional_fields` ML predictions (fallback). Stats go to stderr; TypeScript source goes to stdout.

## Environment

`EXPO_PUBLIC_GEMINI_API_KEY` in `.env` (gitignored). Access via `config.geminiApiKey` from `src/lib/config.ts`. Without a valid key, `geminiService.ts` returns `null` and the app runs entirely on static data.


## Key constraints (baked into AI prompt and static data)

- Cooking: stovetop and microwave **only** — no oven
- Workout equipment: pilates mat, water bottles, two ~8lb gallon milk jugs, treadmill, stationary cycle — no gym
- Pantry defaults: potato, onion, spinach, arugula, avocado, eggs, ham, frozen patties, chicken, Greek yogurt, cheese, milk, olive oil, cinnamon, rolled oats
