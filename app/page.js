'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart2,
  Link2,
  ArrowRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  Download,
  Filter,
} from 'lucide-react';

const SESSION_KEY = 'vidmetrics_result';

/** Returns an inline style that plays a staggered entrance animation. */
function anim(delaySeconds, type = 'up') {
  return {
    animation: `${type === 'up' ? 'fade-in-up' : 'fade-in'} 0.4s ease forwards`,
    animationDelay: `${delaySeconds}s`,
    opacity: 0,
  };
}

const EXAMPLES = [
  { label: '@MrBeast',       url: 'https://www.youtube.com/@MrBeast' },
  { label: '@mkbhd',         url: 'https://www.youtube.com/@mkbhd' },
  { label: '@veritasium',    url: 'https://www.youtube.com/@veritasium' },
  { label: '@LinusTechTips', url: 'https://www.youtube.com/@LinusTechTips' },
];

const FEATURES = [
  {
    icon: TrendingUp,
    title: 'Performance Metrics',
    desc: 'Views, likes, comments, engagement rate, and trending velocity for every video.',
  },
  {
    icon: Filter,
    title: 'Sort & Filter',
    desc: 'Instantly sort by any metric and filter to find exactly what you need.',
  },
  {
    icon: Download,
    title: 'Export Ready',
    desc: 'Download the full analysis as a CSV for reporting and further analysis.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAnalyze(e) {
    e?.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
      router.push('/results');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(239,68,68,0.10) 0%, transparent 60%)',
        }}
      />

      {/* Header */}
      <header className="relative z-20 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <div className="w-9 h-9 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <BarChart2 size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl lg:text-2xl tracking-tight">VidMetrics</span>
          <span className="hidden sm:block text-zinc-600 text-sm lg:text-base ml-1">
            — YouTube Competitor Intelligence
          </span>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 lg:py-24">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center gap-0">

          {/* Badge */}
          <div
            style={anim(0, 'in')}
            className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-1.5 text-xs sm:text-sm text-zinc-400"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            YouTube Analytics Platform
          </div>

          {/* Headline */}
          <h1
            style={anim(0.1)}
            className="mt-7 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
          >
            Analyze Any YouTube
            <br />
            <span className="text-red-400">Channel Instantly</span>
          </h1>

          {/* Subtitle */}
          <p
            style={anim(0.2)}
            className="mt-6 text-zinc-400 text-base sm:text-lg lg:text-xl max-w-xl leading-relaxed"
          >
            Paste a competitor's channel URL and see which videos are crushing it —
            metrics, trends, and insights in seconds.
          </p>

          {/* Form */}
          <form
            onSubmit={handleAnalyze}
            style={anim(0.3)}
            className="mt-8 w-full flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1 relative">
              <Link2
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/@channelname"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-3.5 lg:py-4 text-sm sm:text-base text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed cursor-pointer text-white font-semibold px-6 lg:px-8 py-3.5 lg:py-4 rounded-xl text-sm sm:text-base lg:text-lg transition-all whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  Analyze Channel
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="mt-4 w-full flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm text-left">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick examples */}
          <div
            style={anim(0.4, 'in')}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-xs text-zinc-600">Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => setUrl(ex.url)}
                className="text-xs text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 rounded-full px-3 py-1 transition-all"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature cards */}
        <div
          style={anim(0.5, 'in')}
          className="w-full max-w-3xl mx-auto mt-24 lg:mt-28 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-left"
            >
              <div className="w-8 h-8 bg-red-500/15 rounded-lg flex items-center justify-center mb-3">
                <Icon size={15} className="text-red-400" />
              </div>
              <p className="text-sm lg:text-base font-semibold text-white mb-1">{title}</p>
              <p className="text-xs lg:text-sm text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/60 py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-zinc-600">
          <span>VidMetrics</span>
          <span>Powered by YouTube Data API v3</span>
        </div>
      </footer>
    </div>
  );
}
