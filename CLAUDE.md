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
```

> Always use `--legacy-peer-deps` with plain `npm install` — there is a minor react version mismatch (19.1.0 installed vs 19.2.x expected by some sub-deps) that makes npm refuse otherwise.

## SDK Version

This project targets **Expo SDK 54** (React Native 0.81.5, React 19.1.0). Expo Go on the test device supports SDK 54. Do **not** upgrade to SDK 55/56 without also updating Expo Go.

Read versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing Expo-specific code.

## Architecture

### Routing layer (`app/`)

Thin files only — each just re-exports its screen from `src/`. All logic lives in `src/`. The route tree is:

```
app/_layout.tsx          ← Stack, headerShown false
app/(tabs)/_layout.tsx   ← 6-tab bar (Home, Cycle, Meals, Move, Pantry, Track)
app/(tabs)/index.tsx     ← HomeScreen
app/(tabs)/cycle.tsx     ← CycleScreen
app/(tabs)/meals.tsx     ← MealsScreen
app/(tabs)/workouts.tsx  ← WorkoutsScreen
app/(tabs)/groceries.tsx ← GroceriesScreen
app/(tabs)/track.tsx     ← TrackScreen
```

### Feature modules (`src/features/`)

Vertical slices: each feature owns its `screens/`, `components/`, `hooks/`, `data/`, and `utils/`. Features do not import from each other — shared state flows via hooks passed as props or via the AI layer.

| Feature | Key hook | Purpose |
|---|---|---|
| `cycle/` | `useCycleData()` | Current phase, cycle day, Flo predictions |
| `groceries/` | `useGroceryList()` | Pantry items — also feeds the AI prompt |
| `tracking/` | `useSymptomLog()` | Symptom logs persisted to AsyncStorage |
| `meals/` | static data only | Phase-filtered meal cards |
| `workouts/` | static data only | Phase-filtered workout cards + detail modal |
| `home/` | consumes cycle + AI | Dashboard screen |

### AI layer (`src/ai/`)

One Gemini call per day, cached in AsyncStorage at `@bloom_daily_ai`.

- **`prompts/dailyPrompt.ts`** — builds the full prompt; injects phase, cycle day, in-stock grocery items, Flo predictions, equipment list, and cooking constraints
- **`services/geminiService.ts`** — raw fetch to `gemini-2.0-flash:generateContent`, strips markdown fences, parses JSON, returns `DailyAIContent | null`
- **`hooks/useGeminiDaily.ts`** — cache check (stored date == today?), calls service if stale, falls back silently on error; exposes `regenerate()` to force a fresh call

When `isUsingFallback` is true, screens fall back to static data from `meals.ts` / `workouts.ts`.

### Storage (`src/lib/storage.ts`)

All AsyncStorage access goes through `storageGet<T>` / `storageSet<T>` / `storageRemove`. Keys are typed via the `STORAGE_KEYS` const — add new keys there, not inline.

### Design system (`src/constants/theme.ts`)

`Colors`, `PhaseThemes`, `Spacing`, `Radius`, `Typography` are the only sources of truth for visual values. `PhaseThemes[phase].primary` drives phase-tinted UI. All backgrounds are `Colors.white` — no off-white surfaces.

### Cycle phase logic (`src/features/cycle/utils/cycleCalculations.ts`)

PCOS-adjusted phase boundaries: menstrual days 1–5, follicular 6–13, ovulatory 14–(cycleLength−14), luteal remainder. Phase is derived from `useCycleData()` which reads placeholder Flo data until a real Flo JSON export is imported via `src/lib/floImport.ts`.

## Environment

`EXPO_PUBLIC_GEMINI_API_KEY` in `.env` (gitignored). Without a valid key, `geminiService.ts` returns `null` and the app runs entirely on static data.

## Key constraints (baked into AI prompt and static data)

- Cooking: stovetop and microwave **only** — no oven
- Workout equipment: pilates mat, water bottles, two ~8lb gallon milk jugs, treadmill, stationary cycle — no gym
- Pantry defaults: potato, onion, spinach, arugula, avocado, eggs, ham, frozen patties, chicken, Greek yogurt, cheese, milk, olive oil, cinnamon, rolled oats
