/**
 * Shared utility functions — safe to use on both client and server.
 */

export function formatNum(n) {
  if (n === undefined || n === null) return '0';
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export function formatDuration(iso) {
  if (!iso || iso === 'PT0S') return '0:00';
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return '0:00';
  const h = parseInt(m[1] ?? 0);
  const min = parseInt(m[2] ?? 0);
  const s = parseInt(m[3] ?? 0);
  if (h > 0) {
    return `${h}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${min}:${String(s).padStart(2, '0')}`;
}

export function formatRelativeDate(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/** Days since a date string, minimum 1 to avoid division by zero. */
export function daysSince(dateStr) {
  return Math.max(1, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000));
}

/** (likes + comments) / views * 100 */
export function engagementRate(video) {
  if (!video.viewCount) return 0;
  return ((video.likeCount + video.commentCount) / video.viewCount) * 100;
}

/** Views per day since publish date. */
export function viewVelocity(video) {
  return video.viewCount / daysSince(video.publishedAt);
}

/**
 * Calculates a 0-100 channel performance score from three weighted factors:
 *   - Engagement rate  (40 pts) — avg (likes + comments) / views
 *   - View velocity    (30 pts) — avg views/day on recent videos (log scale)
 *   - Post consistency (30 pts) — frequency + regularity of publish intervals
 *
 * Returns { score: number, grade: string, breakdown: object }
 */
export function calculateChannelScore(videos) {
  if (!videos?.length) return { score: 0, grade: 'D', breakdown: { engagement: 0, velocity: 0, consistency: 0 } };

  // ── 1. Engagement (40 pts) ────────────────────────────────────────────────
  // Benchmark: 5 %+ = full marks, linear below.
  const avgEng = videos.reduce((s, v) => s + engagementRate(v), 0) / videos.length;
  const engScore = Math.min(40, (avgEng / 5) * 40);

  // ── 2. View velocity (30 pts) — logarithmic scale ─────────────────────────
  // 10 v/d ≈ 0 pts  |  1 K v/d ≈ 15 pts  |  100 K+ v/d = 30 pts
  const avgVel = videos.reduce((s, v) => s + viewVelocity(v), 0) / videos.length;
  const velScore = Math.min(30, Math.max(0, (Math.log10(Math.max(10, avgVel)) - 1) / 4 * 30));

  // ── 3. Consistency (30 pts) ───────────────────────────────────────────────
  let conScore = 15; // neutral default for single-video channels
  if (videos.length >= 2) {
    const sorted = [...videos].sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
    const intervals = [];
    for (let i = 1; i < sorted.length; i++) {
      const days = (new Date(sorted[i].publishedAt) - new Date(sorted[i - 1].publishedAt)) / 86_400_000;
      if (days > 0) intervals.push(days);
    }
    if (intervals.length > 0) {
      const mean = intervals.reduce((s, v) => s + v, 0) / intervals.length;
      const variance = intervals.reduce((s, v) => s + (v - mean) ** 2, 0) / intervals.length;
      const cv = mean > 0 ? Math.sqrt(variance) / mean : 1; // coefficient of variation
      // Frequency: posting at least weekly scores full frequency marks
      const freqFactor = Math.min(1, 7 / Math.max(1, mean));
      // Regularity: lower variance relative to mean = better
      const regFactor = Math.max(0, 1 - Math.min(1, cv));
      conScore = 30 * (freqFactor * 0.5 + regFactor * 0.5);
    }
  }

  const score = Math.min(100, Math.max(0, Math.round(engScore + velScore + conScore)));

  let grade;
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B+';
  else if (score >= 60) grade = 'B';
  else if (score >= 50) grade = 'C';
  else grade = 'D';

  return {
    score,
    grade,
    breakdown: {
      engagement: Math.round(engScore),
      velocity:   Math.round(velScore),
      consistency: Math.round(conScore),
    },
  };
}
