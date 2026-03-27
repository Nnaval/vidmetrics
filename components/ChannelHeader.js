import { useState } from 'react';
import { formatNum, calculateChannelScore } from '@/lib/utils';
import { Users, Play, Eye, Info } from 'lucide-react';

// ─── Grade colour palette ─────────────────────────────────────────────────────

function gradeStyle(grade) {
  if (grade === 'A+' || grade === 'A') {
    return { border: 'border-green-500', text: 'text-green-400', bg: 'bg-green-500/10', tooltip: 'text-green-300' };
  }
  if (grade === 'B+' || grade === 'B') {
    return { border: 'border-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', tooltip: 'text-amber-300' };
  }
  if (grade === 'C') {
    return { border: 'border-orange-500', text: 'text-orange-400', bg: 'bg-orange-500/10', tooltip: 'text-orange-300' };
  }
  return { border: 'border-red-500', text: 'text-red-400', bg: 'bg-red-500/10', tooltip: 'text-red-300' };
}

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score, grade, breakdown }) {
  const style = gradeStyle(grade);

  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 ${style.border} ${style.bg} flex flex-col items-center justify-center`}
      >
        <span className="text-2xl sm:text-3xl font-bold text-white leading-none">{score}</span>
        <span className={`text-sm sm:text-base font-bold leading-none mt-1 ${style.text}`}>{grade}</span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-zinc-500 font-medium">Channel Score</span>
        <div className="relative group">
          <Info size={12} className="text-zinc-600 cursor-help" />
          <div className="absolute bottom-full right-0 sm:left-1/2 sm:-translate-x-1/2 mb-2.5 z-50 w-60 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 pointer-events-none">
            <div className="absolute top-full right-2 sm:left-1/2 sm:-translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3.5 shadow-2xl">
              <p className="text-xs font-semibold text-white mb-2.5">Score Breakdown</p>
              <div className="space-y-1.5">
                <ScoreRow label="Engagement Rate" weight="40%" pts={breakdown.engagement} max={40} color={style.tooltip} />
                <ScoreRow label="View Velocity"   weight="30%" pts={breakdown.velocity}   max={30} color={style.tooltip} />
                <ScoreRow label="Consistency"     weight="30%" pts={breakdown.consistency} max={30} color={style.tooltip} />
              </div>
              <p className="mt-3 text-[10px] text-zinc-500 leading-relaxed">
                Calculated from the 20 most recent uploads.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ label, weight, pts, max, color }) {
  const pct = Math.round((pts / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-0.5">
        <span className="text-zinc-300">{label}</span>
        <span className="text-zinc-500">{weight} &mdash; {pts}/{max}</span>
      </div>
      <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} bg-current`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChannelHeader({ channel, videos = [] }) {
  const { score, grade, breakdown } = calculateChannelScore(videos);
  const [imgFailed, setImgFailed] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5">

      {/* Top row: avatar + name + score */}
      <div className="flex items-start gap-4">

        {/* Avatar */}
        {channel.thumbnail && !imgFailed ? (
          <img
            src={`/api/image?url=${encodeURIComponent(channel.thumbnail)}`}
            alt={channel.title}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full ring-2 ring-zinc-700 flex-shrink-0 object-cover bg-zinc-800"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full ring-2 ring-zinc-700 flex-shrink-0 bg-zinc-800 flex items-center justify-center text-zinc-400 text-xl font-bold select-none">
            {channel.title?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}

        {/* Name + handle */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h2 className="text-lg sm:text-2xl font-bold text-white leading-tight truncate">
            {channel.title}
          </h2>
          {channel.customUrl && (
            <p className="text-sm text-zinc-500 truncate mt-0.5">{channel.customUrl}</p>
          )}
        </div>

        {/* Score badge — pushed to the right */}
        <ScoreBadge score={score} grade={grade} breakdown={breakdown} />
      </div>

      {/* Description */}
      {channel.description && (
        <div className="mt-3">
          <p className={`text-sm text-zinc-400 leading-relaxed ${descExpanded ? '' : 'line-clamp-2'}`}>
            {channel.description}
          </p>
          <button
            onClick={() => setDescExpanded((v) => !v)}
            className="text-xs text-zinc-500 hover:text-zinc-300 mt-1 transition-colors cursor-pointer"
          >
            {descExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-3">
        <Stat icon={Users} label="Subscribers"  value={formatNum(channel.subscriberCount)} />
        <Stat icon={Play}  label="Total Videos" value={formatNum(channel.videoCount)} />
        <Stat icon={Eye}   label="Total Views"  value={formatNum(channel.viewCount)} />
      </div>

    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-white font-bold text-sm sm:text-base truncate">
        <Icon size={12} className="text-zinc-500 flex-shrink-0" />
        <span className="truncate">{value}</span>
      </div>
      <div className="text-[11px] text-zinc-500 mt-0.5 truncate">{label}</div>
    </div>
  );
}
