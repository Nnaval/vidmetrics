# VidMetrics — YouTube Competitor Intelligence

> Paste a channel URL. Get instant, deep analytics on any YouTube channel in seconds.

---

## Overview

VidMetrics is a SaaS-style analytics platform that lets creators, marketers, and strategists analyze any YouTube channel's recent performance — without needing access to their account.

Enter a competitor's channel URL and instantly see which videos are winning, what engagement looks like, how fast their audience is growing, and how they stack up against other channels. Everything is derived from the public YouTube Data API v3 and presented in a clean, professional dashboard.

---

## Features

- **Channel Analysis by URL** — Supports all YouTube URL formats (`/@handle`, `/channel/`, `/c/`, `/user/`)
- **Video Performance Metrics** — Views, likes, comments, engagement rate, and view velocity (views/day) per video
- **Trending Detection** — Automatically flags videos gaining views 50% faster than the channel average
- **Sort & Filter** — Sort by any metric (views, likes, comments, engagement, velocity, date); filter by minimum views or keyword search
- **Top Videos Bar Chart** — Dynamic horizontal bar chart that updates to reflect whichever metric is active
- **Channel Score** — Proprietary 0–100 score with letter grade (A+ to D) based on engagement, view velocity, and upload consistency
- **Channel Comparison** — Side-by-side comparison of two channels with a metrics table, trophy indicators on every winning row, and a grouped bar chart of top videos
- **Export to CSV** — Download the full analysis as a spreadsheet for reporting or further analysis
- **Responsive Design** — Fully usable on mobile, tablet, and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Charts | [Recharts](https://recharts.org/) |
| Data | [YouTube Data API v3](https://developers.google.com/youtube/v3) |
| Icons | [Lucide React](https://lucide.dev/) |
| Deployment | [Vercel](https://vercel.com/) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [YouTube Data API v3 key](https://console.developers.google.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Nnaval/vidmetrics.git
cd vidmetrics

# 2. Install dependencies
npm install

# 3. Add your API key
# Create a .env file in the project root:
echo "YOUTUBE_API_KEY=your_api_key_here" > .env

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How I Built This

### 1. Data layer first
I started by building the server-side API integration in `lib/youtube.js` — URL parsing, channel lookup, and batched video fetching — before touching any UI. This made the rest of the build much faster because the data contract was already clear.

### 2. Progressive component build
Components were built bottom-up: utilities → data fetching → individual cards → page composition. Each piece was functional in isolation before being wired together, which kept debugging straightforward.

### 3. Real product thinking
Rather than just meeting requirements, I pushed further — adding a Channel Score algorithm, trending detection, channel comparison with winner indicators, and a CSV export. The goal was to build something a real user would actually want to open every day.

### 4. AI-accelerated development
This project was built using **[Claude Code](https://claude.ai/claude-code)** (Anthropic's AI coding tool in VS Code). It significantly accelerated development on the data layer, Recharts integration, and responsive layout work, while I focused on product decisions, UX, and overall architecture direction.

---

## Project Structure

```
vidmetrics/
├── app/
│   ├── api/
│   │   ├── channel/route.js   # POST: analyze a channel
│   │   ├── videos/route.js    # GET: fetch videos for a channel
│   │   └── image/route.js     # GET: image proxy for YouTube avatars
│   ├── page.js                # Landing page
│   ├── results/page.js        # Results & analysis dashboard
│   ├── layout.js
│   └── globals.css
├── components/
│   ├── ChannelHeader.js       # Channel info + score badge
│   ├── ChannelComparison.js   # Side-by-side comparison view
│   ├── CompareModal.js        # Modal for entering comparison URL
│   ├── VideoCard.js           # Individual video card (grid view)
│   ├── SortFilter.js          # Search, sort, and filter controls
│   └── charts/
│       └── TopVideosChart.js  # Dynamic horizontal bar chart
└── lib/
    ├── youtube.js             # YouTube API helpers (server-side only)
    └── utils.js               # Shared formatting and scoring utilities
```

---

## Channel Score Algorithm

The Channel Score (0–100) is calculated from the 20 most recent videos using three weighted factors:

| Factor | Weight | Metric |
|---|---|---|
| Engagement Rate | 40% | Avg (likes + comments) / views |
| View Velocity | 30% | Avg views/day on recent videos (log scale) |
| Upload Consistency | 30% | Upload frequency + regularity (coefficient of variation) |

**Grade scale:** A+ (90–100) · A (80–89) · B+ (70–79) · B (60–69) · C (50–59) · D (< 50)

---

## Roadmap (v2 Ideas)

- [ ] **Historical trend tracking** — Store past analyses and chart a channel's growth over time
- [ ] **Multi-channel dashboard** — Monitor a watchlist of competitors from a single view
- [ ] **AI content strategy suggestions** — Use an LLM to summarize what's working and recommend content angles
- [ ] **Scheduled email reports** — Get a weekly digest on any channel delivered to your inbox
- [ ] **Niche benchmarking** — Compare a channel's score against category averages

---


