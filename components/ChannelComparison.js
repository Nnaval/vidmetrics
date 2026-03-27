'use client';

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Trophy, X } from 'lucide-react';
import { formatNum, engagementRate, viewVelocity, calculateChannelScore } from '@/lib/utils';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeStats(videos, channel) {
  if (!videos.length) return null;
  const avgViews = Math.round(
    videos.reduce((s, v) => s + v.viewCount, 0) / videos.length
  );
  const avgEngagement =
    videos.reduce((s, v) => s + engagementRate(v), 0) / videos.length;
  const avgVelocity =
    videos.reduce((s, v) => s + viewVelocity(v), 0) / videos.length;
  const { score, grade } = calculateChannelScore(videos);
  return {
    subscribers: channel.subscriberCount,
    totalViews: channel.viewCount,
    avgViews,
    avgEngagement,
    avgVelocity,
    score,
    grade,
  };
}

// ─── Comparison table row ─────────────────────────────────────────────────────

function MetricRow({ label, aVal, bVal, aDisplay, bDisplay }) {
  const aWins = aVal > bVal;
  const bWins = bVal > aVal;

  return (
    <tr className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors">
      <td className="px-5 py-3.5 text-sm text-zinc-400 font-medium whitespace-nowrap">
        {label}
      </td>
      <td className="px-5 py-3.5">
        <span
          className={`flex items-center gap-2 text-sm font-semibold ${
            aWins ? 'text-red-400' : 'text-zinc-300'
          }`}
        >
          {aDisplay}
          {aWins && <Trophy size={11} className="text-yellow-400 flex-shrink-0" />}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span
          className={`flex items-center gap-2 text-sm font-semibold ${
            bWins ? 'text-blue-400' : 'text-zinc-300'
          }`}
        >
          {bDisplay}
          {bWins && <Trophy size={11} className="text-yellow-400 flex-shrink-0" />}
        </span>
      </td>
    </tr>
  );
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-zinc-400 font-medium mb-2">Rank #{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1 last:mb-0">
          <div
            className="w-2 h-2 rounded-sm flex-shrink-0"
            style={{ background: p.fill }}
          />
          <span className="text-zinc-300 truncate max-w-[140px]">{p.name}:</span>
          <span className="text-white font-bold ml-auto pl-2">{formatNum(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Channel mini-header card ─────────────────────────────────────────────────

function ChannelMini({ channel, side }) {
  const [imgFailed, setImgFailed] = useState(false);
  const isA = side === 'a';
  const border = isA ? 'border-red-500/25' : 'border-blue-500/25';
  const bg = isA ? 'bg-red-500/5' : 'bg-blue-500/5';
  const labelClasses = isA
    ? 'text-red-400 bg-red-500/10 border-red-500/20'
    : 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  const label = isA ? 'Channel A' : 'Channel B';

  return (
    <div className={`bg-zinc-900 border ${border} ${bg} rounded-xl p-4 flex items-center gap-3.5`}>
      {channel.thumbnail && !imgFailed ? (
        <img
          src={`/api/image?url=${encodeURIComponent(channel.thumbnail)}`}
          alt={channel.title}
          className="w-12 h-12 rounded-full ring-2 ring-zinc-700 flex-shrink-0 object-cover bg-zinc-800"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="w-12 h-12 rounded-full ring-2 ring-zinc-700 flex-shrink-0 bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-base select-none">
          {channel.title?.[0]?.toUpperCase() ?? '?'}
        </div>
      )}
      <div className="min-w-0">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${labelClasses} mb-1.5 inline-block`}
        >
          {label}
        </span>
        <p className="text-base font-extrabold text-white leading-tight truncate">{channel.title}</p>
        {channel.customUrl && (
          <p className="text-xs text-zinc-500 truncate mt-0.5">{channel.customUrl}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChannelComparison({
  channelA,
  videosA,
  channelB,
  videosB,
  onClear,
}) {
  const statsA = useMemo(() => computeStats(videosA, channelA), [videosA, channelA]);
  const statsB = useMemo(() => computeStats(videosB, channelB), [videosB, channelB]);

  // Grouped bar chart: top 5 by views from each channel
  const chartData = useMemo(() => {
    const top5A = [...videosA].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
    const top5B = [...videosB].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
    const len = Math.max(top5A.length, top5B.length);
    return Array.from({ length: len }, (_, i) => ({
      rank: i + 1,
      a: top5A[i]?.viewCount ?? 0,
      b: top5B[i]?.viewCount ?? 0,
    }));
  }, [videosA, videosB]);

  if (!statsA || !statsB) return null;

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h2 className="text-xl font-bold text-white">Channel Comparison</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Side-by-side performance analysis</p>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-1.5 transition-all cursor-pointer"
        >
          <X size={12} />
          Clear Comparison
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-zinc-800" />

      {/* Mini channel headers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ChannelMini channel={channelA} side="a" />
        <ChannelMini channel={channelB} side="b" />
      </div>

      {/* Comparison metrics table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide w-44">
                  Metric
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-red-400/80">
                  {channelA.title}
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-blue-400/80">
                  {channelB.title}
                </th>
              </tr>
            </thead>
            <tbody>
              <MetricRow
                label="Subscribers"
                aVal={statsA.subscribers}
                bVal={statsB.subscribers}
                aDisplay={formatNum(statsA.subscribers)}
                bDisplay={formatNum(statsB.subscribers)}
              />
              <MetricRow
                label="Total Views"
                aVal={statsA.totalViews}
                bVal={statsB.totalViews}
                aDisplay={formatNum(statsA.totalViews)}
                bDisplay={formatNum(statsB.totalViews)}
              />
              <MetricRow
                label="Avg Views / Video"
                aVal={statsA.avgViews}
                bVal={statsB.avgViews}
                aDisplay={formatNum(statsA.avgViews)}
                bDisplay={formatNum(statsB.avgViews)}
              />
              <MetricRow
                label="Avg Engagement"
                aVal={statsA.avgEngagement}
                bVal={statsB.avgEngagement}
                aDisplay={`${statsA.avgEngagement.toFixed(2)}%`}
                bDisplay={`${statsB.avgEngagement.toFixed(2)}%`}
              />
              <MetricRow
                label="Avg View Velocity"
                aVal={statsA.avgVelocity}
                bVal={statsB.avgVelocity}
                aDisplay={`${formatNum(Math.round(statsA.avgVelocity))}/day`}
                bDisplay={`${formatNum(Math.round(statsB.avgVelocity))}/day`}
              />
              <MetricRow
                label="Channel Score"
                aVal={statsA.score}
                bVal={statsB.score}
                aDisplay={`${statsA.score} (${statsA.grade})`}
                bDisplay={`${statsB.score} (${statsB.grade})`}
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Grouped bar chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-0.5">Top 5 Videos by Views</h3>
        <p className="text-xs text-zinc-500 mb-5">Best performing videos from each channel</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barGap={3} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="rank"
              tickFormatter={(v) => `#${v}`}
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatNum}
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: '#a1a1aa', fontSize: 12 }}>{value}</span>
              )}
            />
            <Bar
              dataKey="a"
              name={channelA.title}
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              maxBarSize={44}
            />
            <Bar
              dataKey="b"
              name={channelB.title}
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={44}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
