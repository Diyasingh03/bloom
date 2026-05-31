# Bloom — Personal PCOS Management App

A personal iOS app I built after being diagnosed with PCOS. It combines menstrual cycle tracking, phase-synced workouts, PCOS-friendly meal planning, and a daily Gemini AI plan — all tuned to my actual life, constraints, and body.

---

## Why I built this

Getting a PCOS diagnosis comes with a lot of "here's what you should do" advice that almost never accounts for what your actual life looks like. Generic fitness apps don't know you're in your luteal phase and exhausted. Recipe apps don't know you only have a stovetop and a microwave and don't cook with raw meat. Period trackers show you your cycle but don't tell you what to do with that information.

I wanted one app that connected all of it — what phase I'm in, what I should eat today from what I actually have in my kitchen, what kind of workout makes sense for my body right now, and why. And I wanted it to feel nice enough that I'd actually open it every morning.

The other piece: I use Flo to track my periods and it has years of my data. I'm waiting on my JSON export, but in the meantime the app runs on 24 months of PCOS-realistic placeholder cycles (32–40 day irregular cycles) so everything works from day one.

---

## Thought process

**Cycle-first design.** Everything in the app flows from the current phase. PCOS cycles are longer and more irregular than average — the phase boundaries are adjusted for that (menstrual 1–5, follicular 6–13, ovulatory 14–(cycleLength−14), luteal remainder). The phase drives the workout intensity, meal anti-inflammatory focus, AI prompt context, and the colour of every card on screen.

**Real constraints, not aspirational ones.** The meals and workouts are built around what I actually have: a stovetop, a microwave, no oven; eggs, ham, spinach, arugula, avocado, dairy, frozen patties, chicken if I try; a pilates mat, water bottles, two gallon milk jugs (~8lb), a treadmill, and a stationary cycle. No gym for at least 12 weeks. Every static meal and workout in the app respects this — nothing recommends an oven or a barbell.

**One AI call a day, used well.** Gemini's free tier allows 20 requests per day. Rather than scatter small calls across features, I make one rich call on first app open — injecting the current phase, Flo predictions, live grocery list, equipment, and cooking constraints — cache the result for the whole day, and surface pieces of it across every tab. If the call fails, the app falls back to static data silently.

**Grocery list as context, not just a list.** The pantry tab isn't just a shopping list — it's the live input to the AI prompt. When I add a new ingredient, it shows up in tomorrow's meal suggestions. The connection is explicit: a banner on the pantry screen says "Your pantry is sent to the AI every day."

**Flo predictions as first-class data.** Rather than ignoring Flo's ovulation and next-period predictions, they're injected into the AI prompt so recommendations can shift — e.g. if ovulation is tomorrow, suggest a peak-energy workout today; if period is in two days, lean into anti-cramp foods and gentler movement.

---

## Features

| Tab | What it does |
|---|---|
| **Home** | Daily greeting, AI insight, today's breakfast and featured workout, quick symptom log |
| **Cycle** | SVG cycle wheel showing current day, phase history, Flo predictions card with edit + refresh |
| **Meals** | AI meal plan for today + browsable static meals filtered by phase |
| **Move** | AI workout of the day + static workouts filtered by phase, with full step-by-step detail modal |
| **Pantry** | Grocery/pantry list by category; toggling in-stock items updates the AI prompt |
| **Track** | Daily symptom logger across 8 PCOS symptoms (bloating, fatigue, acne, mood, hair changes, cravings, cramps, brain fog), 7-day history |

---

## Tech stack

| | |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Routing | Expo Router v6 (file-based) |
| AI | Gemini 2.0 Flash (REST, free tier) |
| Storage | AsyncStorage (all data local, no backend) |
| Animation | React Native Reanimated v4 |
| Graphics | React Native SVG (cycle wheel) |
| Dates | date-fns v4 |

---

## Setup

**Requirements:** Node.js 20+, Expo Go (SDK 54) on iPhone.

```bash
git clone <repo>
cd sync
npm install --legacy-peer-deps
```

Create a `.env` file in the root:

```
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com). The free tier allows 20 requests/day — more than enough since the app makes one per day.

```bash
npx expo start
# or on hotel/restricted WiFi:
npx expo start --tunnel
```

Scan the QR code with Expo Go. The app works fully without the API key — it just uses static meal and workout data instead of AI-generated content.

---

## Future plans

- **Real Flo data import** — `src/lib/floImport.ts` is ready to parse the Flo JSON export once I receive it; swapping in real cycle history replaces the placeholder data with no other code changes
- Symptom trend charts across the cycle
- Meal ingredient → grocery list shortcut (tap an ingredient to add it to Pantry)
- DoorDash deep-link for AI-suggested ingredients not in the pantry
