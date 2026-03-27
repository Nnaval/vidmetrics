'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatNum, engagementRate, viewVelocity } from '@/lib/utils';

// ─── Metric config ────────────────────────────────────────────────────────────

const METRICS = {
  views: {
    label: 'Views',
    getValue: (v) => v.viewCount,
    format: (n) => `${formatNum(n)} views`,
  },
  likes: {
    label: 'Likes',
    getValue: (v) => v.likeCount,
    format: (n) => `${formatNum(n)} likes`,
  },
  comments: {
    label: 'Comments',
    getValue: (v) => v.commentCount,
    format: (n) => `${formatNum(n)} comments`,
  },
  engagement: {
    label: 'Engagement Rate',
    getValue: (v) => parseFloat(engagementRate(v).toFixed(2)),
    format: (n) => `${n.toFixed(2)}% engagement`,
  },
  velocity: {
    label: 'View Velocity',
    getValue: (v) => Math.round(viewVelocity(v)),
    format: (n) => `${formatNum(n)} views/day`,
  },
  // Date sorting doesn't translate to a bar chart — fall back to views
  date: null,
};

const BAR_COLORS = [
  '#7f1d1d', '#991b1b', '#b91c1c', '#c42020', '#cc2222',
  '#d42424', '#dc2626', '#e53535', '#ef4444', '#f87171',
];

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, metricConfig }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl max-w-[200px]">
      <p className="text-zinc-300 text-xs leading-relaxed line-clamp-2">
        {payload[0]?.payload?.fullTitle}
      </p>
      <p className="text-white font-bold text-sm mt-1">
        {metricConfig.format(payload[0]?.value)}
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TopVideosChart({ videos, sortBy = 'views' }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const activeKey = METRICS[sortBy] ? sortBy : 'views';
  const metricConfig = METRICS[activeKey];

  const titleMaxLen = isMobile ? 18 : 38;
  const yAxisWidth  = isMobile ? 110 : 230;

  const data = [...videos]
    .sort((a, b) => metricConfig.getValue(b) - metricConfig.getValue(a))
    .slice(0, 10)
    .map((v) => ({
      title: v.title.length > titleMaxLen ? v.title.slice(0, titleMaxLen) + '…' : v.title,
      fullTitle: v.title,
      value: metricConfig.getValue(v),
    }))
    .reverse();

  if (!data.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-center h-32 text-zinc-500 text-sm">
        No videos to display.
      </div>
    );
  }

  const chartHeight = Math.max(300, data.length * 44);

  const xTickFormatter =
    activeKey === 'engagement'
      ? (n) => `${n}%`
      : formatNum;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-zinc-300 mb-5">
        Top {data.length} Videos by {metricConfig.label}
      </h3>
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: isMobile ? 8 : 32, bottom: 0, left: 4 }}
          >
            <XAxis
              type="number"
              tickFormatter={xTickFormatter}
              tick={{ fontSize: isMobile ? 10 : 11, fill: '#71717a' }}
              axisLine={false}
              tickLine={false}
              tickCount={isMobile ? 4 : 6}
            />
            <YAxis
              type="category"
              dataKey="title"
              width={yAxisWidth}
              tick={{ fontSize: isMobile ? 10 : 11, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip metricConfig={metricConfig} />}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i] ?? '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
