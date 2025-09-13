<div align="center">
  <h1>🎧 Sonique</h1>
  <p><em>Feed it a feeling & get a curated, atmospheric playlist with vivid track stories, artwork, video & lyrics.</em></p>
</div>

## ✨ What is Sonique?
Sonique is an AI‑assisted mood → music generator. Describe an emotion, memory, vibe, color palette, weather, aesthetic—anything—and it returns a titled playlist with rich micro‑descriptions for each track. You can open a track to see album art (or a stylized placeholder), watch the YouTube video, and fetch lyrics on demand. The landing hero rotates iconic poster art with animated cosmic visuals and an audio‑reactive pulse.

## 🚀 Features
- Mood → curated playlist (Gemini structured JSON generation)
- Fast mode vs richer descriptions (performance‑first first render)
- Track enrichment: album art (iTunes), YouTube video id, on‑demand lyrics
- Unified side panel: video + lyrics instead of multiple modals
- Deterministic gradient placeholders when art missing
- Animated landing hero (tilt, rotating posters, pulse rings, EQ bars)
- Resilient poster fallback (graceful gradient + initial)
- Timeout + model fallback (2.5 → 1.5) for reliability
- TypeScript types for playlist + tracks

## 🧱 Tech Stack
| Layer | Tech |
|-------|------|
| Framework | React + Vite + TypeScript |
| AI | Google Gemini (`@google/genai`) |
| Media APIs | iTunes Search (album art), YouTube Data (video id) |
| Styling | Tailwind utility classes + custom keyframes |
| Hosting | Netlify (build + deploy) |

## 📦 Getting Started
Prerequisites: Node.js 18+ (recommended), npm.

```bash
npm install
cp .env.example .env        # or create manually
# Edit .env and add keys
npm run dev
```

Visit: http://localhost:5173

## 🔐 Environment Variables
All variables must be prefixed with `VITE_` to be exposed to the client (Vite requirement). These are NOT secret once built—treat them as public tokens with quota limits.

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_GEMINI_API_KEY` | Yes | Gemini content generation (playlist + lyrics) |
| `VITE_YT_API_KEY` | Optional (if video id lookup used) | YouTube video id enrichment |

Local: place them in `.env` (or `.env.local`). Netlify: Site settings → Environment variables → add same keys → trigger new deploy.

## 🛠 Architecture Overview
```
App.tsx             – Orchestrates search, state, conditional hero
components/         – UI pieces (TrackCard, ResultGrid, HomeHero, etc.)
services/geminiService.ts – Playlist + lyrics generation w/ timeout & fallback
services/albumArtService.ts – Album art lookup & placeholder seeding
services/youtubeService.ts  – YouTube video id retrieval
types.ts            – Shared TypeScript interfaces
```

### Flow
1. User enters mood → `findMusic` (fast schema) returns structured playlist.
2. Parallel enrichment attaches album art + YouTube video id.
3. User opens a track → lyrics fetched lazily (only then).
4. Side panel displays video, art/placeholder, description, lyrics.

## ⚡ Performance Choices
- Fast mode trims description verbosity for first paint.
- Lazy lyrics avoids N extra AI calls.
- Deterministic placeholders eliminate layout shift while art loads.
- Model fallback keeps success rates high if primary model times out.

## 🧪 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| "Missing VITE_GEMINI_API_KEY" | Dev server started before `.env` existed | Stop server, add key, restart `npm run dev` |
| "API key invalid" | Revoked / typo / rotated key | Regenerate in AI Studio, update `.env`, redeploy |
| Playlist empty | AI response schema failed | Retry simpler prompt; check console for parsing errors |
| No album art | iTunes miss | Placeholder gradient auto-applies (no action) |

## 🌐 Deployment (Netlify)
1. Add env vars in Netlify UI first.
2. Push code / trigger deploy.
3. After deploy, verify in browser console: `import.meta.env.VITE_GEMINI_API_KEY` (should show masked or value).

## 🔮 Possible Next Enhancements
- Keyboard navigation & accessibility refinements
- Share / export playlist as image or JSON
- Serverless proxy for *true* secret storage (to hide API key)
- Offline caching of last generated playlist
- Theme toggle / reduced‑motion accessibility switch
