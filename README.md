# 🎭 Slip It In

> Say the line. Blend it into the conversation. Don't get caught.

**▶️ Play: [slip-it-in.vercel.app](https://slip-it-in.vercel.app)**

A mobile party game where every player holds secret cards, and each card is a sentence you have to say out loud — slipped naturally into a real conversation. Pull it off unnoticed and the card is yours. Get read by the table and you pay for it.

Card content is written in **Brazilian Portuguese** 🇧🇷 · code and identifiers in English.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3FCF8E?logo=supabase&logoColor=white)
![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18?logo=vitest&logoColor=white)

---

## 🎯 How it plays

Everyone sits in the same room and talks about whatever. Each player holds **5 secret cards** on their own phone.

| Step | What happens |
| :--: | ------------ |
| 1️⃣ | You get 5 cards. Only you can see them — ever. |
| 2️⃣ | Each card holds a sentence you must say **out loud**, woven into the conversation. |
| 3️⃣ | Before trying, you **arm** the card. Nobody sees this. It stays live for **90 seconds**. |
| 4️⃣ | Said it clean? Tap **Encaixei**. The card is revealed to the table and drops into the slot. |
| 5️⃣ | Smell a setup? **Accuse.** If they were holding an armed card, you nailed it. |
| 6️⃣ | Accuse wrong and the penalty is yours. **First player to empty their hand wins.** |

It is *not* a question-and-answer game. The whole point is the smuggling.

---

## 🔐 Why "arming" a card exists

The obvious version of this game is trivially cheatable online: open the app, tap *"I said it"* five times, win in eight seconds without opening your mouth. Around a physical table everyone watches you push the card into the box. On separate phones, nobody sees anything.

Arming fixes that by creating **a window where you are exposed**:

- ✅ You cannot claim a card without arming it first
- ✅ You cannot un-arm it — it only expires
- ✅ The 90s clock is **server-authoritative**, so changing your phone's time does nothing
- ✅ An accusation resolves against real state — **nobody gets to lie about it**

Followed by a **30-second contest window**, where the table votes on whether you actually said the line.

---

## ✨ Features

- 📱 **Multiplayer on separate phones** — join a room with a 6-character code, check your hand whenever you want
- ⚡ **Realtime table** — live feed, live accusations, no refreshing
- 🃏 **400 original cards** across 10 categories
- 🔞 **Two independent 18+ tiers** — 50 flirty and 50 explicit cards, each gated separately and kept out of the deck entirely when off
- 🏆 **Cross-match scoreboard** — points accumulate per player name on the device, with reset
- 🎬 **Slot animation** — cards physically drop into the box, `transform`/`opacity` only, 60fps on cheap phones
- ♿ **`prefers-reduced-motion`** respected throughout

---

## 🎴 The deck

400 cards, IDs `001`–`400`, verified by test:

| Category | Cards | Range |
| -------- | :---: | ----- |
| 🟢 Cotidiano (everyday) | 60 | `001`–`060` |
| 😂 Absurdas (absurd) | 40 | `061`–`100` |
| 🧠 Inteligentes (clever) | 40 | `101`–`140` |
| 😈 Suspeitas (suspicious) | 35 | `141`–`175` |
| 🗣️ Sociais (social) | 30 | `176`–`205` |
| 🤡 Constrangedoras (embarrassing) | 25 | `206`–`230` |
| 🎭 Plausíveis (plausible) | 20 | `231`–`250` |
| 🔥 Picantes (spicy, 18+) | 50 | `251`–`300` |
| 🌶️ Muito picantes (explicit, 18+) | 50 | `301`–`350` |
| 🎤 Cultura pop (pop culture) | 50 | `351`–`400` |

```ts
{
  id: "001",
  text: "Eu sempre acho que vou lembrar onde coloquei isso.",
  category: "DAILY_LIFE",
  difficulty: "EASY",
  isAdult: false,
  contentLevel: "REGULAR",
  tags: [],
}
```

---

## 🛠️ Stack

| Layer | Choice |
| ----- | ------ |
| Framework | Next.js 16 · App Router · React 19 |
| Language | TypeScript, strict |
| Styling | Tailwind CSS 4 |
| State | Realtime state in Supabase (Postgres + RLS) |
| Writes | Route handlers holding the authoritative game logic |
| Tests | Vitest |

**Why a server owns the writes:** a static client plus a public database means anyone with DevTools reads every hand in the room. Hands live behind Row Level Security, and every mutation goes through a route handler that runs the pure rules in `lib/game`.

---

## 📂 Structure

```
src/
├── app/            # routes, layout, global theme
├── components/
│   ├── cards/      # card faces, the slot, insert animation
│   ├── screens/    # one file per screen
│   └── ui/         # buttons, sheets, primitives
├── data/
│   ├── deck/       # the 400 cards, one file per category
│   └── copy.ts     # every Portuguese string, in one place
├── hooks/
├── lib/
│   ├── game/       # pure rules — no React, no I/O
│   └── scoreboard/ # scoring and persistence
├── types/
└── utils/
tests/              # deck integrity, dealing, accusation, scoring
```

Card sentences never live inside components. The deck is plain data, ready to move behind an API.

---

## 🚀 Running locally

```bash
pnpm install
cp .env.example .env.local   # fill in your Supabase project values
pnpm dev                     # http://localhost:1000
```

```bash
pnpm test         # run the suite
pnpm test:watch   # watch mode
pnpm build        # production build
```

### Environment

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

The secret key is server-side only. It bypasses RLS — never ship it to the client.

---

## 🧪 Tests

The suite guards the rules that are easy to break by accident:

- 🎴 Deck holds exactly **400** cards with unique, contiguous IDs
- 🔞 Exactly **100** cards flagged `isAdult`, split 50/50 across the two tiers
- 🚫 **No** adult card can be dealt while its tier is off, and explicit cards stay out unless 18+ is on too
- 🤝 Dealing, claiming, accusing, penalties, and win detection
- 🏆 Scoring math, including the empty-pile fallback

---

## 🗺️ Roadmap

- [x] 400-card deck with integrity tests
- [x] Pure, tested game rules
- [x] Mobile-only visual system with slot animation
- [x] Supabase schema with RLS-protected hands
- [x] Rooms, join codes, realtime table
- [x] Arm / claim / contest flow end to end
- [x] Deploy on Vercel
- [x] Cross-match scoreboard
- [ ] Custom decks and card authoring
- [ ] Match history and stats

---

## 📜 Notes

All 400 card sentences, the visual system, and the code in this repository are original work. Game mechanics are not copyrightable; no assets or text were taken from any existing product.

Built for playing in person, on cheap phones, with people who talk too much. 🗣️
