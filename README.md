# CodingZone — Frontend & Fullstack Learning Tracker

An AI-powered personal learning tracker built with React + Vite + TypeScript, deployed on Vercel.
Tracks your curriculum progress, runs AI-generated exams, simulates job interviews, and gives you
a real-time Junior / Mid / Senior readiness score.

---

## Stack

- **React 18 + TypeScript + Vite** — frontend
- **Tailwind CSS** — styling
- **React Router v6** — navigation
- **Vercel** — hosting + serverless functions
- **Anthropic Claude API** — exam generation, grading, interview simulation
- **localStorage** — progress persistence (no database needed)

---

## Setup — Step by Step

### 1. Clone and install

```bash
git clone <your-repo-url>
cd codingzone
npm install
```

### 2. Get your Anthropic API key

Go to https://console.anthropic.com → API Keys → Create Key
Copy the key — you will not see it again.

### 3. Set up environment variables for local dev

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```
ANTHROPIC_API_KEY=sk-ant-...your key here...
```

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:5173

> Note: The AI features (/api/exam, /api/score, /api/interview) only work when deployed to Vercel
> because they are serverless functions. Locally, the curriculum tracker and schedule work fully.
> To test AI features locally, install the Vercel CLI: `npm i -g vercel` then run `vercel dev`.

### 5. Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Deploy (follow prompts — accept all defaults)
vercel

# Set your API key as a secret on Vercel
vercel env add ANTHROPIC_API_KEY
# Paste your key when prompted, select all environments
```

### 6. Redeploy with env vars

```bash
vercel --prod
```

Your app is now live at `https://your-project.vercel.app`

---

## Project Structure

```
codingzone/
├── api/                    # Vercel serverless functions
│   ├── exam.ts             # Generate exam questions via Claude
│   ├── score.ts            # Grade student answers via Claude
│   └── interview.ts        # Run mock interview via Claude
├── src/
│   ├── lib/
│   │   ├── curriculum.ts   # All 50 topics from the learning plan
│   │   ├── storage.ts      # localStorage + readiness score calculator
│   │   └── context.tsx     # Global React state (useReducer)
│   ├── pages/
│   │   ├── Dashboard.tsx   # Readiness score + phase overview
│   │   ├── Curriculum.tsx  # Topic checklist + hours tracker
│   │   ├── ExamRoom.tsx    # AI exam generation + grading
│   │   ├── InterviewSim.tsx# Live mock interview simulator
│   │   └── Schedule.tsx    # Weekly calendar + session planner
│   ├── types/index.ts      # All TypeScript types
│   ├── App.tsx             # Router + sidebar layout
│   ├── main.tsx            # React entry point
│   └── index.css           # Global styles
├── .env.example            # Copy to .env.local
├── vercel.json             # Vercel routing config
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## How the readiness score works

The score is computed from your exam history across all topics:

- Each topic has an interview weight (very-high / high / medium / low)
- Higher weight topics contribute more to your score
- Recency-weighted: recent exam scores count more than old ones
- Completing a topic with no exam = 50 points assumed baseline
- Phase weights: Phase 0 = 15%, Phase 1 = 55%, Phase 2 = 30%

**Thresholds:**
- 0–49% → Not ready yet
- 50–69% → Junior-ready
- 70–84% → Mid-level ready  
- 85–100% → Senior-ready

---

## How the AI exam works

1. You select a topic and target role level (junior / mid / senior)
2. Your past exam scores on that topic are sent to Claude
3. Claude generates 3 fresh questions calibrated to your history
4. You paste your answers one at a time
5. Each answer is graded immediately with score, strengths, and improvements
6. Overall session score is saved and updates your readiness score

---

## Adding Vercel KV (optional upgrade for multi-device sync)

If you want your data to sync across devices (phone + laptop):

```bash
# Create a KV store
vercel kv create codingzone-store

# This outputs KV_REST_API_URL and KV_REST_API_TOKEN
# Add them to your Vercel project env vars
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN
```

Then update the API functions to read/write from KV instead of returning data.
The `@vercel/kv` package is already in package.json.

---

## This app IS your first React project

Every feature you use in this app is a pattern you are learning:
- `useReducer` for global state → state management chapter
- `useContext` for passing state → hooks chapter  
- `fetch` + serverless functions → async + API chapter
- `React Router` → routing chapter
- TypeScript throughout → TypeScript chapter

When you get to Phase 2, replace localStorage with a real Node.js + MongoDB backend.
That migration is itself a Phase 2 project.
